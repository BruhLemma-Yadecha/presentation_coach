import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  console.log("Sorted Frequencies:", sortedFrequencies);

  return (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">
          Feedback Summary
        </h4>
        {sortedFrequencies.length > 0 ? (
          sortedFrequencies.map(([tag, frequency]) => (
            <React.Fragment key={tag}>
              <div className="flex justify-between items-center text-sm">
                <span>{FEEDBACK_LABELS[tag] || tag}</span>
                <span className="font-medium">{frequency}</span>
              </div>
              <Separator className="my-2" />
            </React.Fragment>
          ))
        ) : (
          <div className="text-sm text-gray-500">No feedback recorded yet</div>
        )}
      </div>
    </ScrollArea>
  );
};

export default FeedbackFrequencies;
