// import { useRef, useState, useEffect } from "react";
// import { Camera } from "@mediapipe/camera_utils";
// import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
// import {
//   Holistic,
//   POSE_CONNECTIONS,
//   FACEMESH_TESSELATION,
//   HAND_CONNECTIONS,
// } from "@mediapipe/holistic";

// const StatusMessage = ({ message }) => {
//   return (
//     <div
//       className={`status-message ${message ? "show" : ""}`}
//       style={{
//         position: "fixed",
//         top: "20px",
//         left: "50%",
//         transform: "translateX(-50%)",
//         background: "rgba(0,0,0,0.7)",
//         color: "white",
//         padding: "10px 20px",
//         borderRadius: "5px",
//         zIndex: 1000,
//         opacity: message ? 1 : 0,
//         transition: "opacity 0.3s ease",
//       }}
//     >
//       {message}
//     </div>
//   );
// };

// const Coach = () => {
//   console.log("Coach activated");
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [statusMessage, setStatusMessage] = useState("");
//   const [cameraError, setCameraError] = useState(false);
//   const [showVideo, setShowVideo] = useState(false);

//   // Set up canvas and video dimensions to match viewport
//   useEffect(() => {
//     const updateDimensions = () => {
//       if (canvasRef.current && videoRef.current) {
//         canvasRef.current.width = window.innerWidth;
//         canvasRef.current.height = window.innerHeight;
//       }
//     };

//     // Initial setup
//     updateDimensions();

//     // Update on resize
//     window.addEventListener("resize", updateDimensions);

//     return () => {
//       window.removeEventListener("resize", updateDimensions);
//     };
//   }, []);

//   useEffect(() => {
//     if (!videoRef.current || !canvasRef.current) return;

//     const videoElement = videoRef.current;
//     const canvasElement = canvasRef.current;
//     const canvasCtx = canvasElement.getContext("2d");

//     let lastStatusMessage = "";
//     let statusTimeout = null;

//     function updateStatusMessage(message) {
//       if (message !== lastStatusMessage) {
//         lastStatusMessage = message;
//         setStatusMessage(message);
//         clearTimeout(statusTimeout);
//       }
//     }

//     function clearStatusMessage() {
//       if (lastStatusMessage !== "") {
//         lastStatusMessage = "";
//         setStatusMessage("");
//         statusTimeout = setTimeout(() => {
//           setStatusMessage("");
//         }, 500);
//       }
//     }

//     let bothHandsUnderStartTime = null;
//     let popUpShown = false;

//     let bothHandsAboveStartTime = null;
//     let eyesPopUpShown = false;

//     function onResults(results) {
//       canvasCtx.save();
//       canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

//       if (results.segmentationMask) {
//         canvasCtx.drawImage(
//           results.segmentationMask,
//           0,
//           0,
//           canvasElement.width,
//           canvasElement.height,
//         );
//         canvasCtx.globalCompositeOperation = "source-in";
//         canvasCtx.fillStyle = "#6b6b6b";
//         canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
//         canvasCtx.globalCompositeOperation = "destination-atop";
//       }

//       canvasCtx.drawImage(
//         results.image,
//         0,
//         0,
//         canvasElement.width,
//         canvasElement.height,
//       );
//       canvasCtx.globalCompositeOperation = "source-over";

//       if (results.poseLandmarks) {
//         drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
//           color: "#00FF00",
//           lineWidth: 4,
//         });
//         drawLandmarks(canvasCtx, results.poseLandmarks, {
//           color: "#FF0000",
//           lineWidth: 2,
//         });
//       }

//       if (results.faceLandmarks) {
//         drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
//           color: "#C0C0C070",
//           lineWidth: 1,
//         });
//       }

//       if (results.leftHandLandmarks) {
//         drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
//           color: "#CC0000",
//           lineWidth: 5,
//         });
//         drawLandmarks(canvasCtx, results.leftHandLandmarks, {
//           color: "#00FF00",
//           lineWidth: 2,
//         });
//       }

//       if (results.rightHandLandmarks) {
//         drawConnectors(
//           canvasCtx,
//           results.rightHandLandmarks,
//           HAND_CONNECTIONS,
//           { color: "#00CC00", lineWidth: 5 },
//         );
//         drawLandmarks(canvasCtx, results.rightHandLandmarks, {
//           color: "#FF0000",
//           lineWidth: 2,
//         });
//       }

//       let lsPx = { x: 0, y: 0 },
//         rsPx = { x: 0, y: 0 };
//       let lSZ = 0,
//         rSZ = 0;

//       if (results.poseLandmarks) {
//         const lS = results.poseLandmarks[11];
//         const rS = results.poseLandmarks[12];

//         lsPx = {
//           x: lS.x * canvasElement.width,
//           y: lS.y * canvasElement.height,
//         };
//         rsPx = {
//           x: rS.x * canvasElement.width,
//           y: rS.y * canvasElement.height,
//         };
//         lSZ = lS.z;
//         rSZ = rS.z;

//         canvasCtx.beginPath();
//         canvasCtx.arc(lsPx.x, lsPx.y, 8, 0, 2 * Math.PI);
//         canvasCtx.fillStyle = "blue";
//         canvasCtx.fill();
//         canvasCtx.beginPath();
//         canvasCtx.arc(rsPx.x, rsPx.y, 8, 0, 2 * Math.PI);
//         canvasCtx.fillStyle = "red";
//         canvasCtx.fill();
//       }

//       canvasCtx.font = "18px sans-serif";
//       canvasCtx.fillStyle = "white";
//       canvasCtx.fillText(
//         `Left Shoulder:  (${Math.round(lsPx.x)}, ${Math.round(lsPx.y)}, z:${lSZ.toFixed(3)})`,
//         10,
//         30,
//       );
//       canvasCtx.fillText(
//         `Right Shoulder: (${Math.round(rsPx.x)}, ${Math.round(rsPx.y)}, z:${rSZ.toFixed(3)})`,
//         10,
//         60,
//       );

//       let hipThresholdOffset = null;
//       let eyeThreshold = null;

//       if (results.poseLandmarks) {
//         const lH = results.poseLandmarks[23];
//         const rH = results.poseLandmarks[24];
//         const rawHipY = (lH.y + rH.y) / 2; // Average hip height
//         hipThresholdOffset = (rawHipY - 0.05) * canvasElement.height; // Move 5% upward

//         const leftEye = results.poseLandmarks[1];
//         const rightEye = results.poseLandmarks[4];
//         eyeThreshold = ((leftEye.y + rightEye.y) / 2) * canvasElement.height;

//         canvasCtx.beginPath();
//         canvasCtx.moveTo(0, eyeThreshold);
//         canvasCtx.lineTo(canvasElement.width, eyeThreshold);
//         canvasCtx.strokeStyle = "lightblue";
//         canvasCtx.stroke();

//         canvasCtx.beginPath();
//         canvasCtx.moveTo(0, hipThresholdOffset);
//         canvasCtx.lineTo(canvasElement.width, hipThresholdOffset);
//         canvasCtx.strokeStyle = "orange";
//         canvasCtx.lineWidth = 1;
//         canvasCtx.stroke();
//       }

//       let leftPalmCenter = null,
//         rightPalmCenter = null;

//       if (results.leftHandLandmarks) {
//         let sumX = 0,
//           sumY = 0;
//         for (const lm of results.leftHandLandmarks) {
//           sumX += lm.x * canvasElement.width;
//           sumY += lm.y * canvasElement.height;
//         }
//         const cx = sumX / results.leftHandLandmarks.length;
//         const cy = sumY / results.leftHandLandmarks.length;
//         leftPalmCenter = { x: cx, y: cy };
//         canvasCtx.beginPath();
//         canvasCtx.arc(cx, cy, 8, 0, 2 * Math.PI);
//         canvasCtx.fillStyle = "yellow";
//         canvasCtx.fill();
//       }

//       if (results.rightHandLandmarks) {
//         let sumX = 0,
//           sumY = 0;
//         for (const lm of results.rightHandLandmarks) {
//           sumX += lm.x * canvasElement.width;
//           sumY += lm.y * canvasElement.height;
//         }
//         const cx = sumX / results.rightHandLandmarks.length;
//         const cy = sumY / results.rightHandLandmarks.length;
//         rightPalmCenter = { x: cx, y: cy };
//         canvasCtx.beginPath();
//         canvasCtx.arc(cx, cy, 8, 0, 2 * Math.PI);
//         canvasCtx.fillStyle = "cyan";
//         canvasCtx.fill();
//       }

//       if (leftPalmCenter && rightPalmCenter && eyeThreshold !== null) {
//         const leftY = leftPalmCenter.y;
//         const rightY = rightPalmCenter.y;
//         const handsAboveEyes = leftY < eyeThreshold && rightY < eyeThreshold;

//         if (handsAboveEyes) {
//           if (bothHandsAboveStartTime === null) {
//             bothHandsAboveStartTime = Date.now();
//             eyesPopUpShown = false;
//           } else if (
//             !eyesPopUpShown &&
//             Date.now() - bothHandsAboveStartTime >= 1000
//           ) {
//             updateStatusMessage("⚠️ Keep your hands below your eyes");
//             eyesPopUpShown = true;
//           }
//         } else {
//           bothHandsAboveStartTime = null;
//           eyesPopUpShown = false;
//           if (!popUpShown) clearStatusMessage();
//         }
//       }

//       if (leftPalmCenter && rightPalmCenter && hipThresholdOffset !== null) {
//         if (
//           leftPalmCenter.y > hipThresholdOffset &&
//           rightPalmCenter.y > hipThresholdOffset
//         ) {
//           if (bothHandsUnderStartTime === null) {
//             bothHandsUnderStartTime = Date.now();
//             popUpShown = false;
//           } else if (
//             !popUpShown &&
//             Date.now() - bothHandsUnderStartTime >= 5000
//           ) {
//             updateStatusMessage("🙌 Hands up");
//             popUpShown = true;
//           }
//         } else {
//           bothHandsUnderStartTime = null;
//           if (!eyesPopUpShown) clearStatusMessage();
//           popUpShown = false;
//         }
//       }



//       canvasCtx.restore();
//     }

//     const holistic = new Holistic({
//       locateFile: (file) =>
//         `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
//     });

//     holistic.setOptions({
//       modelComplexity: 1,
//       smoothLandmarks: true,
//       enableSegmentation: true,
//       smoothSegmentation: true,
//       refineFaceLandmarks: true,
//       minDetectionConfidence: 0.5,
//       minTrackingConfidence: 0.5,
//     });

//     holistic.onResults(onResults);

//     // Request camera permission before creating the Camera instance
//     navigator.mediaDevices
//       .getUserMedia({
//         video: {
//           width: { ideal: window.innerWidth },
//           height: { ideal: window.innerHeight },
//           facingMode: "user",
//         },
//         audio: false,
//       })
//       .then((stream) => {
//         videoElement.srcObject = stream;

//         const camera = new Camera(videoElement, {
//           onFrame: async () => {
//             await holistic.send({ image: videoElement });
//           },
//           width: window.innerWidth,
//           height: window.innerHeight,
//         });

//         try {
//           camera.start();
//           setShowVideo(false); // Hide video element once camera is working
//           setCameraError(false);
//         } catch (error) {
//           console.error("Failed to start camera:", error);
//           setCameraError(true);
//           setShowVideo(true); // Show video element to help debug
//           updateStatusMessage("Camera access error. Please check permissions.");
//         }

//         // Cleanup function
//         return () => {
//           stream.getTracks().forEach((track) => track.stop());
//           camera.stop();
//           holistic.close();
//         };
//       })
//       .catch((err) => {
//         console.error("Error accessing camera:", err);
//         setCameraError(true);
//         updateStatusMessage(
//           "Camera access denied. Please allow camera permissions.",
//         );
//       });
//   }, []);
//   // End of JS code


//   return (
//     <div
//       className="presentation-coach"
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100vw",
//         height: "100vh",
//         overflow: "hidden",
//       }}
//     >
//       {cameraError && (
//         <div
//           className="camera-error"
//           style={{
//             position: "fixed",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             background: "rgba(0,0,0,0.8)",
//             color: "white",
//             padding: "20px",
//             borderRadius: "10px",
//             maxWidth: "80%",
//             zIndex: 1000,
//           }}
//         >
//           <p>Camera access error. Please check that:</p>
//           <ol>
//             <li>You've granted camera permissions</li>
//             <li>Your camera is not being used by another application</li>
//             <li>Your browser supports camera access</li>
//           </ol>
//         </div>
//       )}
//       <video
//         ref={videoRef}
//         className="input_video"
//         style={{
//           display: showVideo ? "block" : "none",
//           width: "100%",
//           height: "100%",
//           objectFit: "cover",
//         }}
//         autoPlay
//         playsInline
//         muted
//       ></video>
//       <canvas
//         ref={canvasRef}
//         className="output_canvas"
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//         }}
//       ></canvas>
//       <StatusMessage message={statusMessage} />
//     </div>
//   );
// };

// export default Coach;


// import { useRef, useState, useEffect } from "react";
// import { Camera } from "@mediapipe/camera_utils";
// import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
// import {
//   Holistic,
//   POSE_CONNECTIONS,
//   FACEMESH_TESSELATION,
//   HAND_CONNECTIONS,
// } from "@mediapipe/holistic";

// const StatusMessage = ({ message }) => {
//   return (
//     <div
//       className={`status-message ${message ? "show" : ""}`}
//       style={{
//         position: "fixed",
//         top: "20px",
//         left: "50%",
//         transform: "translateX(-50%)",
//         background: "rgba(0,0,0,0.7)",
//         color: "white",
//         padding: "10px 20px",
//         borderRadius: "5px",
//         zIndex: 1000,
//         opacity: message ? 1 : 0,
//         transition: "opacity 0.3s ease",
//       }}
//     >
//       {message}
//     </div>
//   );
// };

// const Coach = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [statusMessage, setStatusMessage] = useState("");
//   const [cameraError, setCameraError] = useState(false);
//   const [showVideo, setShowVideo] = useState(false);

//   const movementBuffer = useRef([]);
//   const MAX_BUFFER_SIZE = 90;
//   const MIN_MOVEMENT_THRESHOLD = 120;
//   const MAX_MOVEMENT_THRESHOLD = 1200;

//   useEffect(() => {
//     const updateDimensions = () => {
//       if (canvasRef.current && videoRef.current) {
//         canvasRef.current.width = window.innerWidth;
//         canvasRef.current.height = window.innerHeight;
//       }
//     };
//     updateDimensions();
//     window.addEventListener("resize", updateDimensions);
//     return () => window.removeEventListener("resize", updateDimensions);
//   }, []);

//   useEffect(() => {
//     if (!videoRef.current || !canvasRef.current) return;

//     const videoElement = videoRef.current;
//     const canvasElement = canvasRef.current;
//     const canvasCtx = canvasElement.getContext("2d");

//     let lastStatusMessage = "";
//     let statusTimeout = null;

//     function updateStatusMessage(message) {
//       if (message !== lastStatusMessage) {
//         lastStatusMessage = message;
//         setStatusMessage(message);
//         clearTimeout(statusTimeout);
//       }
//     }

//     function clearStatusMessage() {
//       if (lastStatusMessage !== "") {
//         lastStatusMessage = "";
//         setStatusMessage("");
//         statusTimeout = setTimeout(() => {
//           setStatusMessage("");
//         }, 500);
//       }
//     }

//     let bothHandsUnderStartTime = null;
//     let popUpShown = false;
//     let bothHandsAboveStartTime = null;
//     let eyesPopUpShown = false;

//     function onResults(results) {
//       canvasCtx.save();
//       canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

//       if (results.image) {
//         canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
//       }

//       if (results.poseLandmarks) {
//         drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
//           color: "#00FF00",
//           lineWidth: 4,
//         });
//         drawLandmarks(canvasCtx, results.poseLandmarks, {
//           color: "#FF0000",
//           lineWidth: 2,
//         });
//       }

//       if (results.faceLandmarks) {
//         drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
//           color: "#C0C0C070",
//           lineWidth: 1,
//         });
//       }

//       if (results.leftHandLandmarks) {
//         drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
//           color: "#CC0000",
//           lineWidth: 5,
//         });
//         drawLandmarks(canvasCtx, results.leftHandLandmarks, {
//           color: "#00FF00",
//           lineWidth: 2,
//         });
//       }

//       if (results.rightHandLandmarks) {
//         drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
//           color: "#00CC00",
//           lineWidth: 5,
//         });
//         drawLandmarks(canvasCtx, results.rightHandLandmarks, {
//           color: "#FF0000",
//           lineWidth: 2,
//         });
//       }

//       let hipThresholdOffset = null;
//       let eyeThreshold = null;

//       if (results.poseLandmarks) {
//         const lH = results.poseLandmarks[23];
//         const rH = results.poseLandmarks[24];
//         const rawHipY = (lH.y + rH.y) / 2;
//         hipThresholdOffset = (rawHipY - 0.05) * canvasElement.height;

//         const leftEye = results.poseLandmarks[1];
//         const rightEye = results.poseLandmarks[4];
//         eyeThreshold = ((leftEye.y + rightEye.y) / 2) * canvasElement.height;

//         canvasCtx.beginPath();
//         canvasCtx.moveTo(0, eyeThreshold);
//         canvasCtx.lineTo(canvasElement.width, eyeThreshold);
//         canvasCtx.strokeStyle = "lightblue";
//         canvasCtx.stroke();

//         canvasCtx.beginPath();
//         canvasCtx.moveTo(0, hipThresholdOffset);
//         canvasCtx.lineTo(canvasElement.width, hipThresholdOffset);
//         canvasCtx.strokeStyle = "orange";
//         canvasCtx.lineWidth = 1;
//         canvasCtx.stroke();
//       }

//       let leftPalmCenter = null,
//         rightPalmCenter = null;

//       if (results.leftHandLandmarks) {
//         let sumX = 0,
//           sumY = 0;
//         for (const lm of results.leftHandLandmarks) {
//           sumX += lm.x * canvasElement.width;
//           sumY += lm.y * canvasElement.height;
//         }
//         leftPalmCenter = {
//           x: sumX / results.leftHandLandmarks.length,
//           y: sumY / results.leftHandLandmarks.length,
//         };
//       }

//       if (results.rightHandLandmarks) {
//         let sumX = 0,
//           sumY = 0;
//         for (const lm of results.rightHandLandmarks) {
//           sumX += lm.x * canvasElement.width;
//           sumY += lm.y * canvasElement.height;
//         }
//         rightPalmCenter = {
//           x: sumX / results.rightHandLandmarks.length,
//           y: sumY / results.rightHandLandmarks.length,
//         };
//       }

//       if (leftPalmCenter && rightPalmCenter && eyeThreshold !== null) {
//         const leftY = leftPalmCenter.y;
//         const rightY = rightPalmCenter.y;
//         const handsAboveEyes = leftY < eyeThreshold && rightY < eyeThreshold;

//         if (handsAboveEyes) {
//           if (bothHandsAboveStartTime === null) {
//             bothHandsAboveStartTime = Date.now();
//             eyesPopUpShown = false;
//           } else if (!eyesPopUpShown && Date.now() - bothHandsAboveStartTime >= 1000) {
//             updateStatusMessage("⚠️ Keep your hands below your eyes");
//             eyesPopUpShown = true;
//           }
//         } else {
//           bothHandsAboveStartTime = null;
//           eyesPopUpShown = false;
//           if (!popUpShown) clearStatusMessage();
//         }
//       }

//       if (leftPalmCenter && rightPalmCenter && hipThresholdOffset !== null) {
//         if (
//           leftPalmCenter.y > hipThresholdOffset &&
//           rightPalmCenter.y > hipThresholdOffset
//         ) {
//           if (bothHandsUnderStartTime === null) {
//             bothHandsUnderStartTime = Date.now();
//             popUpShown = false;
//           } else if (!popUpShown && Date.now() - bothHandsUnderStartTime >= 5000) {
//             updateStatusMessage("🙌 Hands up");
//             popUpShown = true;
//           }
//         } else {
//           bothHandsUnderStartTime = null;
//           if (!eyesPopUpShown) clearStatusMessage();
//           popUpShown = false;
//         }
//       }

//       // Movement feature
//       if (results.poseLandmarks) {
//         const coreIndices = [11, 12, 23, 24];
//         let sumX = 0,
//           sumY = 0;
//         for (const i of coreIndices) {
//           const lm = results.poseLandmarks[i];
//           sumX += lm.x * canvasElement.width;
//           sumY += lm.y * canvasElement.height;
//         }
//         const avgPoint = {
//           x: sumX / coreIndices.length,
//           y: sumY / coreIndices.length,
//           timestamp: Date.now(),
//         };

//         movementBuffer.current.push(avgPoint);
//         if (movementBuffer.current.length > MAX_BUFFER_SIZE) {
//           movementBuffer.current.shift();
//         }

//         let totalDistance = 0;
//         for (let i = 1; i < movementBuffer.current.length; i++) {
//           const dx = movementBuffer.current[i].x - movementBuffer.current[i - 1].x;
//           const dy = movementBuffer.current[i].y - movementBuffer.current[i - 1].y;
//           totalDistance += Math.sqrt(dx * dx + dy * dy);
//         }

//         if (movementBuffer.current.length >= MAX_BUFFER_SIZE) {
//           if (totalDistance < MIN_MOVEMENT_THRESHOLD) {
//             updateStatusMessage("🏃 Be more active");
//           } else if (totalDistance > MAX_MOVEMENT_THRESHOLD) {
//             updateStatusMessage("🧘 Try to be a bit calmer");
//           } else if (!eyesPopUpShown && !popUpShown) {
//             clearStatusMessage();
//           }
//         }
//       }

//       canvasCtx.restore();
//     }

//     const holistic = new Holistic({
//       locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
//     });

//     holistic.setOptions({
//       modelComplexity: 1,
//       smoothLandmarks: true,
//       enableSegmentation: true,
//       smoothSegmentation: true,
//       refineFaceLandmarks: true,
//       minDetectionConfidence: 0.5,
//       minTrackingConfidence: 0.5,
//       segmentationMode: "video",
//     });

//     holistic.onResults(onResults);

//     navigator.mediaDevices
//       .getUserMedia({
//         video: {
//           width: { ideal: window.innerWidth },
//           height: { ideal: window.innerHeight },
//           facingMode: "user",
//         },
//         audio: false,
//       })
//       .then((stream) => {
//         videoElement.srcObject = stream;
//         const camera = new Camera(videoElement, {
//           onFrame: async () => {
//             await holistic.send({ image: videoElement });
//           },
//           width: window.innerWidth,
//           height: window.innerHeight,
//         });

//         try {
//           camera.start();
//           setShowVideo(false);
//           setCameraError(false);
//         } catch (err) {
//           setCameraError(true);
//           setShowVideo(true);
//           updateStatusMessage("Camera access error. Please check permissions.");
//         }

//         return () => {
//           stream.getTracks().forEach((track) => track.stop());
//           camera.stop();
//           holistic.close();
//         };
//       })
//       .catch((err) => {
//         setCameraError(true);
//         updateStatusMessage("Camera access denied. Please allow camera permissions.");
//       });
//   }, []);

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100vw",
//         height: "100vh",
//         overflow: "hidden",
//       }}
//     >
//       {cameraError && (
//         <div
//           style={{
//             position: "fixed",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             background: "rgba(0,0,0,0.8)",
//             color: "white",
//             padding: "20px",
//             borderRadius: "10px",
//             maxWidth: "80%",
//             zIndex: 1000,
//           }}
//         >
//           <p>Camera access error. Please check that:</p>
//           <ol>
//             <li>You've granted camera permissions</li>
//             <li>Your camera is not being used by another application</li>
//             <li>Your browser supports camera access</li>
//           </ol>
//         </div>
//       )}
//       <video
//         ref={videoRef}
//         style={{
//           display: showVideo ? "block" : "none",
//           width: "100%",
//           height: "100%",
//           objectFit: "cover",
//         }}
//         autoPlay
//         playsInline
//         muted
//       ></video>
//       <canvas
//         ref={canvasRef}
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//         }}
//       ></canvas>
//       <StatusMessage message={statusMessage} />
//     </div>
//   );
// };

// export default Coach;



// import { useRef, useState, useEffect } from "react";
// import { Camera } from "@mediapipe/camera_utils";
// import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
// import {
//   Holistic,
//   POSE_CONNECTIONS,
//   FACEMESH_TESSELATION,
//   HAND_CONNECTIONS,
// } from "@mediapipe/holistic";

// const StatusMessage = ({ message }) => {
//   return (
//     <div
//       className={`status-message ${message ? "show" : ""}`}
//       style={{
//         position: "fixed",
//         top: "20px",
//         left: "50%",
//         transform: "translateX(-50%)",
//         background: "rgba(0,0,0,0.7)",
//         color: "white",
//         padding: "10px 20px",
//         borderRadius: "5px",
//         zIndex: 1000,
//         opacity: message ? 1 : 0,
//         transition: "opacity 0.6s ease",
//       }}
//     >
//       {message}
//     </div>
//   );
// };

// const Coach = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [statusMessage, setStatusMessage] = useState("");
//   const [cameraError, setCameraError] = useState(false);
//   const [showVideo, setShowVideo] = useState(false);

//   const batchBuffer = useRef([]);
//   const BATCH_SIZE = 60;
//   const MIN_MOVEMENT_THRESHOLD = 150;
//   const MAX_MOVEMENT_THRESHOLD = 1800;
//   const lastMovementStatus = useRef("");

//   useEffect(() => {
//     const updateDimensions = () => {
//       if (canvasRef.current && videoRef.current) {
//         canvasRef.current.width = window.innerWidth;
//         canvasRef.current.height = window.innerHeight;
//       }
//     };
//     updateDimensions();
//     window.addEventListener("resize", updateDimensions);
//     return () => window.removeEventListener("resize", updateDimensions);
//   }, []);

//   useEffect(() => {
//     if (!videoRef.current || !canvasRef.current) return;

//     const videoElement = videoRef.current;
//     const canvasElement = canvasRef.current;
//     const canvasCtx = canvasElement.getContext("2d");

//     let lastStatusMessage = "";
//     let statusTimeout = null;

//     function updateStatusMessage(message) {
//       if (message !== lastStatusMessage) {
//         lastStatusMessage = message;
//         setStatusMessage(message);
//         clearTimeout(statusTimeout);
//         statusTimeout = setTimeout(() => {
//           setStatusMessage("");
//           lastStatusMessage = "";
//         }, 2000);
//       }
//     }

//     function clearStatusMessage() {
//       if (lastStatusMessage !== "") {
//         lastStatusMessage = "";
//         setStatusMessage("");
//         clearTimeout(statusTimeout);
//       }
//     }

//     let bothHandsUnderStartTime = null;
//     let popUpShown = false;
//     let bothHandsAboveStartTime = null;
//     let eyesPopUpShown = false;

//     function onResults(results) {
//       canvasCtx.save();
//       canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

//       if (results.image) {
//         canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
//       }

//       if (results.poseLandmarks) {
//         drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
//           color: "#00FF00",
//           lineWidth: 4,
//         });
//         drawLandmarks(canvasCtx, results.poseLandmarks, {
//           color: "#FF0000",
//           lineWidth: 2,
//         });
//       }

//       if (results.faceLandmarks) {
//         drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
//           color: "#C0C0C070",
//           lineWidth: 1,
//         });
//       }

//       if (results.leftHandLandmarks) {
//         drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
//           color: "#CC0000",
//           lineWidth: 5,
//         });
//         drawLandmarks(canvasCtx, results.leftHandLandmarks, {
//           color: "#00FF00",
//           lineWidth: 2,
//         });
//       }

//       if (results.rightHandLandmarks) {
//         drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
//           color: "#00CC00",
//           lineWidth: 5,
//         });
//         drawLandmarks(canvasCtx, results.rightHandLandmarks, {
//           color: "#FF0000",
//           lineWidth: 2,
//         });
//       }

//       let hipThresholdOffset = null;
//       let eyeThreshold = null;

//       if (results.poseLandmarks) {
//         const lH = results.poseLandmarks[23];
//         const rH = results.poseLandmarks[24];
//         const rawHipY = (lH.y + rH.y) / 2;
//         hipThresholdOffset = (rawHipY - 0.05) * canvasElement.height;

//         const leftEye = results.poseLandmarks[1];
//         const rightEye = results.poseLandmarks[4];
//         eyeThreshold = ((leftEye.y + rightEye.y) / 2) * canvasElement.height;

//         canvasCtx.beginPath();
//         canvasCtx.moveTo(0, eyeThreshold);
//         canvasCtx.lineTo(canvasElement.width, eyeThreshold);
//         canvasCtx.strokeStyle = "lightblue";
//         canvasCtx.stroke();

//         canvasCtx.beginPath();
//         canvasCtx.moveTo(0, hipThresholdOffset);
//         canvasCtx.lineTo(canvasElement.width, hipThresholdOffset);
//         canvasCtx.strokeStyle = "orange";
//         canvasCtx.lineWidth = 1;
//         canvasCtx.stroke();
//       }

//       let leftPalmCenter = null, rightPalmCenter = null;

//       if (results.leftHandLandmarks) {
//         let sumX = 0, sumY = 0;
//         for (const lm of results.leftHandLandmarks) {
//           sumX += lm.x * canvasElement.width;
//           sumY += lm.y * canvasElement.height;
//         }
//         leftPalmCenter = {
//           x: sumX / results.leftHandLandmarks.length,
//           y: sumY / results.leftHandLandmarks.length,
//         };
//       }

//       if (results.rightHandLandmarks) {
//         let sumX = 0, sumY = 0;
//         for (const lm of results.rightHandLandmarks) {
//           sumX += lm.x * canvasElement.width;
//           sumY += lm.y * canvasElement.height;
//         }
//         rightPalmCenter = {
//           x: sumX / results.rightHandLandmarks.length,
//           y: sumY / results.rightHandLandmarks.length,
//         };
//       }

//       if (leftPalmCenter && rightPalmCenter && eyeThreshold !== null) {
//         const handsAboveEyes = leftPalmCenter.y < eyeThreshold && rightPalmCenter.y < eyeThreshold;
//         if (handsAboveEyes) {
//           if (bothHandsAboveStartTime === null) {
//             bothHandsAboveStartTime = Date.now();
//             eyesPopUpShown = false;
//           } else if (!eyesPopUpShown && Date.now() - bothHandsAboveStartTime >= 1000) {
//             updateStatusMessage("⚠️ Keep your hands below your eyes");
//             eyesPopUpShown = true;
//             lastMovementStatus.current = "";
//           }
//         } else {
//           bothHandsAboveStartTime = null;
//           eyesPopUpShown = false;
//         }
//       }

//       if (leftPalmCenter && rightPalmCenter && hipThresholdOffset !== null) {
//         if (leftPalmCenter.y > hipThresholdOffset && rightPalmCenter.y > hipThresholdOffset) {
//           if (bothHandsUnderStartTime === null) {
//             bothHandsUnderStartTime = Date.now();
//             popUpShown = false;
//           } else if (!popUpShown && Date.now() - bothHandsUnderStartTime >= 5000) {
//             updateStatusMessage("🙌 Hands up");
//             popUpShown = true;
//             lastMovementStatus.current = "";
//           }
//         } else {
//           bothHandsUnderStartTime = null;
//           popUpShown = false;
//         }
//       }

//       if (results.poseLandmarks) {
//         const coreIndices = [11, 12, 23, 24];
//         let sumX = 0, sumY = 0;
//         for (const i of coreIndices) {
//           const lm = results.poseLandmarks[i];
//           sumX += lm.x * canvasElement.width;
//           sumY += lm.y * canvasElement.height;
//         }
//         const avgPoint = {
//           x: sumX / coreIndices.length,
//           y: sumY / coreIndices.length,
//           timestamp: Date.now(),
//         };

//         batchBuffer.current.push(avgPoint);
//         if (batchBuffer.current.length >= BATCH_SIZE) {
//           let totalDistance = 0;
//           for (let i = 1; i < batchBuffer.current.length; i++) {
//             const dx = batchBuffer.current[i].x - batchBuffer.current[i - 1].x;
//             const dy = batchBuffer.current[i].y - batchBuffer.current[i - 1].y;
//             totalDistance += Math.sqrt(dx * dx + dy * dy);
//           }

//           if (!eyesPopUpShown && !popUpShown) {
//             if (totalDistance < MIN_MOVEMENT_THRESHOLD && lastMovementStatus.current !== "low") {
//               updateStatusMessage("🏃 Be more active");
//               lastMovementStatus.current = "low";
//             } else if (totalDistance > MAX_MOVEMENT_THRESHOLD && lastMovementStatus.current !== "high") {
//               updateStatusMessage("🧘 Try to be a bit calmer");
//               lastMovementStatus.current = "high";
//             } else if (
//               totalDistance >= MIN_MOVEMENT_THRESHOLD &&
//               totalDistance <= MAX_MOVEMENT_THRESHOLD &&
//               lastMovementStatus.current !== "normal"
//             ) {
//               clearStatusMessage();
//               lastMovementStatus.current = "normal";
//             }
//           }

//           batchBuffer.current = [];
//         }
//       }

//       canvasCtx.restore();
//     }

//     const holistic = new Holistic({
//       locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
//     });

//     holistic.setOptions({
//       modelComplexity: 1,
//       smoothLandmarks: true,
//       enableSegmentation: true,
//       smoothSegmentation: true,
//       refineFaceLandmarks: true,
//       minDetectionConfidence: 0.5,
//       minTrackingConfidence: 0.5,
//       segmentationMode: "video",
//     });

//     holistic.onResults(onResults);

//     navigator.mediaDevices
//       .getUserMedia({
//         video: {
//           width: { ideal: window.innerWidth },
//           height: { ideal: window.innerHeight },
//           facingMode: "user",
//         },
//         audio: false,
//       })
//       .then((stream) => {
//         videoElement.srcObject = stream;
//         const camera = new Camera(videoElement, {
//           onFrame: async () => {
//             await holistic.send({ image: videoElement });
//           },
//           width: window.innerWidth,
//           height: window.innerHeight,
//         });

//         try {
//           camera.start();
//           setShowVideo(false);
//           setCameraError(false);
//         } catch (err) {
//           setCameraError(true);
//           setShowVideo(true);
//           updateStatusMessage("Camera access error. Please check permissions.");
//         }

//         return () => {
//           stream.getTracks().forEach((track) => track.stop());
//           camera.stop();
//           holistic.close();
//         };
//       })
//       .catch((err) => {
//         setCameraError(true);
//         updateStatusMessage("Camera access denied. Please allow camera permissions.");
//       });
//   }, []);

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100vw",
//         height: "100vh",
//         overflow: "hidden",
//       }}
//     >
//       {cameraError && (
//         <div
//           style={{
//             position: "fixed",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             background: "rgba(0,0,0,0.8)",
//             color: "white",
//             padding: "20px",
//             borderRadius: "10px",
//             maxWidth: "80%",
//             zIndex: 1000,
//           }}
//         >
//           <p>Camera access error. Please check that:</p>
//           <ol>
//             <li>You've granted camera permissions</li>
//             <li>Your camera is not being used by another application</li>
//             <li>Your browser supports camera access</li>
//           </ol>
//         </div>
//       )}
//       <video
//         ref={videoRef}
//         style={{
//           display: showVideo ? "block" : "none",
//           width: "100%",
//           height: "100%",
//           objectFit: "cover",
//         }}
//         autoPlay
//         playsInline
//         muted
//       ></video>
//       <canvas
//         ref={canvasRef}
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//         }}
//       ></canvas>
//       <StatusMessage message={statusMessage} />
//     </div>
//   );
// };

// export default Coach;


// Import necessary React hooks and Mediapipe utilities
import { useRef, useState, useEffect } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
  Holistic,
  POSE_CONNECTIONS,
  FACEMESH_TESSELATION,
  HAND_CONNECTIONS,
} from "@mediapipe/holistic";

// A functional component to display status messages on the screen
const StatusMessage = ({ message }) => {
  return (
    <div
      className={`status-message ${message ? "show" : ""}`}
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)", // centers the box horizontally
        background: "rgba(0,0,0,0.7)", // semi-transparent black
        color: "white",
        padding: "10px 20px",
        borderRadius: "5px",
        zIndex: 1000,
        opacity: message ? 1 : 0, // only show when there's a message
        transition: "opacity 0.6s ease",
      }}
    >
      {message}
    </div>
  );
};

// Main component that handles camera, canvas, and pose detection
const Coach = () => {
  // Refs to access video and canvas elements directly
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // State to manage status messages and camera status
  const [statusMessage, setStatusMessage] = useState("");
  const [cameraError, setCameraError] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Buffer to store recent movement points
  const batchBuffer = useRef([]);
  const BATCH_SIZE = 60; // Number of frames to evaluate movement
  const MIN_MOVEMENT_THRESHOLD = 150; // Too little movement
  const MAX_MOVEMENT_THRESHOLD = 1800; // Too much movement
  const lastMovementStatus = useRef(""); // Tracks last feedback given

  // Adjust canvas size when window resizes
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
    function updateStatusMessage(message) {
      if (message !== lastStatusMessage) {
        lastStatusMessage = message;
        setStatusMessage(message);
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
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
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
        drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
          color: "#00CC00",
          lineWidth: 5,
        });
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
      let leftPalmCenter = null, rightPalmCenter = null;

      if (results.leftHandLandmarks) {
        let sumX = 0, sumY = 0;
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
        let sumX = 0, sumY = 0;
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
        const handsAboveEyes = leftPalmCenter.y < eyeThreshold && rightPalmCenter.y < eyeThreshold;
        if (handsAboveEyes) {
          if (bothHandsAboveStartTime === null) {
            bothHandsAboveStartTime = Date.now();
            eyesPopUpShown = false;
          } else if (!eyesPopUpShown && Date.now() - bothHandsAboveStartTime >= 1000) {
            updateStatusMessage("⚠️ Keep your hands below your eyes");
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
        if (leftPalmCenter.y > hipThresholdOffset && rightPalmCenter.y > hipThresholdOffset) {
          if (bothHandsUnderStartTime === null) {
            bothHandsUnderStartTime = Date.now();
            popUpShown = false;
          } else if (!popUpShown && Date.now() - bothHandsUnderStartTime >= 5000) {
            updateStatusMessage("🙌 Hands up");
            popUpShown = true;
            lastMovementStatus.current = "";
          }
        } else {
          bothHandsUnderStartTime = null;
          popUpShown = false;
        }
      }

      // Movement detection logic
      if (results.poseLandmarks) {
        const coreIndices = [11, 12, 23, 24]; // shoulders and hips
        let sumX = 0, sumY = 0;
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
          if (!eyesPopUpShown && !popUpShown) {
            if (totalDistance < MIN_MOVEMENT_THRESHOLD && lastMovementStatus.current !== "low") {
              updateStatusMessage("🏃 Be more active");
              lastMovementStatus.current = "low";
            } else if (totalDistance > MAX_MOVEMENT_THRESHOLD && lastMovementStatus.current !== "high") {
              updateStatusMessage("🧘 Try to be a bit calmer");
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
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
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
          updateStatusMessage("Camera access error. Please check permissions.");
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
        updateStatusMessage("Camera access denied. Please allow camera permissions.");
      });
  }, []);

  // Render HTML elements: canvas, video, status messages
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Error display if camera is blocked or unavailable */}
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
            borderRadius: "10px",
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

      {/* Video stream element */}
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

      {/* Drawing canvas for pose overlays */}
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

      {/* Dynamic message overlay */}
      <StatusMessage message={statusMessage} />
    </div>
  );
};

export default Coach;
