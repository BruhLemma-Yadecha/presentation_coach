import { Results, LandmarkConnectionArray, NormalizedLandmarkList } from "@mediapipe/holistic";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

interface DrawingOptions {
  color: string;
  lineWidth: number;
}

export const Pose = (
  canvasCtx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmarkList,
  connections: LandmarkConnectionArray,
  options: DrawingOptions,
) => {
  drawConnectors(canvasCtx, landmarks, connections, options);
  drawLandmarks(canvasCtx, landmarks, { ...options, lineWidth: options.lineWidth / 2 }); // Smaller lineWidth for landmarks
};

export const FaceMesh = (
  canvasCtx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmarkList,
  connections: LandmarkConnectionArray,
  options: DrawingOptions,
) => {
  drawConnectors(canvasCtx, landmarks, connections, options);
};

export const Hand = (
  canvasCtx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmarkList,
  connections: LandmarkConnectionArray,
  options: DrawingOptions,
) => {
  drawConnectors(canvasCtx, landmarks, connections, options);
  drawLandmarks(canvasCtx, landmarks, { ...options, lineWidth: options.lineWidth / 2 });
};

export const ThresholdLine = (
  canvasCtx: CanvasRenderingContext2D,
  yPosition: number,
  canvasWidth: number,
  color: string,
  lineWidth: number = 1,
) => {
  canvasCtx.beginPath();
  canvasCtx.moveTo(0, yPosition);
  canvasCtx.lineTo(canvasWidth, yPosition);
  canvasCtx.strokeStyle = color;
  canvasCtx.lineWidth = lineWidth;
  canvasCtx.stroke();
};

export const DebugText = (
  canvasCtx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  font: string = "16px Arial",
) => {
  canvasCtx.font = font;
  canvasCtx.fillStyle = color;
  canvasCtx.fillText(text, x, y);
};

export const PerspectiveLine = (
  canvasCtx: CanvasRenderingContext2D,
  p1: { x: number; y: number; z?: number },
  p2: { x: number; y: number; z?: number },
  baseColorRGB: [number, number, number],
  baseLineWidth: number,
) => {
  const scaleZ = (z: number | undefined) => (z ? Math.max(0.5, 1 + z * 3) : 1);
  const brightnessZ = (z: number | undefined) => (z ? Math.max(0, Math.min(255, 255 - z * 100)) : baseColorRGB[0]); // Assuming red for simplicity

  const p1Scale = scaleZ(p1.z);
  const p2Scale = scaleZ(p2.z);
  const midZ = p1.z !== undefined && p2.z !== undefined ? (p1.z + p2.z) / 2 : undefined;
  const brightness = brightnessZ(midZ);

  canvasCtx.beginPath();
  canvasCtx.moveTo(p1.x, p1.y);
  canvasCtx.lineTo(p2.x, p2.y);
  canvasCtx.strokeStyle = `rgb(${brightness}, ${baseColorRGB[1]}, ${baseColorRGB[2]})`;
  canvasCtx.lineWidth = ((p1Scale + p2Scale) / 2) * baseLineWidth; // Average scale for line width
  canvasCtx.stroke();
};

export const LandmarkArc = (
  canvasCtx: CanvasRenderingContext2D,
  point: { x: number; y: number; z?: number },
  radius: number,
  color: string,
) => {
  const scale = point.z ? Math.max(0.5, 1 + point.z * 3) : 1;
  canvasCtx.beginPath();
  canvasCtx.arc(point.x, point.y, radius * scale, 0, 2 * Math.PI);
  canvasCtx.fillStyle = color;
  canvasCtx.fill();
};

export const clearCanvas = (
  canvasCtx: CanvasRenderingContext2D,
  canvasElement: HTMLCanvasElement,
) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
};

export const restoreCanvas = (canvasCtx: CanvasRenderingContext2D) => {
  canvasCtx.restore();
};

export const BackgroundImage = (
  canvasCtx: CanvasRenderingContext2D,
  image: CanvasImageSource, // HTMLImageElement, SVGImageElement, HTMLVideoElement, HTMLCanvasElement, ImageBitmap, OffscreenCanvas
  canvasElement: HTMLCanvasElement,
) => {
  if (image) {
    canvasCtx.drawImage(
      image,
      0,
      0,
      canvasElement.width,
      canvasElement.height,
    );
  }
};
