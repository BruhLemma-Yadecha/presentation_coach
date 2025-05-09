import { useState } from "react";
import "./App.css";
import Coach from "./Coach.jsx";
import { Button } from "@/components/ui/button";
import Epilogue from "./Epilogue.jsx";

function App() {
  const [start, setStart] = useState(false);
  const [history, setHistory] = useState([]);
  const [end, setEnd] = useState(false);

  return (
    <>
      {end ? (
        <>
          <div className="w-full h-full">
            <Epilogue history={history} />
          </div>
          <div style={{ position: "fixed", bottom: 20, left: 20 }}>
            <button
              onClick={() => {
                setStart(false);
                setEnd(false);
                setHistory([]);
              }}
            >
              Reset
            </button>
          </div>
        </>
      ) : start ? (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              width: "100%",
              height: "100vh",
              zIndex: 100,
            }}
          >
            <Coach setHistory={setHistory} setEnd={setEnd} />
          </div>
          <div style={{ position: "fixed", bottom: 20, left: 20 }}>
            <button onClick={() => setStart(false)}>Reset</button>
          </div>
          <div style={{ position: "fixed", bottom: 20, left: 140 }}>
            <button
              onClick={() => {
                setEnd(true);
                setStart(false);
              }}
            >
              End
            </button>
          </div>
        </>
      ) : (
        <button
          style={{
            transform: "translateY(-25%) translateX(-50%)",
            position: "fixed",
            top: "50%",
            left: "50%",
            width: "20vw",
            height: "10vh",
            fontSize: "2em",
          }}
          onClick={() => setStart(true)}
        >
          Start Coach
        </button>
      )}
    </>
  );
}

export default App;
