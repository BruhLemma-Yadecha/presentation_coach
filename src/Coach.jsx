import { useRef, useState, useEffect } from "react";
import Feedback from "./Feedback.jsx";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
  Holistic,
  POSE_CONNECTIONS,
  FACEMESH_TESSELATION,
  HAND_CONNECTIONS,
} from "@mediapipe/holistic";
import Timeline from "./Timeline.jsx";

// Evaluation types constants
const EVALUATION_TYPES = {
  HANDS_ABOVE_EYES: "hands_above_eyes",
  HANDS_BELOW_HIPS: "hands_below_hips",
  LOW_MOVEMENT: "low_movement",
  HIGH_MOVEMENT: "high_movement",
  NORMAL_MOVEMENT: "normal_movement",
  CAMERA_ERROR: "camera_error",
  SLOUCHING: "slouching", // New evaluation type for slouch detection
};

// Main component that handles camera, canvas, and pose detection
const Coach = ({ setHistory, setEnd }) => {
  // Refs to access video and canvas elements directly
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // State to manage status messages and camera status
  const [statusMessage, setStatusMessage] = useState("");
  const [cameraError, setCameraError] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [hasCheckedHands, setHasCheckedHands] = useState(true);

  // Grace period for hand detection
  useEffect(() => {
    setTimeout(() => {
      setHasCheckedHands(false);
    }, 5000);
  }, []);

  const resetHandChecker = () => {
    setTimeout(() => {
      setHasCheckedHands(false);
    }, 5000);
  };

  // Buffer to store recent movement points
  const batchBuffer = useRef([]);
  const BATCH_SIZE = 60; // Number of frames to evaluate movement
  const MIN_MOVEMENT_THRESHOLD = 150; // Too little movement
  const MAX_MOVEMENT_THRESHOLD = 1800; // Too much movement
  const lastMovementStatus = useRef(""); // Tracks last feedback given
  const TIMELINE_MAX_ENTRIES = 16;

  // Slouch detection tracking
  const lastSlouchStatus = useRef(false);

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current && videoRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Main pose tracking logic inside useEffect
  useEffect(() => {
    // Exit early if DOM elements are not ready
    if (!videoRef.current || !canvasRef.current) return;

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    let lastStatusMessage = "";
    let statusTimeout = null;

    // Function to show temporary messages
    function updateStatusMessage(message, evaluationType) {
      const new_entry = {
        message,
        timestamp: Date.now(),
        type: evaluationType,
      };
      // Add it to the total history alongside a timestamp
      setHistory((prev) => {
        const next = [...prev, new_entry];
        return next;
      });

      if (message !== lastStatusMessage) {
        lastStatusMessage = message;
        setStatusMessage(message);
        setTimelineEntries((prev) => {
          const next = [...prev, new_entry];
          if (next.length > TIMELINE_MAX_ENTRIES) {
            next.shift(); // Remove oldest
          }
          return next;
        });
        clearTimeout(statusTimeout);
        statusTimeout = setTimeout(() => {
          setStatusMessage("");
          lastStatusMessage = "";
        }, 2000); // Auto-hide after 2 seconds
      }
    }

    // Clears the currently shown message immediately
    function clearStatusMessage() {
      if (lastStatusMessage !== "") {
        lastStatusMessage = "";
        setStatusMessage("");
        clearTimeout(statusTimeout);
      }
    }

    // For gesture timers
    let bothHandsUnderStartTime = null;
    let popUpShown = false;
    let bothHandsAboveStartTime = null;
    let eyesPopUpShown = false;

    // Main callback function when pose detection results are available
    function onResults(results) {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Draw the camera image onto the canvas
      if (results.image) {
        canvasCtx.drawImage(
          results.image,
          0,
          0,
          canvasElement.width,
          canvasElement.height,
        );
      }

      // Draw pose skeleton
      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 4,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });
      }

      // Draw face mesh
      if (results.faceLandmarks) {
        drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
          color: "#C0C0C070",
          lineWidth: 1,
        });
      }

      // Draw left hand
      if (results.leftHandLandmarks) {
        drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
          color: "#CC0000",
          lineWidth: 5,
        });
        drawLandmarks(canvasCtx, results.leftHandLandmarks, {
          color: "#00FF00",
          lineWidth: 2,
        });
      }

      // Draw right hand
      if (results.rightHandLandmarks) {
        drawConnectors(
          canvasCtx,
          results.rightHandLandmarks,
          HAND_CONNECTIONS,
          {
            color: "#00CC00",
            lineWidth: 5,
          },
        );
        drawLandmarks(canvasCtx, results.rightHandLandmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });
      }

      // Thresholds for gestures
      let hipThresholdOffset = null;
      let eyeThreshold = null;

      // Calculate horizontal lines for eye and hip thresholds
      if (results.poseLandmarks) {
        const lH = results.poseLandmarks[23]; // left hip
        const rH = results.poseLandmarks[24]; // right hip
        const rawHipY = (lH.y + rH.y) / 2;
        hipThresholdOffset = (rawHipY - 0.05) * canvasElement.height;

        const leftEye = results.poseLandmarks[1];
        const rightEye = results.poseLandmarks[4];
        eyeThreshold = ((leftEye.y + rightEye.y) / 2) * canvasElement.height;

        // Draw eye threshold line
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, eyeThreshold);
        canvasCtx.lineTo(canvasElement.width, eyeThreshold);
        canvasCtx.strokeStyle = "lightblue";
        canvasCtx.stroke();

        // Draw hip threshold offset line
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, hipThresholdOffset);
        canvasCtx.lineTo(canvasElement.width, hipThresholdOffset);
        canvasCtx.strokeStyle = "orange";
        canvasCtx.lineWidth = 1;
        canvasCtx.stroke();
      }

      // Get average hand position for both hands
      let leftPalmCenter = null,
        rightPalmCenter = null;

      if (results.leftHandLandmarks) {
        let sumX = 0,
          sumY = 0;
        for (const lm of results.leftHandLandmarks) {
          sumX += lm.x * canvasElement.width;
          sumY += lm.y * canvasElement.height;
        }
        leftPalmCenter = {
          x: sumX / results.leftHandLandmarks.length,
          y: sumY / results.leftHandLandmarks.length,
        };
      }

      if (results.rightHandLandmarks) {
        let sumX = 0,
          sumY = 0;
        for (const lm of results.rightHandLandmarks) {
          sumX += lm.x * canvasElement.width;
          sumY += lm.y * canvasElement.height;
        }
        rightPalmCenter = {
          x: sumX / results.rightHandLandmarks.length,
          y: sumY / results.rightHandLandmarks.length,
        };
      }

      // Warning if both hands are above the eyes
      if (leftPalmCenter && rightPalmCenter && eyeThreshold !== null) {
        const handsAboveEyes =
          leftPalmCenter.y < eyeThreshold && rightPalmCenter.y < eyeThreshold;
        if (handsAboveEyes) {
          if (bothHandsAboveStartTime === null) {
            bothHandsAboveStartTime = Date.now();
            eyesPopUpShown = false;
          } else if (
            !eyesPopUpShown &&
            Date.now() - bothHandsAboveStartTime >= 1000
          ) {
            updateStatusMessage(
              "⚠️ Keep your hands below your eyes",
              EVALUATION_TYPES.HANDS_ABOVE_EYES,
            );
            eyesPopUpShown = true;
            lastMovementStatus.current = "";
          }
        } else {
          bothHandsAboveStartTime = null;
          eyesPopUpShown = false;
        }
      }

      // Warning if both hands are below the hips
      if (leftPalmCenter && rightPalmCenter && hipThresholdOffset !== null) {
        if (
          leftPalmCenter.y > hipThresholdOffset &&
          rightPalmCenter.y > hipThresholdOffset
        ) {
          if (bothHandsUnderStartTime === null) {
            bothHandsUnderStartTime = Date.now();
            popUpShown = false;
          } else if (
            !popUpShown &&
            Date.now() - bothHandsUnderStartTime >= 5000
          ) {
            updateStatusMessage(
              "🙌 Hands up",
              EVALUATION_TYPES.HANDS_BELOW_HIPS,
            );
            popUpShown = true;
            lastMovementStatus.current = "";
          }
        } else {
          bothHandsUnderStartTime = null;
          popUpShown = false;
        }
      }

      

      // No hands detected
      // if (
      //   !results.leftHandLandmarks &&
      //   !results.rightHandLandmarks &&
      //   !popUpShown &&
      //   !eyesPopUpShown
      // ) {
      //   if (hasCheckedHands) {
      //     setTimeout(() => {
      //       updateStatusMessage(
      //         "🤚 No hands detected",
      //         EVALUATION_TYPES.HANDS_ABOVE_EYES,
      //       );
      //       lastMovementStatus.current = "No hands detected";
      //       setHasCheckedHands(true);
      //       resetHandChecker();
      //     }
      //     , 5000);
      //   } else {
      //   }
      //   bothHandsAboveStartTime = null;
      //   bothHandsUnderStartTime = null;
      //   eyesPopUpShown = false;
      //   popUpShown = false;
      //   lastSlouchStatus.current = false; // Reset slouch status when no hands
      //   return;
      // }

      // Movement detection logic
      if (results.poseLandmarks) {
        // Slouch detection - New feature from Coach2.jsx
        const leftShoulder = results.poseLandmarks[11];
        const rightShoulder = results.poseLandmarks[12];

        // Fix: Use face mesh for chin instead of pose landmarks
        // The chin is not available in pose landmarks (which only go up to index 32)
        let chinPoint = null;

        if (results.faceLandmarks) {
          // console.log("Chin landmark:", results.faceLandmarks?.[152]);
          // Use bottom of the face (chin area) from face mesh
          // Index 152 is on the chin in faceLandmarks
          const chin = results.faceLandmarks[152];

          if (chin && chin.x !== undefined && chin.y !== undefined && chin.z !== undefined) {
            chinPoint = {
              x: chin.x * canvasElement.width,
              y: chin.y * canvasElement.height,
              z: chin.z,
            };
          } else {
            // console.warn("Chin data incomplete — skipping slouch detection.");
            return; 
          }

          // console.log("Chin point ready for slouch: ", chinPoint);
        }

        // Average shoulder position with z
        const avgShoulder = {
          x: ((leftShoulder.x + rightShoulder.x) / 2) * canvasElement.width,
          y: ((leftShoulder.y + rightShoulder.y) / 2) * canvasElement.height,
          z: (leftShoulder.z + rightShoulder.z) / 2,
        };

        // Only proceed with slouch detection if we have both shoulders and chin
        if (chinPoint) {
          // Calculate distance from shoulder to chin
          const dx = avgShoulder.x - chinPoint.x;
          const dy = avgShoulder.y - chinPoint.y;
          const dz = (avgShoulder.z - chinPoint.z) * canvasElement.width;

          const shoulderToChinDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const shoulderToChinDistanceY = Math.abs(dy);

          // Calculate slouch angle
          // const slouchAngle = Math.asin(
          //   shoulderToChinDistanceY / shoulderToChinDistance,
          // );
          // const slouchAngleDeg = (slouchAngle * 180) / Math.PI;
          const slouchAngleThreshold = 3; // degrees


          const ratio = Math.min(1, Math.max(0, shoulderToChinDistanceY / shoulderToChinDistance));
          const slouchAngle = Math.asin(ratio); 
          const slouchAngleDeg = (slouchAngle * 180) / Math.PI; 


          let slouchBaseline = null;
          let slouchHistory = [];
          const SLOUCH_SMOOTH_WINDOW = 5;
          

          // const useSlouchTracking = (canvasElement, canvasCtx, slouchAngleDeg) => {
          const rawSlouchAngle = slouchAngleDeg;

          //   if (slouchBaseline.current === null) {
          //     slouchBaseline.current = rawSlouchAngle;
          //   }
  
          //   slouchHistory.current.push(correctedAngle);
          //   if (slouchHistory.current.length > SLOUCH_SMOOTH_WINDOW) {
          //     slouchHistory.current.shift();
          //   }

          //   // Average the recent values
          //   const smoothedAngle = slouchHistory.current.reduce((a, b) => a + b, 0) / slouchHistory.current.length;

            
          // }

          const useSlouchTracking = (canvasElement, canvasCtx, slouchAngleDeg) => {
            // If baseline hasn't been set, use current posture as baseline
            if (slouchBaseline === null) {
              slouchBaseline = slouchAngleDeg;
            }
          
            let correctedAngle = Math.max(0, slouchAngleDeg - slouchBaseline);
          
            // Add to smoothing window
            slouchHistory.push(correctedAngle);
            if (slouchHistory.length > SLOUCH_SMOOTH_WINDOW) {
              slouchHistory.shift();
            }
          
            // Average the recent values
            const smoothedAngle =
              slouchHistory.reduce((a, b) => a + b, 0) /
              slouchHistory.length;
          

            return {
              smoothedAngle,
              correctedAngle,
              resetSlouchBaseline: () => {
                slouchBaseline = null;
                slouchHistory = [];
                // console.log("🛠️ Slouch baseline reset.");
              },
            };
          };

          // correctAngle - accounts for normal posture not being perfectly upright
          const correctAngle = Math.max(0, rawSlouchAngle - slouchBaseline);

          // // Draw background bar
          // canvasCtx.beginPath();
          // canvasCtx.rect(meterX, meterY, meterWidth, meterHeight);
          // canvasCtx.fillStyle = "gray";
          // canvasCtx.fill();

          // // Draw filled posture level
          // canvasCtx.beginPath();
          // canvasCtx.rect(meterX, meterY + meterHeight - fillHeight, meterWidth, fillHeight);
          // canvasCtx.fillStyle = meterColor;
          // canvasCtx.fill();

          // // Draw label
          // canvasCtx.font = "14px Arial";
          // canvasCtx.fillStyle = "white";
          // canvasCtx.fillText(postureLabel, meterX - 140, meterY + meterHeight + 20);

          // Display slouch information on canvas
          canvasCtx.font = "16px Arial";
          canvasCtx.fillStyle = "lightgreen";
          canvasCtx.fillText(`Shoulder–Chin: ${shoulderToChinDistance.toFixed(1)} px`,20, 30, );
          canvasCtx.fillStyle = "skyblue";
          canvasCtx.fillText(`Vertical: ${shoulderToChinDistanceY.toFixed(1)} px`, 20, 50,);
          canvasCtx.fillStyle = "orange";
          canvasCtx.fillText(`Angle: ${correctAngle.toFixed(1)}°`, 20, 70);


          // 3D thingy to simulate depth by adjusting line thickness based on Z
          const scaleZ = (z) => Math.max(0.5, 1 + z * 3);
          const brightnessZ = (z) => Math.max(0, Math.min(255, 255 - z * 100));
          
          const shoulderScale = scaleZ(avgShoulder.z);
          const chinScale = scaleZ(chinPoint.z); 
          const midZ = (avgShoulder.z + chinPoint.z) / 2; 
          const brightness = brightnessZ(midZ);

          // Drawing th line with per perspec stroke thingy
          canvasCtx.beginPath();
          canvasCtx.moveTo(avgShoulder.x, avgShoulder.y);
          canvasCtx.lineTo(chinPoint.x, chinPoint.y);
          canvasCtx.strokeStyle = `rgb(${brightness}, 0, 0)`; // red with depth shading
          canvasCtx.lineWidth = (shoulderScale + chinScale) * 1.5;
          canvasCtx.stroke();

          // Draw shoulder point
          canvasCtx.beginPath();
          canvasCtx.arc(avgShoulder.x, avgShoulder.y, 5 * shoulderScale, 0, 2 * Math.PI);
          canvasCtx.fillStyle = `rgba(255, 0, 0, 0.9)`;
          canvasCtx.fill();

          // Draw chin point
          canvasCtx.beginPath();
          canvasCtx.arc(chinPoint.x, chinPoint.y, 5 * chinScale, 0, 2 * Math.PI);
          canvasCtx.fillStyle = `rgba(200, 50, 50, 0.9)`;
          canvasCtx.fill();


          // Send slouching feedback if needed
          if (
            correctAngle > slouchAngleThreshold &&
            !lastSlouchStatus.current
          ) {
            updateStatusMessage(
              "📢 Stand up straight, you're slouching!",
              EVALUATION_TYPES.SLOUCHING,
            );
            lastSlouchStatus.current = true;
          } else if (
            correctAngle <= slouchAngleThreshold &&
            lastSlouchStatus.current
          ) {
            lastSlouchStatus.current = false;
          }
        }

        // Movement tracking (uses core points for movement detection)
        const coreIndices = [11, 12, 23, 24]; // shoulders and hips
        let sumX = 0,
          sumY = 0;
        for (const i of coreIndices) {
          const lm = results.poseLandmarks[i];
          sumX += lm.x * canvasElement.width;
          sumY += lm.y * canvasElement.height;
        }
        const avgPoint = {
          x: sumX / coreIndices.length,
          y: sumY / coreIndices.length,
          timestamp: Date.now(),
        };

        batchBuffer.current.push(avgPoint);

        // Evaluate movement if batch size reached
        if (batchBuffer.current.length >= BATCH_SIZE) {
          let totalDistance = 0;
          for (let i = 1; i < batchBuffer.current.length; i++) {
            const dx = batchBuffer.current[i].x - batchBuffer.current[i - 1].x;
            const dy = batchBuffer.current[i].y - batchBuffer.current[i - 1].y;
            totalDistance += Math.sqrt(dx * dx + dy * dy);
          }

          // Display feedback based on total movement
          if (!eyesPopUpShown && !popUpShown && !lastSlouchStatus.current) {
            if (
              totalDistance < MIN_MOVEMENT_THRESHOLD &&
              lastMovementStatus.current !== "low"
            ) {
              updateStatusMessage(
                "🏃 Be more active",
                EVALUATION_TYPES.LOW_MOVEMENT,
              );
              lastMovementStatus.current = "low";
            } else if (
              totalDistance > MAX_MOVEMENT_THRESHOLD &&
              lastMovementStatus.current !== "high"
            ) {
              updateStatusMessage(
                "🧘 Try to be a bit calmer",
                EVALUATION_TYPES.HIGH_MOVEMENT,
              );
              lastMovementStatus.current = "high";
            } else if (
              totalDistance >= MIN_MOVEMENT_THRESHOLD &&
              totalDistance <= MAX_MOVEMENT_THRESHOLD &&
              lastMovementStatus.current !== "normal"
            ) {
              clearStatusMessage();
              lastMovementStatus.current = "normal";
            }
          }

          batchBuffer.current = [];
        }
      }

      canvasCtx.restore();
    }

    // Initialize Mediapipe Holistic model
    const holistic = new Holistic({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    });

    // Set model options
    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      segmentationMode: "video",
    });

    holistic.onResults(onResults); // Set callback handler

    // Get webcam stream and initialize camera
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: window.innerWidth },
          height: { ideal: window.innerHeight },
          facingMode: "user", // front camera
        },
        audio: false,
      })
      .then((stream) => {
        videoElement.srcObject = stream;
        const camera = new Camera(videoElement, {
          onFrame: async () => {
            await holistic.send({ image: videoElement });
          },
          width: window.innerWidth,
          height: window.innerHeight,
        });

        try {
          camera.start();
          setShowVideo(false);
          setCameraError(false);
        } catch (err) {
          setCameraError(true);
          setShowVideo(true);
          updateStatusMessage(
            "Camera access error. Please check permissions.",
            EVALUATION_TYPES.CAMERA_ERROR,
          );
        }

        // Cleanup function
        return () => {
          stream.getTracks().forEach((track) => track.stop());
          camera.stop();
          holistic.close();
        };
      })
      .catch((err) => {
        setCameraError(true);
        updateStatusMessage(
          "Camera access denied. Please allow camera permissions.",
          EVALUATION_TYPES.CAMERA_ERROR,
        );
      });
  }, []);

  // Render HTML elements: canvas, video, status messages
  return (
    <div>
      <div style={{ width: "70%" }}>
        <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            height: "70vh",
            zIndex: 100,
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {cameraError && (
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0,0,0,0.8)",
                color: "white",
                padding: "20px",
                borderRadius: "20px",
                maxWidth: "80%",
                zIndex: 1000,
              }}
            >
              <p>Camera access error. Please check that:</p>
              <ol>
                <li>You've granted camera permissions</li>
                <li>Your camera is not being used by another application</li>
                <li>Your browser supports camera access</li>
              </ol>
            </div>
          )}
          <video
            ref={videoRef}
            style={{
              display: showVideo ? "block" : "none",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            autoPlay
            playsInline
            muted
          ></video>
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          ></canvas>
        </div>
        <div
          style={{
            position: "fixed",
            top: 10,
            left: 10,
            width: "28%",
            color: "white",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Timeline entries={timelineEntries} />
          </div>
        </div>
      </div>
      <div>
        <div
          style={{
            position: "fixed",
            bottom: 10,
            right: 10,
            height: "25vh",
            width: "70%",
            padding: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            textAlign: "center",
            borderRadius: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <Feedback entries={timelineEntries} />
        </div>
      </div>
    </div>
  );
};

export default Coach;



          





