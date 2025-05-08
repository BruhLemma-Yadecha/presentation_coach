import { Camera } from "@mediapipe/camera_utils";
import { Holistic } from "@mediapipe/holistic"; // Assuming Holistic is needed for send
import EvaluationType from "../EvaluationTypes"; // Adjust path as needed

interface CameraServiceOptions {
  videoElement: HTMLVideoElement;
  holisticModel: Holistic;
  onCameraError: (message: string, type: EvaluationType) => void;
}

export const setupCamera = async ({
  videoElement,
  holisticModel,
  onCameraError,
}: CameraServiceOptions): Promise<(() => void) | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: window.innerWidth },
        height: { ideal: window.innerHeight },
        facingMode: "user",
      },
      audio: false,
    });

    videoElement.srcObject = stream;

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        // Ensure videoElement has a valid readyState and dimensions before sending to Holistic
        if (videoElement.readyState >= HTMLMediaElement.HAVE_METADATA && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          await holisticModel.send({ image: videoElement });
        }
      },
      width: window.innerWidth,
      height: window.innerHeight,
    });

    camera.start();

    return () => {
      stream.getTracks().forEach((track) => track.stop());
      camera.stop();
    };
  } catch (err) {
    console.error("Camera setup failed:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes("Permission denied") || errorMessage.includes("The request is not allowed by the user agent")) {
      onCameraError(
        "Camera access denied. Please allow camera permissions.",
        EvaluationType.CAMERA_ERROR,
      );
    } else {
      onCameraError(
        `Camera access error: ${errorMessage}. Please check permissions and ensure no other app is using the camera.`,
        EvaluationType.CAMERA_ERROR,
      );
    }
    return null;
  }
};
