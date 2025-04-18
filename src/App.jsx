import { useState, useRef, useEffect } from 'react'
import './App.css'
import Coach from './Coach.jsx'

function App() {
  const [start, setStart] = useState(false);

  return (
    <>
      {start ? (
        <div style={{ 
          position: 'fixed', 
          top: 0,
          width: '100%', 
          height: '100vh',
          zIndex: 100
        }}>
          <Coach />
          <button 
            onClick={() => setStart(false)} 
            id="startButton"
          >
            Reset
          </button>
        </div>
      ) : (
        <button onClick={() => setStart(true)}>Start Coach</button>
      )}
    </>
  )
}

export default App;
