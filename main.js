// const videoElement  = document.getElementsByClassName('input_video')[0];
// const canvasElement = document.getElementsByClassName('output_canvas')[0];
// const canvasCtx     = canvasElement.getContext('2d');

// // Timer variables for detecting hands under hips
// let bothHandsUnderStartTime = null;
// let popUpShown = false;

// // Timer variables for detecting hands above head
// let bothHandsAboveStartTime = null;
// let eyesPopUpShown = false;

// function onResults(results) {
//     canvasCtx.save();
//     canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

//     // Draw segmentation mask + video
//     canvasCtx.drawImage(results.segmentationMask, 0, 0,
//                         canvasElement.width, canvasElement.height);
//     canvasCtx.globalCompositeOperation = 'source-in';

//     // the gray mask   
//     canvasCtx.fillStyle = '#6b6b6b';
//     canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
//     canvasCtx.globalCompositeOperation = 'destination-atop';
//     canvasCtx.drawImage(results.image, 0, 0,
//                         canvasElement.width, canvasElement.height);
//     canvasCtx.globalCompositeOperation = 'source-over';

//     // Draw pose, face, and hands
//     drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
//     drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
//     drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
//     drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 5 });
//     drawLandmarks(canvasCtx, results.leftHandLandmarks, { color: '#00FF00', lineWidth: 2 });
//     drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 5 });
//     drawLandmarks(canvasCtx, results.rightHandLandmarks, { color: '#FF0000', lineWidth: 2 });

//     // Prepare shoulder data
//     let lsPx = { x: 0, y: 0 }, rsPx = { x: 0, y: 0 };
//     let lSZ = 0, rSZ = 0;
//     if (results.poseLandmarks) {
//     const lS = results.poseLandmarks[11];  // left shoulder
//     const rS = results.poseLandmarks[12];  // right shoulder

//     // Pixel coordinates
//     lsPx = { x: lS.x * canvasElement.width,  y: lS.y * canvasElement.height };
//     rsPx = { x: rS.x * canvasElement.width,  y: rS.y * canvasElement.height };

//     // Normalized depth (z)
//     lSZ = lS.z;
//     rSZ = rS.z;

//     // Draw circles at the shoulders
//     canvasCtx.beginPath();
//     canvasCtx.arc(lsPx.x, lsPx.y, 8, 0, 2 * Math.PI);
//     canvasCtx.fillStyle = 'blue';
//     canvasCtx.fill();
//     canvasCtx.beginPath();
//     canvasCtx.arc(rsPx.x, rsPx.y, 8, 0, 2 * Math.PI);
//     canvasCtx.fillStyle = 'red';
//     canvasCtx.fill();
//     }

//     // Draw coordinate text including z-values on the left side
//     canvasCtx.font = '18px sans-serif';
//     canvasCtx.fillStyle = 'white';
//     canvasCtx.fillText(
//     `Left Shoulder:  (${Math.round(lsPx.x)}, ${Math.round(lsPx.y)}, z:${lSZ.toFixed(3)})`,
//     10, 30
//     );
//     canvasCtx.fillText(
//     `Right Shoulder: (${Math.round(rsPx.x)}, ${Math.round(rsPx.y)}, z:${rSZ.toFixed(3)})`,
//     10, 60
//     );

//     // Compute hip threshold
// let hipThreshold = null;
//     if (results.poseLandmarks) {
//     const lH = results.poseLandmarks[23];  // left hip
//     const rH = results.poseLandmarks[24];  // right hip
//     hipThreshold = ((lH.y + rH.y) / 2) * canvasElement.height;
//     // (Optional) Draw a line at hip level
//     canvasCtx.beginPath();
//     canvasCtx.moveTo(0, hipThreshold);
//     canvasCtx.lineTo(canvasElement.width, hipThreshold);
//     canvasCtx.strokeStyle = 'white';
//     canvasCtx.lineWidth = 1;
//     canvasCtx.stroke();
//     }

// let eyeThreshold = null, bellyThreshold = null;
// if (results.poseLandmarks) {
// const leftEye = results.poseLandmarks[1];  // left eye
// const rightEye = results.poseLandmarks[4]; // right eye
// eyeThreshold = ((leftEye.y + rightEye.y) / 2) * canvasElement.height;

// const leftHip = results.poseLandmarks[23];
// const rightHip = results.poseLandmarks[24];
// bellyThreshold = ((leftHip.y + rightHip.y) / 2) * canvasElement.height;

// // Optional: Draw horizontal guide lines
// canvasCtx.beginPath();
// canvasCtx.moveTo(0, eyeThreshold);
// canvasCtx.lineTo(canvasElement.width, eyeThreshold);
// canvasCtx.strokeStyle = 'lightblue';
// canvasCtx.stroke();

// canvasCtx.beginPath();
// canvasCtx.moveTo(0, bellyThreshold);
// canvasCtx.lineTo(canvasElement.width, bellyThreshold);
// canvasCtx.strokeStyle = 'lightgreen';
// canvasCtx.stroke();
// }





//     // Compute palm centers
//     let leftPalmCenter = null;
//     if (results.leftHandLandmarks) {
//     let sumX = 0, sumY = 0;
//     for (const lm of results.leftHandLandmarks) {
//         sumX += lm.x * canvasElement.width;
//         sumY += lm.y * canvasElement.height;
//     }
//     const cx = sumX / results.leftHandLandmarks.length;
//     const cy = sumY / results.leftHandLandmarks.length;
//     leftPalmCenter = { x: cx, y: cy };
//     canvasCtx.beginPath();
//     canvasCtx.arc(cx, cy, 8, 0, 2 * Math.PI);
//     canvasCtx.fillStyle = 'yellow';
//     canvasCtx.fill();
//     }

//     let rightPalmCenter = null;
//     if (results.rightHandLandmarks) {
//     let sumX = 0, sumY = 0;
//     for (const lm of results.rightHandLandmarks) {
//         sumX += lm.x * canvasElement.width;
//         sumY += lm.y * canvasElement.height;
//     }
//     const cx = sumX / results.rightHandLandmarks.length;
//     const cy = sumY / results.rightHandLandmarks.length;
//     rightPalmCenter = { x: cx, y: cy };
//     canvasCtx.beginPath();
//     canvasCtx.arc(cx, cy, 8, 0, 2 * Math.PI);
//     canvasCtx.fillStyle = 'cyan';
//     canvasCtx.fill();
//     }

//     // Detection logic: if both palm centers are under hips for 45s, show alert

//     if (leftPalmCenter && rightPalmCenter && eyeThreshold !== null && bellyThreshold !== null) {
// const leftY = leftPalmCenter.y;
// const rightY = rightPalmCenter.y;

// const handsAboveEyes = leftY < eyeThreshold && rightY < eyeThreshold;

// if (handsAboveEyes) {
//     if (bothHandsAboveStartTime === null) {
//     bothHandsAboveStartTime = Date.now();
//     eyesPopUpShown = false;
//     } else if (!eyesPopUpShown && Date.now() - bothHandsAboveStartTime >= 1000) {
//     alert("Keep your hands below your eyes");
//     eyesPopUpShown = true;
//     }
// } else {
//     bothHandsAboveStartTime = null;
//     eyesPopUpShown = false;
// }
// }
    
//     if (leftPalmCenter && rightPalmCenter && hipThreshold !== null) {
//     if (leftPalmCenter.y > hipThreshold && rightPalmCenter.y > hipThreshold) {
//         if (bothHandsUnderStartTime === null) {
//         bothHandsUnderStartTime = Date.now();
//         popUpShown = false;
//         } else if (!popUpShown && Date.now() - bothHandsUnderStartTime >= 5000) {
//         alert('hands up');
//         popUpShown = true;
//         }
//     } else {
//         bothHandsUnderStartTime = null;
//         popUpShown = false;
//     }
//     } else {
//     bothHandsUnderStartTime = null;
//     popUpShown = false;
//     }

//     canvasCtx.restore();
// }

// const holistic = new Holistic({
//     locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
// });
// holistic.setOptions({
//     modelComplexity:        1,
//     smoothLandmarks:        true,
//     enableSegmentation:     true,
//     smoothSegmentation:     true,
//     refineFaceLandmarks:    true,
//     minDetectionConfidence: 0.5,
//     minTrackingConfidence:  0.5
// });
// holistic.onResults(onResults);

// const camera = new Camera(videoElement, {
//     onFrame: async () => { await holistic.send({ image: videoElement }); },
//     width: 1280,
//     height: 720
// });
// camera.start();





const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

const statusDiv = document.getElementById('statusText');
let lastStatusMessage = "";
let statusTimeout = null;

function setStatusMessage(message) {
    if (message !== lastStatusMessage) {
        lastStatusMessage = message;
        statusDiv.textContent = message;
        statusDiv.classList.add('show');
        clearTimeout(statusTimeout);
    }
}

function clearStatusMessage() {
    if (lastStatusMessage !== "") {
        lastStatusMessage = "";
        statusDiv.classList.remove('show');
        statusTimeout = setTimeout(() => {
            statusDiv.textContent = "";
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
    canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.globalCompositeOperation = 'source-in';
    canvasCtx.fillStyle = '#6b6b6b';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.globalCompositeOperation = 'source-over';

    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
    drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 5 });
    drawLandmarks(canvasCtx, results.leftHandLandmarks, { color: '#00FF00', lineWidth: 2 });
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 5 });
    drawLandmarks(canvasCtx, results.rightHandLandmarks, { color: '#FF0000', lineWidth: 2 });

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

    let hipThreshold = null;
    let eyeThreshold = null, bellyThreshold = null;

    if (results.poseLandmarks) {
        const lH = results.poseLandmarks[23];
        const rH = results.poseLandmarks[24];
        hipThreshold = ((lH.y + rH.y) / 2) * canvasElement.height;

        const leftEye = results.poseLandmarks[1];
        const rightEye = results.poseLandmarks[4];
        eyeThreshold = ((leftEye.y + rightEye.y) / 2) * canvasElement.height;
        bellyThreshold = ((lH.y + rH.y) / 2) * canvasElement.height;

        canvasCtx.beginPath();
        canvasCtx.moveTo(0, eyeThreshold);
        canvasCtx.lineTo(canvasElement.width, eyeThreshold);
        canvasCtx.strokeStyle = 'lightblue';
        canvasCtx.stroke();

        canvasCtx.beginPath();
        canvasCtx.moveTo(0, bellyThreshold);
        canvasCtx.lineTo(canvasElement.width, bellyThreshold);
        canvasCtx.strokeStyle = 'lightgreen';
        canvasCtx.stroke();

        canvasCtx.beginPath();
        canvasCtx.moveTo(0, hipThreshold);
        canvasCtx.lineTo(canvasElement.width, hipThreshold);
        canvasCtx.strokeStyle = 'white';
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

    if (leftPalmCenter && rightPalmCenter && eyeThreshold !== null && bellyThreshold !== null) {
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

    if (leftPalmCenter && rightPalmCenter && hipThreshold !== null) {
        if (leftPalmCenter.y > hipThreshold && rightPalmCenter.y > hipThreshold) {
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

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await holistic.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});

camera.start();
