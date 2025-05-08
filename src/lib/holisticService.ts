import { Holistic, Results } from "@mediapipe/holistic";

export type HolisticResults = Results;

export const initializeHolisticModel = (
  onResults: (results: HolisticResults) => void,
): Holistic => {
  const holistic = new Holistic({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
  });

  holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    refineFaceLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    // segmentationMode: "video", // Added based on original code, though not strictly in setOptions type
  });

  holistic.onResults(onResults);

  return holistic;
};
