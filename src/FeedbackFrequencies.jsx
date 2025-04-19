import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Evaluation types to match those in Coach.jsx
const EVALUATION_TYPES = {
  HANDS_ABOVE_EYES: "hands_above_eyes",
  HANDS_BELOW_HIPS: "hands_below_hips",
  LOW_MOVEMENT: "low_movement",
  HIGH_MOVEMENT: "high_movement",
  NORMAL_MOVEMENT: "normal_movement",
  CAMERA_ERROR: "camera_error",
};

// Human-readable labels with icons for each feedback type
const FEEDBACK_LABELS = {
  [EVALUATION_TYPES.HANDS_ABOVE_EYES]: "⚠️ Hands Above Eyes",
  [EVALUATION_TYPES.HANDS_BELOW_HIPS]: "🙌 Hands Below Hips",
  [EVALUATION_TYPES.LOW_MOVEMENT]: "🏃 Low Movement",
  [EVALUATION_TYPES.HIGH_MOVEMENT]: "🧘 Excessive Movement",
  [EVALUATION_TYPES.NORMAL_MOVEMENT]: "👍 Good Movement",
  [EVALUATION_TYPES.CAMERA_ERROR]: "📷 Camera Issues",
};

const FeedbackFrequencies = ({ history }) => {
  // Calculate frequencies based on history data
  const calculateFrequencies = (feedbackHistory) => {
    if (
      !feedbackHistory ||
      !Array.isArray(feedbackHistory) ||
      feedbackHistory.length === 0
    ) {
      return {};
    }

    return feedbackHistory.reduce((acc, feedback) => {
      const type = feedback.type;
      if (type) {
        acc[type] = (acc[type] || 0) + 1;
      }
      return acc;
    }, {});
  };

  const frequencies = calculateFrequencies(history);
  const displayFrequencies =
    Object.keys(frequencies).length > 0 ? frequencies : {};

  // Sort frequencies in descending order
  const sortedFrequencies = Object.entries(displayFrequencies).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <Card className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center">
          <span className="mr-2">📊</span> Feedback Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(60vh-8rem)]">
          {Object.keys(displayFrequencies).length > 0 ? (
            <ul className="space-y-3">
              {sortedFrequencies.map(([feedbackType, count], index) => {
                // Calculate percentage for progress bar
                const maxCount = Math.max(...Object.values(displayFrequencies));
                const percentage = (count / maxCount) * 100;

                return (
                  <li
                    key={index}
                    className="p-4 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/80 transition-all border border-zinc-700"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">
                        {FEEDBACK_LABELS[feedbackType] || feedbackType}
                      </span>
                      <span className="text-blue-400 font-bold px-3 py-1 bg-zinc-900 rounded-full shadow-inner">
                        {count}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-4">📈</div>
              <p className="text-zinc-400 text-lg mb-2">
                No feedback recorded yet
              </p>
              <p className="text-zinc-500 text-sm">
                Start your presentation to collect feedback
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FeedbackFrequencies;
