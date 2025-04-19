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
        <Epilogue history={history} />
      ) : (
        <>
          {start ? (
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
                  <Coach setHistory={setHistory} setEnd={setEnd} />
                </div>
                <div>
                  <Button id="resetButton" onClick={() => setStart(false)}>
                    Reset
                  </Button>
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
          ) : (
            <Button id="startButton" onClick={() => setStart(true)}>
              Start Coach
            </Button>
          )}
        </>
      )}
    </>
  );
}

export default App;
