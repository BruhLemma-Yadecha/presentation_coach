import React from 'react';

const PresentationHistory = ({ history }) => {
    // Use provided history or an empty array if history is not provided or empty
    const displayHistory = (history && history.length > 0) ? history : [];

    return (
        <div className="w-full h-full p-4 bg-zinc-850 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold mb-3 text-white">Presentation Timeline</h3>
            {/* Scrollable container for history items */}
            <div className="h-[calc(60vh-4rem)] overflow-y-auto pr-2 custom-scrollbar"> {/* Adjust height as needed */}
                {displayHistory.length > 0 ? (
                    <div className="space-y-3">
                        {displayHistory.map((item, index) => (
                            <div 
                                key={index} 
                                className="p-2 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
                            >
                                <div className="flex items-baseline">
                                    <span className="text-zinc-400 text-xs mr-2 flex-shrink-0">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                    <span className="text-zinc-500 text-xs mr-2">|</span>
                                    <span className="text-white text-sm break-words">
                                        {item.message}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-400 text-center py-10">No history available</p>
                )}
            </div>
        </div>
    );
};

export default PresentationHistory;
