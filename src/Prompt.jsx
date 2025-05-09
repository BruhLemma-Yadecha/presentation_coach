import React, { useState } from "react";
import Configuration from "openai";
import OpenAIApi from "openai";

const Prompt = ({ timelineEntries }) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const configuration = new Configuration({
    apiKey: "", // Replace with your OpenAI API key
  });

  const openai = new OpenAIApi(configuration);

  // Prepare a summary of error messages for the prompt
  const errorHistory = timelineEntries
    .map(
      (entry) =>
        `${new Date(entry.timestamp).toLocaleTimeString()}: ${entry.message}`,
    )
    .join("\n");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const masterPrompt = `
You are a presentation coach. Analyze the following error history from a user's presentation session and provide constructive feedback in JSON format. 
The JSON should include:
- "summary": a brief summary of the user's posture and movement issues,
- "suggestions": an array of actionable suggestions,
- "issues": an array of detected issues.

Error history:
${errorHistory}
`;

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [{ role: "system", content: masterPrompt }],
      });

      setResponse(completion.data.choices[0].message.content);
    } catch (error) {
      setResponse("Error fetching response: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Get Feedback"}
        </button>
      </form>
      {response && (
        <div>
          <h3>Feedback (JSON):</h3>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
};

export default Prompt;
