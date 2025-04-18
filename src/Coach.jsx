import { useRef, useState, useEffect } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Holistic, POSE_CONNECTIONS, FACEMESH_TESSELATION, HAND_CONNECTIONS } from '@mediapipe/holistic';

const StatusMessage = ({ message }) => {
  return (
    <div className={`status-message ${message ? 'show' : ''}`} style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '5px',
      zIndex: 1000,
      opacity: message ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }}>
      {message}
    </div>
  );
};

const Coach = () => {
    console.log('Coach activated');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [cameraError, setCameraError] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    
    // Set up canvas and video dimensions to match viewport
    useEffect(() => {
        const updateDimensions = () => {
            if (canvasRef.current && videoRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        
        // Initial setup
        updateDimensions();
        
        // Update on resize
        window.addEventListener('resize', updateDimensions);
        
        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);
    
    useEffect(() => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext('2d');
        
        let lastStatusMessage = "";
        let statusTimeout = null;
        
        function updateStatusMessage(message) {
            if (message !== lastStatusMessage) {
                lastStatusMessage = message;
                setStatusMessage(message);
                clearTimeout(statusTimeout);
            }
        }
        
        function clearStatusMessage() {
            if (lastStatusMessage !== "") {
                lastStatusMessage = "";
                setStatusMessage('');
                statusTimeout = setTimeout(() => {
                    setStatusMessage('');
                }, 500);
            }
        }
        
        let bothHandsUnderStartTime = null;
        let popUpShown = false;
        
        let bothHandsAboveStartTime = null;
        let eyesPopUpShown = false;
        
        function onResults(results) {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            
            if (results.segmentationMask) {
                canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
                canvasCtx.globalCompositeOperation = 'source-in';
                canvasCtx.fillStyle = '#6b6b6b';
                canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
                canvasCtx.globalCompositeOperation = 'destination-atop';
            }
            
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.globalCompositeOperation = 'source-over';
            
            if (results.poseLandmarks) {
                drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
                drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
            }
            
            if (results.faceLandmarks) {
                drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
            }
            
            if (results.leftHandLandmarks) {
                drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 5 });
                drawLandmarks(canvasCtx, results.leftHandLandmarks, { color: '#00FF00', lineWidth: 2 });
            }
            
            if (results.rightHandLandmarks) {
                drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 5 });
                drawLandmarks(canvasCtx, results.rightHandLandmarks, { color: '#FF0000', lineWidth: 2 });
            }
            
            let lsPx = { x: 0, y: 0 }, rsPx = { x: 0, y: 0 };
            let lSZ = 0, rSZ = 0;
            
            if (results.poseLandmarks) {
                const lS = results.poseLandmarks[11];
                const rS = results.poseLandmarks[12];
                
                lsPx = { x: lS.x * canvasElement.width, y: lS.y * canvasElement.height };
                rsPx = { x: rS.x * canvasElement.width, y: rS.y * canvasElement.height };
                lSZ = lS.z;
                rSZ = rS.z;
                
                canvasCtx.beginPath();
                canvasCtx.arc(lsPx.x, lsPx.y, 8, 0, 2 * Math.PI);
                canvasCtx.fillStyle = 'blue';
                canvasCtx.fill();
                canvasCtx.beginPath();
                canvasCtx.arc(rsPx.x, rsPx.y, 8, 0, 2 * Math.PI);
                canvasCtx.fillStyle = 'red';
                canvasCtx.fill();
            }
            
            canvasCtx.font = '18px sans-serif';
            canvasCtx.fillStyle = 'white';
            canvasCtx.fillText(`Left Shoulder:  (${Math.round(lsPx.x)}, ${Math.round(lsPx.y)}, z:${lSZ.toFixed(3)})`, 10, 30);
            canvasCtx.fillText(`Right Shoulder: (${Math.round(rsPx.x)}, ${Math.round(rsPx.y)}, z:${rSZ.toFixed(3)})`, 10, 60);
            
            let hipThresholdOffset = null;
            let eyeThreshold = null;
            
            if (results.poseLandmarks) {
                const lH = results.poseLandmarks[23];
                const rH = results.poseLandmarks[24];
                const rawHipY = (lH.y + rH.y) / 2;     // Average hip height
                hipThresholdOffset = (rawHipY - 0.05) * canvasElement.height; // Move 5% upward
                
                const leftEye = results.poseLandmarks[1];
                const rightEye = results.poseLandmarks[4];
                eyeThreshold = ((leftEye.y + rightEye.y) / 2) * canvasElement.height;
                
                canvasCtx.beginPath();
                canvasCtx.moveTo(0, eyeThreshold);
                canvasCtx.lineTo(canvasElement.width, eyeThreshold);
                canvasCtx.strokeStyle = 'lightblue';
                canvasCtx.stroke();
                
                canvasCtx.beginPath();
                canvasCtx.moveTo(0, hipThresholdOffset);
                canvasCtx.lineTo(canvasElement.width, hipThresholdOffset);
                canvasCtx.strokeStyle = 'orange';
                canvasCtx.lineWidth = 1;
                canvasCtx.stroke();
            }
            
            let leftPalmCenter = null, rightPalmCenter = null;
            
            if (results.leftHandLandmarks) {
                let sumX = 0, sumY = 0;
                for (const lm of results.leftHandLandmarks) {
                    sumX += lm.x * canvasElement.width;
                    sumY += lm.y * canvasElement.height;
                }
                const cx = sumX / results.leftHandLandmarks.length;
                const cy = sumY / results.leftHandLandmarks.length;
                leftPalmCenter = { x: cx, y: cy };
                canvasCtx.beginPath();
                canvasCtx.arc(cx, cy, 8, 0, 2 * Math.PI);
                canvasCtx.fillStyle = 'yellow';
                canvasCtx.fill();
            }
            
            if (results.rightHandLandmarks) {
                let sumX = 0, sumY = 0;
                for (const lm of results.rightHandLandmarks) {
                    sumX += lm.x * canvasElement.width;
                    sumY += lm.y * canvasElement.height;
                }
                const cx = sumX / results.rightHandLandmarks.length;
                const cy = sumY / results.rightHandLandmarks.length;
                rightPalmCenter = { x: cx, y: cy };
                canvasCtx.beginPath();
                canvasCtx.arc(cx, cy, 8, 0, 2 * Math.PI);
                canvasCtx.fillStyle = 'cyan';
                canvasCtx.fill();
            }
            
            if (leftPalmCenter && rightPalmCenter && eyeThreshold !== null) {
                const leftY = leftPalmCenter.y;
                const rightY = rightPalmCenter.y;
                const handsAboveEyes = leftY < eyeThreshold && rightY < eyeThreshold;
                
                if (handsAboveEyes) {
                    if (bothHandsAboveStartTime === null) {
                        bothHandsAboveStartTime = Date.now();
                        eyesPopUpShown = false;
                    } else if (!eyesPopUpShown && Date.now() - bothHandsAboveStartTime >= 1000) {
                        updateStatusMessage("⚠️ Keep your hands below your eyes");
                        eyesPopUpShown = true;
                    }
                } else {
                    bothHandsAboveStartTime = null;
                    eyesPopUpShown = false;
                    if (!popUpShown) clearStatusMessage();
                }
            }
            
            if (leftPalmCenter && rightPalmCenter && hipThresholdOffset !== null) {
                if (leftPalmCenter.y > hipThresholdOffset && rightPalmCenter.y > hipThresholdOffset) {
                    if (bothHandsUnderStartTime === null) {
                        bothHandsUnderStartTime = Date.now();
                        popUpShown = false;
                    } else if (!popUpShown && Date.now() - bothHandsUnderStartTime >= 5000) {
                        updateStatusMessage("🙌 Hands up");
                        popUpShown = true;
                    }
                } else {
                    bothHandsUnderStartTime = null;
                    if (!eyesPopUpShown) clearStatusMessage();
                    popUpShown = false;
                }
            }
            
            canvasCtx.restore();
        }
        
        const holistic = new Holistic({
            locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
        });
        
        holistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: true,
            smoothSegmentation: true,
            refineFaceLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        holistic.onResults(onResults);
        
        // Request camera permission before creating the Camera instance
        navigator.mediaDevices.getUserMedia({ 
            video: {
                width: { ideal: window.innerWidth },
                height: { ideal: window.innerHeight },
                facingMode: 'user'
            }, 
            audio: false 
        })
            .then((stream) => {
                videoElement.srcObject = stream;
                
                const camera = new Camera(videoElement, {
                    onFrame: async () => {
                        await holistic.send({ image: videoElement });
                    },
                    width: window.innerWidth,
                    height: window.innerHeight
                });
                
                try {
                    camera.start();
                    setShowVideo(false); // Hide video element once camera is working
                    setCameraError(false);
                } catch (error) {
                    console.error("Failed to start camera:", error);
                    setCameraError(true);
                    setShowVideo(true); // Show video element to help debug
                    updateStatusMessage("Camera access error. Please check permissions.");
                }
                
                // Cleanup function
                return () => {
                    stream.getTracks().forEach(track => track.stop());
                    camera.stop();
                    holistic.close();
                };
            })
            .catch((err) => {
                console.error("Error accessing camera:", err);
                setCameraError(true);
                updateStatusMessage("Camera access denied. Please allow camera permissions.");
            });
            
    }, []);
    
    return (
        <div className="presentation-coach" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            overflow: 'hidden'
        }}>
            {cameraError && (
                <div className="camera-error" style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    maxWidth: '80%',
                    zIndex: 1000
                }}>
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
                className="input_video" 
                style={{ 
                    display: showVideo ? 'block' : 'none',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
                autoPlay
                playsInline
                muted
            ></video>
            <canvas 
                ref={canvasRef} 
                className="output_canvas" 
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }}
            ></canvas>
            <StatusMessage message={statusMessage} />
        </div>
    );
};

export default Coach;