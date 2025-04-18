// Get video and canvas DOM elements
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

// Get the status text element for UI feedback
const statusDiv = document.getElementById('statusText');
let lastStatusMessage = "";
let statusTimeout = null;

// Set status message and animate it in the UI
function setStatusMessage(message) {
    if (message !== lastStatusMessage) {
        lastStatusMessage = message;
        statusDiv.textContent = message;
        statusDiv.classList.add('show');
        clearTimeout(statusTimeout); // Clear existing timeout
    }
}

// Clear the status message with fade-out delay
function clearStatusMessage() {
    if (lastStatusMessage !== "") {
        lastStatusMessage = "";
        statusDiv.classList.remove('show');
        statusTimeout = setTimeout(() => {
            statusDiv.textContent = "";
        }, 500);
    }
}

// Timers and flags for hand gesture detection
let bothHandsUnderStartTime = null;
let popUpShown = false;

let bothHandsAboveStartTime = null;
let eyesPopUpShown = false;

// Called each time MediaPipe returns results
function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the segmentation mask
    canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.globalCompositeOperation = 'source-in';
    canvasCtx.fillStyle = '#6b6b6b';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.globalCompositeOperation = 'source-over';

    // Draw landmarks for pose, face, and hands
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
    drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 5 });
    drawLandmarks(canvasCtx, results.leftHandLandmarks, { color: '#00FF00', lineWidth: 2 });
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 5 });
    drawLandmarks(canvasCtx, results.rightHandLandmarks, { color: '#FF0000', lineWidth: 2 });

    // Extract shoulder positions and draw them
    let lsPx = { x: 0, y: 0 }, rsPx = { x: 0, y: 0 };
    let lSZ = 0, rSZ = 0;

    if (results.poseLandmarks) {
        const lS = results.poseLandmarks[11]; // Left shoulder
        const rS = results.poseLandmarks[12]; // Right shoulder

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

    // Display shoulder positions
    canvasCtx.font = '18px sans-serif';
    canvasCtx.fillStyle = 'white';
    canvasCtx.fillText(`Left Shoulder:  (${Math.round(lsPx.x)}, ${Math.round(lsPx.y)}, z:${lSZ.toFixed(3)})`, 10, 30);
    canvasCtx.fillText(`Right Shoulder: (${Math.round(rsPx.x)}, ${Math.round(rsPx.y)}, z:${rSZ.toFixed(3)})`, 10, 60);

    // Compute thresholds for gestures
    let hipThresholdOffset = null;
    let eyeThreshold = null;

    if (results.poseLandmarks) {
        const lH = results.poseLandmarks[23]; // Left hip
        const rH = results.poseLandmarks[24]; // Right hip
        const rawHipY = (lH.y + rH.y) / 2;     // Average hip height
        hipThresholdOffset = (rawHipY - 0.05) * canvasElement.height; // Move 5% upward

        const leftEye = results.poseLandmarks[1];
        const rightEye = results.poseLandmarks[4];
        eyeThreshold = ((leftEye.y + rightEye.y) / 2) * canvasElement.height;

        // Draw eye threshold line
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, eyeThreshold);
        canvasCtx.lineTo(canvasElement.width, eyeThreshold);
        canvasCtx.strokeStyle = 'lightblue';
        canvasCtx.stroke();

        // Draw offset hip line (orange)
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, hipThresholdOffset);
        canvasCtx.lineTo(canvasElement.width, hipThresholdOffset);
        canvasCtx.strokeStyle = 'orange';
        canvasCtx.lineWidth = 1;
        canvasCtx.stroke();
    }

    // Compute palm center for left and right hands
    let leftPalmCenter = null, rightPalmCenter = null;

    if (results.leftHandLandmarks) {
        let sumX = 0, sumY = 0;
        for (const lm of results.leftHandLandmarks) {
            sumX += lm.x * canvasElement.width;
            sumY += lm.y * canvasElement.height;
        }
        leftPalmCenter = {
            x: sumX / results.leftHandLandmarks.length,
            y: sumY / results.leftHandLandmarks.length
        };
        canvasCtx.beginPath();
        canvasCtx.arc(leftPalmCenter.x, leftPalmCenter.y, 8, 0, 2 * Math.PI);
        canvasCtx.fillStyle = 'yellow';
        canvasCtx.fill();
    }

    if (results.rightHandLandmarks) {
        let sumX = 0, sumY = 0;
        for (const lm of results.rightHandLandmarks) {
            sumX += lm.x * canvasElement.width;
            sumY += lm.y * canvasElement.height;
        }
        rightPalmCenter = {
            x: sumX / results.rightHandLandmarks.length,
            y: sumY / results.rightHandLandmarks.length
        };
        canvasCtx.beginPath();
        canvasCtx.arc(rightPalmCenter.x, rightPalmCenter.y, 8, 0, 2 * Math.PI);
        canvasCtx.fillStyle = 'cyan';
        canvasCtx.fill();
    }

    // Check if both hands are above eyes
    if (leftPalmCenter && rightPalmCenter && eyeThreshold !== null) {
        const leftY = leftPalmCenter.y;
        const rightY = rightPalmCenter.y;
        const handsAboveEyes = leftY < eyeThreshold && rightY < eyeThreshold;

        if (handsAboveEyes) {
            if (bothHandsAboveStartTime === null) {
                bothHandsAboveStartTime = Date.now();
                eyesPopUpShown = false;
            } else if (!eyesPopUpShown && Date.now() - bothHandsAboveStartTime >= 1000) {
                setStatusMessage("⚠️ Keep your hands below your eyes");
                eyesPopUpShown = true;
            }
        } else {
            bothHandsAboveStartTime = null;
            eyesPopUpShown = false;
            if (!popUpShown) clearStatusMessage();
        }
    }

    // Check if both hands are below the offset hip threshold
    if (leftPalmCenter && rightPalmCenter && hipThresholdOffset !== null) {
        if (leftPalmCenter.y > hipThresholdOffset && rightPalmCenter.y > hipThresholdOffset) {
            if (bothHandsUnderStartTime === null) {
                bothHandsUnderStartTime = Date.now();
                popUpShown = false;
            } else if (!popUpShown && Date.now() - bothHandsUnderStartTime >= 5000) {
                setStatusMessage("🙌 Hands up");
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

// Setup MediaPipe Holistic model
const holistic = new Holistic({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
});

// Holistic model options
holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    refineFaceLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// Register the callback handler for results
holistic.onResults(onResults);

// Setup and start the camera
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await holistic.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});

camera.start();
