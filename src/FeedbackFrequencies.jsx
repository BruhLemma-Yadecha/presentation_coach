import React from 'react';

const FeedbackFrequencies = ({ history }) => {
    // Calculate frequencies based on history data
    const calculateFrequencies = (feedbackHistory) => {
        if (!feedbackHistory || !Array.isArray(feedbackHistory) || feedbackHistory.length === 0) {
            return {};
        }

        return feedbackHistory.reduce((acc, feedback) => {
            // Assuming each feedback item has a 'type' or 'category' field
            // Adjust the property name if your data structure is different
            const type = feedback.type || feedback.category;
            if (type) {
                acc[type] = (acc[type] || 0) + 1;
            }
            return acc;
        }, {});
    };

    const frequencies = calculateFrequencies(history);
    const displayFrequencies = Object.keys(frequencies).length > 0 ? frequencies : {};

    // Sort frequencies in descending order
    const sortedFrequencies = Object.entries(displayFrequencies)
        .sort((a, b) => b[1] - a[1]);

    return (
        <div className="w-full h-full p-4 bg-zinc-850 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold mb-3 text-white">Feedback Frequency</h3>
            <div className="h-[calc(60vh-4rem)] overflow-y-auto pr-2 custom-scrollbar">
                {Object.keys(displayFrequencies).length > 0 ? (
                    <ul className="space-y-2">
                        {sortedFrequencies.map(([feedbackType, count], index) => (
                            <li key={index} className="flex justify-between items-center p-2 rounded-md bg-zinc-800">
                                <span className="text-white text-sm">{feedbackType}</span>
                                <span className="text-blue-400 font-semibold text-sm">{count}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-zinc-400 text-center py-10">No frequency data available</p>
                )}
            </div>
        </div>
    );
};

export default FeedbackFrequencies;
