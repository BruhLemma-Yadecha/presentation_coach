import PresentationHistory from "./PresentationHistory";
import FeedbackFrequencies from "./FeedbackFrequencies";
import { Separator } from "@/components/ui/separator";
import Summary from "./Summary";

const Epilogue = ({ history }) => {
  // Dummy data for testing scroll functionality (can be removed if history prop is always reliable)
  const dummyHistory = [
    {
      message: "Your pace was excellent throughout the presentation",
      timestamp: new Date().getTime() - 3600000,
    },
    {
      message: "Try to maintain more eye contact with your audience",
      timestamp: new Date().getTime() - 3300000,
    },
    {
      message: "Great job explaining the technical concepts clearly",
      timestamp: new Date().getTime() - 3000000,
    },
    {
      message: "Your gestures helped emphasize key points effectively",
      timestamp: new Date().getTime() - 2700000,
    },
    {
      message: "Consider pausing longer after important statements",
      timestamp: new Date().getTime() - 2400000,
    },
    {
      message: "The energy in your voice kept the audience engaged",
      timestamp: new Date().getTime() - 2100000,
    },
    {
      message: "Your slide transitions were smooth and well-timed",
      timestamp: new Date().getTime() - 1800000,
    },
    {
      message: "Try to use more specific examples to illustrate points",
      timestamp: new Date().getTime() - 1500000,
    },
    {
      message: "Your conclusion effectively summarized the key takeaways",
      timestamp: new Date().getTime() - 1200000,
    },
    {
      message: "Consider addressing questions more concisely",
      timestamp: new Date().getTime() - 900000,
    },
    {
      message: "Excellent use of data to support your arguments",
      timestamp: new Date().getTime() - 600000,
    },
    {
      message: "Your storytelling approach made complex ideas accessible",
      timestamp: new Date().getTime() - 300000,
    },
    {
      message: "Overall, a very confident and compelling presentation",
      timestamp: new Date().getTime(),
    },
  ];

  // Use provided history or dummy data if history is empty
  const displayHistory = history && history.length > 0 ? history : dummyHistory;

  return (
    <div>
      <div>
        <div
          style={{
            position: "fixed",
            top: 0,
            width: "100%",
            height: "100vh",
            zIndex: 100,
          }}
        >
          <div 
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            width: "71%",
            height: "70vh",
            zIndex: 100,
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}>
            {/* Left Column: Presentation History */}
            <div style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0,0,0,0.8)",
                color: "white",
                padding: "20px",
                borderRadius: "20px",
                maxWidth: "80%",
                zIndex: 1000,
              }}>
              <FeedbackFrequencies history={displayHistory} />
            </div>
            <Separator className="md:block w-1 bg-gray-300" />
            {/* Right Column: Feedback Frequencies */}
          </div>
          <div style={{
                position: "fixed",
                bottom: 10,
                left: 10,
                width: "100%",
                color: "white",
              }}>
              <Summary history={displayHistory} />
          </div>
        </div>
        <div style={{ position: "fixed", bottom: 20, left: 20 }}>
          <button
            style={{
              width: "26vw",
              padding: "1em",
              fontWeight: "bolder",
            }}
            onClick={() => {
              setEnd(true), setStart(false);
            }}
          >
            End
          </button>
        </div>
      </div>
      <div style={{ width: "70%" }}>
        <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            width: "71%",
            height: "70vh",
            zIndex: 100,
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
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
                borderRadius: "20px",
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
        </div>
        <div
          style={{
            position: "fixed",
            top: 10,
            left: 10,
            width: "28%",
            color: "white",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Timeline entries={timelineEntries} />
          </div>
        </div>
      </div>
      <div>
        <div
          style={{
            position: "fixed",
            bottom: 10,
            right: 10,
            height: "25vh",
            width: "70%",
            padding: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            textAlign: "center",
            borderRadius: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <Feedback entries={timelineEntries} />
        </div>
      </div>
    </div>
  );
};

export default Epilogue;
