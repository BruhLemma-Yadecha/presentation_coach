import { useState } from "react";
import { Navigation } from "lucide-react";

import "./App.css";
import Coach from "./Coach.jsx";
import { Button } from "@/components/ui/button";
import Epilogue from "./Epilogue.jsx";

function App() {
  const [start, setStart] = useState(false);
  const [history, setHistory] = useState([]);
  const [end, setEnd] = useState(false);

  return (
    <div style={{alignContent: "center", justifyContent: "center", display: "flex", flexDirection: "column", height: "100vh"}}>
    {end ? (
      <>
        {/* Epilogue View */}
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100">
          <Epilogue history={history} />
        </div>
  
        {/* Reset Button */}
        <div className="">
          <Button
            variant="outline"
            onClick={() => {
              setStart(false);
              setEnd(false);
              setHistory([]);
            }}
          >
            Reset
          </Button>
        </div>
      </>
    ) : start ? (
      <>
        {/* Coach View */}
        <div className="" style={{ height: "100vh", width:"90vw"}}>
          <Coach setHistory={setHistory} setEnd={setEnd} />
        </div>
  
        {/* Control Buttons */}
        <div style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            zIndex: 50,
            backgroundColor: "rgba(0, 0, 0, 0.29)",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}>
        <div className="button-container">
          <Button variant="outline" onClick={() => setStart(false)}>
            Reset
          </Button>
        </div>
        <div className="button-container">
          <Button
            variant="outline"
            onClick={() => {
              setEnd(true);
              setStart(false);
            }}
          >
            End
          </Button>
        </div>
        </div>
      </>
    ) : (
      // Idle State
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Button
          className="w-48 h-16 text-2xl"
          onClick={() => setStart(true)}
        >
          Start Coach
        </Button>
      </div>
    )}
  </div>  
  );
}

export default App;
