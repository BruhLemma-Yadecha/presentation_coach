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
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 200,
              padding: '10px 20px',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
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
