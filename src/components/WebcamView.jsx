import { useRef, useState, useEffect } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { Holistic } from "@mediapipe/holistic";

const WebcamView = ({ toggleWebcam, onHolisticResults }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Set up canvas and video dimensions
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
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    // Initialize Holistic model
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
    });

    // Pass results to Coach component for processing
    holistic.onResults((results) => {
      // Pass canvas dimensions for proper calculations
      const dimensions = {
        width: canvasElement.width,
        height: canvasElement.height,
      };

      // Send results to the parent component for processing
      onHolisticResults(results, canvasElement, dimensions);
    });

    // Request camera permission before creating the Camera instance
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: window.innerWidth },
          height: { ideal: window.innerHeight },
          facingMode: "user",
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
          setShowVideo(false); // Hide video element once camera is working
          setCameraError(false);
        } catch (error) {
          console.error("Failed to start camera:", error);
          setCameraError(true);
          setShowVideo(true); // Show video element to help debug
        }

        // Cleanup function
        return () => {
          stream.getTracks().forEach((track) => track.stop());
          camera.stop();
          holistic.close();
        };
      })
      .catch((err) => {
        console.error("Error accessing camera:", err);
        setCameraError(true);
      });
  }, [onHolisticResults]);

  return (
    <div className="webcam-view">
      {cameraError && (
        <div
          className="camera-error"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            maxWidth: "80%",
            zIndex: 1000,
            fontSize: "16px",
          }}
        >
          <p>Camera access error. Please check permissions.</p>
        </div>
      )}
      <video
        ref={videoRef}
        className="input_video"
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
        className="output_canvas"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      ></canvas>
    </div>
  );
};

export { WebcamView, StatusMessage };
