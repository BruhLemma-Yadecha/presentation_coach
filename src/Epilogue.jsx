import PresentationHistory from "./PresentationHistory";
import FeedbackFrequencies from "./FeedbackFrequencies";

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
    <div className="w-full max-w-4xl mx-auto p-6 bg-zinc-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white text-center">
        Presentation Summary
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Presentation History */}
        <div className="w-full md:w-1/2">
          <PresentationHistory history={displayHistory} />
        </div>

        {/* Right Column: Feedback Frequencies */}
        <div className="w-full md:w-1/2">
          <FeedbackFrequencies history={displayHistory} />
        </div>
      </div>
    </div>
  );
};

export default Epilogue;
