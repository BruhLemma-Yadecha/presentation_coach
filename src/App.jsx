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
          <div style={{ width: "100%", height: "100%" }}>
            <Epilogue history={history} />
          </div>
          <div style={{ position: "fixed", bottom: 0, left: 0 }}>
            <Button id="resetButton" onClick={() => { setStart(false); setEnd(false); setHistory([]); }}>
              Reset
            </Button>
          </div>
        </>
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
            <Button id="startButton" onClick={() => setStart(true)} style={{transform: "translateY(-25%) translateX(-50%)", position: "fixed", top: "50%", left: "50%", width: "20vw", height: "10vh", fontSize: "2em"}}>
              Start Coach
            </Button>
          )}
        </>
      )}
    </>
  );
}

export default App;