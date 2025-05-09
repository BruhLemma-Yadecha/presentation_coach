import { useRef, useState, useEffect, useCallback } from "react";
import Feedback from "./Feedback.jsx";
import {
  POSE_CONNECTIONS,
  FACEMESH_TESSELATION,
  HAND_CONNECTIONS,
} from "@mediapipe/holistic";
import Timeline from "./Timeline.jsx";
import EVALUATION_TYPES from "./EvaluationTypes";
import {
  initializeHolisticModel,
  HolisticResults,
} from "./lib/holisticService";
import { setupCamera } from "./lib/cameraService";
import {
  clearCanvas,
  restoreCanvas,
  BackgroundImage,
  Pose,
  FaceMesh,
  Hand,
  ThresholdLine,
  DebugText,
  PerspectiveLine,
  LandmarkArc,
} from "./lib/drawingUtils";
import {
  updateStatus as updateFeedbackStatus,
  clearStatus as clearFeedbackStatus,
  TimelineEntry,
  getStatusClearer,
} from "./lib/feedbackService";
import {
  checkHandGestures,
  HandGestureState,
  PalmCenter,
} from "./lib/gestureService";

// Constants
const BATCH_SIZE = 60; // Number of frames to evaluate movement
const MIN_MOVEMENT_THRESHOLD = 150; // Too little movement
const MAX_MOVEMENT_THRESHOLD = 1800; // Too much movement
const TIMELINE_MAX_ENTRIES = 16;
const SLOUCH_ANGLE_THRESHOLD = 3; // degrees
const SLOUCH_SMOOTH_WINDOW = 5;

interface CoachProps {
  setHistory: React.Dispatch<React.SetStateAction<TimelineEntry[]>>;
  setEnd: React.Dispatch<React.SetStateAction<boolean>>; // Assuming setEnd is to signal end of session
}

const Coach: React.FC<CoachProps> = ({ setHistory, setEnd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [statusMessage, setStatusMessage] = useState<string>("");
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const batchBuffer = useRef<
    Array<{ x: number; y: number; timestamp: number }>
  >([]);
  const lastMovementStatus = useRef<string>("");
  const lastSlouchStatus = useRef<boolean>(false);

  // Gesture detection state refs
  const bothHandsUnderStartTimeRef = useRef<number | null>(null);
  const popUpShownRef = useRef<boolean>(false);
  const bothHandsAboveStartTimeRef = useRef<number | null>(null);
  const eyesPopUpShownRef = useRef<boolean>(false);

  // Slouch detection refs
  const slouchBaselineRef = useRef<number | null>(null);
  const slouchHistoryRef = useRef<number[]>([]);

  const updateStatusMessageHandler = useCallback(
    (message: string, evaluationType: EVALUATION_TYPES) => {
      const { newStatusMessage, newTimelineEntries } = updateFeedbackStatus(
        message,
        evaluationType,
        setHistory,
        timelineEntries, // Pass current timelineEntries from state
        TIMELINE_MAX_ENTRIES,
      );
      setStatusMessage(newStatusMessage);
      setTimelineEntries(newTimelineEntries);

      // Setup timeout to clear the message from UI
      const clearMessage = getStatusClearer(setStatusMessage);
      setTimeout(clearMessage, 2000);
    },
    [setHistory, timelineEntries],
  );

  const clearStatusMessageHandler = useCallback(() => {
    const { newStatusMessage } = clearFeedbackStatus();
    setStatusMessage(newStatusMessage);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current && videoRef.current) {
        // Set canvas dimensions based on its parent or a fixed size
        // For fullscreen-like behavior, ensure parent containers allow this.
        const parentWidth =
          canvasRef.current.parentElement?.clientWidth || window.innerWidth;
        const parentHeight =
          canvasRef.current.parentElement?.clientHeight || window.innerHeight;
        canvasRef.current.width = parentWidth;
        canvasRef.current.height = parentHeight;
        // Video dimensions can be handled by CSS (object-fit) or set here if needed
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const onResults = useCallback(
    (results: HolisticResults) => {
      if (!canvasRef.current || !videoRef.current) return;
      const canvasElement = canvasRef.current;
      const canvasCtx = canvasElement.getContext("2d");
      if (!canvasCtx) return;

      clearCanvas(canvasCtx, canvasElement);
      if (results.image) {
        BackgroundImage(canvasCtx, results.image, canvasElement);
      }

      if (results.poseLandmarks) {
        Pose(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 4,
        });
      }
      if (results.faceLandmarks) {
        FaceMesh(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
          color: "#C0C0C070",
          lineWidth: 1,
        });
      }
      if (results.leftHandLandmarks) {
        Hand(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
          color: "#CC0000",
          lineWidth: 5,
        });
      }
      if (results.rightHandLandmarks) {
        Hand(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
          color: "#00CC00",
          lineWidth: 5,
        });
      }

      const gestureState: HandGestureState = {
        bothHandsUnderStartTime: bothHandsUnderStartTimeRef.current,
        popUpShown: popUpShownRef.current,
        bothHandsAboveStartTime: bothHandsAboveStartTimeRef.current,
        eyesPopUpShown: eyesPopUpShownRef.current,
        lastMovementStatusRef: lastMovementStatus, // Pass the ref itself
      };

      const gestureCheckResult = checkHandGestures(
        results,
        canvasElement,
        gestureState,
        updateStatusMessageHandler,
      );

      // Update refs from gestureCheckResult
      bothHandsUnderStartTimeRef.current =
        gestureCheckResult.bothHandsUnderStartTime;
      popUpShownRef.current = gestureCheckResult.popUpShown;
      bothHandsAboveStartTimeRef.current =
        gestureCheckResult.bothHandsAboveStartTime;
      eyesPopUpShownRef.current = gestureCheckResult.eyesPopUpShown;

      if (gestureCheckResult.eyeThreshold !== null) {
        ThresholdLine(
          canvasCtx,
          gestureCheckResult.eyeThreshold,
          canvasElement.width,
          "lightblue",
        );
      }
      if (gestureCheckResult.hipThresholdOffset !== null) {
        ThresholdLine(
          canvasCtx,
          gestureCheckResult.hipThresholdOffset,
          canvasElement.width,
          "orange",
        );
      }

      // Slouch and Movement Detection (Ported from original, needs further modularization if desired)
      if (results.poseLandmarks) {
        const leftShoulder = results.poseLandmarks[11];
        const rightShoulder = results.poseLandmarks[12];
        let chinPoint: { x: number; y: number; z: number } | null = null;

        if (results.faceLandmarks && results.faceLandmarks[152]) {
          const chin = results.faceLandmarks[152];
          if (
            chin &&
            chin.x !== undefined &&
            chin.y !== undefined &&
            chin.z !== undefined
          ) {
            chinPoint = {
              x: chin.x * canvasElement.width,
              y: chin.y * canvasElement.height,
              z: chin.z,
            };
          }
        }

        if (chinPoint && leftShoulder && rightShoulder) {
          const avgShoulder = {
            x: ((leftShoulder.x + rightShoulder.x) / 2) * canvasElement.width,
            y: ((leftShoulder.y + rightShoulder.y) / 2) * canvasElement.height,
            z: (leftShoulder.z + rightShoulder.z) / 2,
          };

          const dx = avgShoulder.x - chinPoint.x;
          const dy = avgShoulder.y - chinPoint.y;
          const dz = (avgShoulder.z - chinPoint.z) * canvasElement.width; // Multiplying dz by width for scaling, as in original
          const shoulderToChinDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const shoulderToChinDistanceY = Math.abs(dy);

          const ratio = Math.min(
            1,
            Math.max(0, shoulderToChinDistanceY / shoulderToChinDistance),
          );
          const slouchAngleRad = Math.asin(ratio);
          const rawSlouchAngleDeg = (slouchAngleRad * 180) / Math.PI;

          if (slouchBaselineRef.current === null) {
            slouchBaselineRef.current = rawSlouchAngleDeg;
          }
          let correctedAngle = Math.max(
            0,
            rawSlouchAngleDeg - (slouchBaselineRef.current || 0),
          );

          slouchHistoryRef.current.push(correctedAngle);
          if (slouchHistoryRef.current.length > SLOUCH_SMOOTH_WINDOW) {
            slouchHistoryRef.current.shift();
          }
          const smoothedAngle =
            slouchHistoryRef.current.reduce((a, b) => a + b, 0) /
            slouchHistoryRef.current.length;

          DebugText(
            canvasCtx,
            `Shoulder–Chin: ${shoulderToChinDistance.toFixed(1)} px`,
            20,
            30,
            "lightgreen",
          );
          DebugText(
            canvasCtx,
            `Vertical: ${shoulderToChinDistanceY.toFixed(1)} px`,
            20,
            50,
            "skyblue",
          );
          DebugText(
            canvasCtx,
            `Angle: ${smoothedAngle.toFixed(1)}°`,
            20,
            70,
            "orange",
          );

          PerspectiveLine(canvasCtx, avgShoulder, chinPoint, [255, 0, 0], 1.5);
          LandmarkArc(canvasCtx, avgShoulder, 5, "rgba(255, 0, 0, 0.9)");
          LandmarkArc(canvasCtx, chinPoint, 5, "rgba(200, 50, 50, 0.9)");

          if (
            smoothedAngle > SLOUCH_ANGLE_THRESHOLD &&
            !lastSlouchStatus.current
          ) {
            updateStatusMessageHandler(
              "📢 Stand up straight, you're slouching!",
              EVALUATION_TYPES.SLOUCHING,
            );
            lastSlouchStatus.current = true;
          } else if (
            smoothedAngle <= SLOUCH_ANGLE_THRESHOLD &&
            lastSlouchStatus.current
          ) {
            // clearStatusMessageHandler(); // Or specific message for good posture
            lastSlouchStatus.current = false;
          }
        }

        // Movement tracking
        const coreIndices = [11, 12, 23, 24]; // shoulders and hips
        let sumX = 0,
          sumY = 0;
        for (const i of coreIndices) {
          const lm = results.poseLandmarks[i];
          if (lm) {
            sumX += lm.x * canvasElement.width;
            sumY += lm.y * canvasElement.height;
          }
        }
        if (coreIndices.every((i) => results.poseLandmarks[i])) {
          const avgPoint = {
            x: sumX / coreIndices.length,
            y: sumY / coreIndices.length,
            timestamp: Date.now(),
          };
          batchBuffer.current.push(avgPoint);
        }

        if (batchBuffer.current.length >= BATCH_SIZE) {
          let totalDistance = 0;
          for (let i = 1; i < batchBuffer.current.length; i++) {
            const dx = batchBuffer.current[i].x - batchBuffer.current[i - 1].x;
            const dy = batchBuffer.current[i].y - batchBuffer.current[i - 1].y;
            totalDistance += Math.sqrt(dx * dx + dy * dy);
          }

          if (
            !popUpShownRef.current &&
            !eyesPopUpShownRef.current &&
            !lastSlouchStatus.current
          ) {
            if (
              totalDistance < MIN_MOVEMENT_THRESHOLD &&
              lastMovementStatus.current !== "low"
            ) {
              updateStatusMessageHandler(
                "🏃 Be more active",
                EVALUATION_TYPES.LOW_MOVEMENT,
              );
              lastMovementStatus.current = "low";
            } else if (
              totalDistance > MAX_MOVEMENT_THRESHOLD &&
              lastMovementStatus.current !== "high"
            ) {
              updateStatusMessageHandler(
                "🧘 Try to be a bit calmer",
                EVALUATION_TYPES.HIGH_MOVEMENT,
              );
              lastMovementStatus.current = "high";
            } else if (
              totalDistance >= MIN_MOVEMENT_THRESHOLD &&
              totalDistance <= MAX_MOVEMENT_THRESHOLD &&
              lastMovementStatus.current !== "normal"
            ) {
              clearStatusMessageHandler();
              lastMovementStatus.current = "normal";
            }
          }
          batchBuffer.current = [];
        }
      }
      restoreCanvas(canvasCtx);
    },
    [
      updateStatusMessageHandler,
      clearStatusMessageHandler,
      setHistory,
      timelineEntries,
    ], // Added dependencies
  );

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;
    const holisticModel = initializeHolisticModel(onResults);

    let cleanupCamera: (() => void) | null = null;

    const startCamera = async () => {
      cleanupCamera = await setupCamera({
        videoElement,
        holisticModel,
        onCameraError: (message, type) => {
          setCameraError(true);
          setShowVideo(true); // Show video element if there's a camera error to guide user
          updateStatusMessageHandler(message, type);
        },
      });
      if (cleanupCamera) {
        setShowVideo(false); // Hide video element if camera starts successfully
        setCameraError(false);
      }
    };

    startCamera();

    return () => {
      if (cleanupCamera) {
        cleanupCamera();
      }
      holisticModel.close();
    };
  }, [onResults, updateStatusMessageHandler]); // Added onResults and updateStatusMessageHandler

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden",}}>
      {/* Video and Canvas Layer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10,
        }}
      >
        {cameraError && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "20px",
              borderRadius: "20px",
              maxWidth: "80%",
              zIndex: 1000,
              textAlign: "center",
            }}
          >
            <p>Camera access error. Please check that:</p>
            <ol style={{ textAlign: "left", display: "inline-block" }}>
              <li>You've granted camera permissions</li>
              <li>Your camera is not being used by another application</li>
              <li>Your browser supports camera access</li>
            </ol>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
          }}>
          <video
            ref={videoRef}
            style={{
              position: "absolute",
              left: "1%",
              display: showVideo ? "block" : "none",
              width: "auto",
              height: "100vh",
              alignContent: "center",
              alignItems: "center",
            }}
            autoPlay
            playsInline
            muted
          />

          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "auto",
              height: "100vh",
              display: cameraError ? "none" : "block",
              zIndex: 20,
            }}
          />
         </div> 
      </div>

      {/* Timeline Panel (Top Left Corner) */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          width: "25%",
          height: "60%",
          zIndex: 50,
          background: "rgba(0, 0, 0, 0.21)",
          borderRadius: "12px",
          padding: "10px",
          overflowY: "auto",
          scrollbarWidth:"none",
        }}
      >
        <Timeline entries={timelineEntries} />
      </div>

      {/* Feedback Panel (Bottom Center) */}
      <div
        style={{
          position: "absolute",
          bottom: "60px",
          left: "45%",
          transform: "translateX(-50%)",
          width: "60%",
          zIndex: 50,
          background: "rgba(0, 0, 0, 0.22)",
          borderRadius: "12px",
          padding: "1em",
          maxHeight: "30%",
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        <Feedback entries={timelineEntries} />
      </div>
    </div>
  );
};

export default Coach;

{/* //  */}