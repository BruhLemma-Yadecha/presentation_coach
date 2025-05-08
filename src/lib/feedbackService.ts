import EvaluationType from "../EvaluationTypes";

export interface TimelineEntry {
  message: string;
  timestamp: number;
  type: EvaluationType;
}

export interface FeedbackState {
  statusMessage: string;
  timelineEntries: TimelineEntry[];
}

let statusTimeout: NodeJS.Timeout | null = null;
let lastStatusMessage = "";

export const updateStatus = (
  message: string,
  evaluationType: EvaluationType,
  setHistory: React.Dispatch<React.SetStateAction<TimelineEntry[]>>,
  currentTimelineEntries: TimelineEntry[],
  timelineMaxEntries: number
): { newStatusMessage: string; newTimelineEntries: TimelineEntry[] } => {
  const newEntry: TimelineEntry = {
    message,
    timestamp: Date.now(),
    type: evaluationType,
  };

  setHistory((prev) => [...prev, newEntry]);

  let newTimelineEntries = currentTimelineEntries;
  if (message !== lastStatusMessage) {
    lastStatusMessage = message;
    newTimelineEntries = [...currentTimelineEntries, newEntry];
    if (newTimelineEntries.length > timelineMaxEntries) {
      newTimelineEntries.shift(); // Remove oldest
    }

    if (statusTimeout) {
      clearTimeout(statusTimeout);
    }
    statusTimeout = setTimeout(() => {
      lastStatusMessage = "";
      // This part needs to be handled by the component's state (e.g., by calling a setStatusMessage function passed in)
      // For now, the service will just manage the timeline and the "lastStatusMessage" concept
    }, 2000);
  }
  return { newStatusMessage: message, newTimelineEntries };
};

export const clearStatus = (): { newStatusMessage: string } => {
  if (lastStatusMessage !== "") {
    lastStatusMessage = "";
    if (statusTimeout) {
      clearTimeout(statusTimeout);
    }
  }
  return { newStatusMessage: "" };
};

// Function to be called by the component to clear the message after the timeout
export const getStatusClearer = (setStatusMessage: React.Dispatch<React.SetStateAction<string>>) => {
  return () => {
    if (lastStatusMessage === "") { // Only clear if the timeout intended to clear this message
        setStatusMessage("");
    }
  };
};

// Note: The actual hiding of the status message after 2 seconds
// will need to be managed by the calling component's state,
// as this service doesn't have direct access to setStatusMessage.
// The `getStatusClearer` can be used in the component's timeout.
