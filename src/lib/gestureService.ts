import { NormalizedLandmarkList, Results } from "@mediapipe/holistic";
import EvaluationType from "../EvaluationTypes";

interface HandGestureState {
  bothHandsUnderStartTime: number | null;
  popUpShown: boolean;
  bothHandsAboveStartTime: number | null;
  eyesPopUpShown: boolean;
  lastMovementStatusRef: React.RefObject<string>; // To reset movement status
}

interface PalmCenter {
  x: number;
  y: number;
}

const calculatePalmCenter = (
  landmarks: NormalizedLandmarkList,
  canvasWidth: number,
  canvasHeight: number,
): PalmCenter | null => {
  if (!landmarks || landmarks.length === 0) return null;
  let sumX = 0, sumY = 0;
  for (const lm of landmarks) {
    sumX += lm.x * canvasWidth;
    sumY += lm.y * canvasHeight;
  }
  return {
    x: sumX / landmarks.length,
    y: sumY / landmarks.length,
  };
};

export const checkHandGestures = (
  results: Results,
  canvasElement: HTMLCanvasElement,
  gestureState: HandGestureState,
  updateStatusMessageCallback: (message: string, evaluationType: EvaluationType) => void,
) => {
  const { 
    bothHandsUnderStartTime,
    popUpShown,
    bothHandsAboveStartTime,
    eyesPopUpShown,
    lastMovementStatusRef
  } = gestureState;

  let newBothHandsUnderStartTime = bothHandsUnderStartTime;
  let newPopUpShown = popUpShown;
  let newBothHandsAboveStartTime = bothHandsAboveStartTime;
  let newEyesPopUpShown = eyesPopUpShown;

  const canvasWidth = canvasElement.width;
  const canvasHeight = canvasElement.height;

  const leftPalmCenter = results.leftHandLandmarks 
    ? calculatePalmCenter(results.leftHandLandmarks, canvasWidth, canvasHeight)
    : null;
  const rightPalmCenter = results.rightHandLandmarks
    ? calculatePalmCenter(results.rightHandLandmarks, canvasWidth, canvasHeight)
    : null;

  let hipThresholdOffset: number | null = null;
  let eyeThreshold: number | null = null;

  if (results.poseLandmarks) {
    const lH = results.poseLandmarks[23]; // left hip
    const rH = results.poseLandmarks[24]; // right hip
    if (lH && rH) {
        const rawHipY = (lH.y + rH.y) / 2;
        hipThresholdOffset = (rawHipY - 0.05) * canvasHeight;
    }

    const leftEye = results.poseLandmarks[1];
    const rightEye = results.poseLandmarks[4];
    if (leftEye && rightEye) {
        eyeThreshold = ((leftEye.y + rightEye.y) / 2) * canvasHeight;
    }
  }

  // Warning if both hands are above the eyes
  if (leftPalmCenter && rightPalmCenter && eyeThreshold !== null) {
    const handsAboveEyes = leftPalmCenter.y < eyeThreshold && rightPalmCenter.y < eyeThreshold;
    if (handsAboveEyes) {
      if (newBothHandsAboveStartTime === null) {
        newBothHandsAboveStartTime = Date.now();
        newEyesPopUpShown = false;
      } else if (!newEyesPopUpShown && Date.now() - newBothHandsAboveStartTime >= 1000) {
        updateStatusMessageCallback(
          "⚠️ Keep your hands below your eyes",
          EvaluationType.HANDS_ABOVE_EYES,
        );
        newEyesPopUpShown = true;
        if(lastMovementStatusRef) lastMovementStatusRef.current = ""; // Reset movement status
      }
    } else {
      newBothHandsAboveStartTime = null;
      newEyesPopUpShown = false;
    }
  }

  // Warning if both hands are below the hips
  if (leftPalmCenter && rightPalmCenter && hipThresholdOffset !== null) {
    if (leftPalmCenter.y > hipThresholdOffset && rightPalmCenter.y > hipThresholdOffset) {
      if (newBothHandsUnderStartTime === null) {
        newBothHandsUnderStartTime = Date.now();
        newPopUpShown = false;
      } else if (!newPopUpShown && Date.now() - newBothHandsUnderStartTime >= 5000) {
        updateStatusMessageCallback(
          "🙌 Hands up",
          EvaluationType.HANDS_BELOW_HIPS,
        );
        newPopUpShown = true;
        if(lastMovementStatusRef) lastMovementStatusRef.current = ""; // Reset movement status
      }
    } else {
      newBothHandsUnderStartTime = null;
      newPopUpShown = false;
    }
  }

  // // No hands detected (logic from original, kept commented for now)
  // if (
  //   !results.leftHandLandmarks &&
  //   !results.rightHandLandmarks &&
  //   !newPopUpShown &&
  //   !newEyesPopUpShown
  // ) {
  //   // This part needs hasCheckedHands state and its reset logic, 
  //   // which might be better managed in the component or a higher-level service
  //   // if (hasCheckedHands) { 
  //   //   setTimeout(() => {
  //   //     updateStatusMessageCallback(
  //   //       "🤚 No hands detected",
  //   //       EVALUATION_TYPES.NO_HANDS_DETECTED, // Assuming this type exists or is added
  //   //     );
  //   //     if(lastMovementStatusRef) lastMovementStatusRef.current = "No hands detected";
  //   //     // setHasCheckedHands(true); 
  //   //     // resetHandChecker(); 
  //   //   }, 5000);
  //   // } else {
  //   // }
  //   newBothHandsAboveStartTime = null;
  //   newBothHandsUnderStartTime = null;
  //   newEyesPopUpShown = false;
  //   newPopUpShown = false;
  //   // lastSlouchStatus.current = false; // Reset slouch status when no hands - this dependency needs careful handling
  //   return { // Return early if no hands and no popups shown
  //       bothHandsUnderStartTime: newBothHandsUnderStartTime,
  //       popUpShown: newPopUpShown,
  //       bothHandsAboveStartTime: newBothHandsAboveStartTime,
  //       eyesPopUpShown: newEyesPopUpShown,
  //       eyeThreshold,
  //       hipThresholdOffset
  //   };
  // }

  return {
    bothHandsUnderStartTime: newBothHandsUnderStartTime,
    popUpShown: newPopUpShown,
    bothHandsAboveStartTime: newBothHandsAboveStartTime,
    eyesPopUpShown: newEyesPopUpShown,
    eyeThreshold, // Return calculated thresholds for drawing
    hipThresholdOffset // Return calculated thresholds for drawing
  };
};

export { PalmCenter, HandGestureState };
