import { useState } from 'react'
import './App.css'
import Coach from './Coach.jsx'
import { Button } from "@/components/ui/button"

function App() {
  const [start, setStart] = useState(false);

  return (
    <>
      {start ? (
        <div>
          <div style={{ 
            position: 'fixed', 
            top: 0,
            width: '100%', 
            height: '100vh',
            zIndex: 100
          }}>
          <Coach/>
          </div>
          <div>
            <Button 
              onClick={() => setStart(false)}>
              Reset
            </Button>
          </div>
        </div>
      ) : (
        <Button id="startButton" onClick={() => setStart(true)}>Start Coach</Button>
      )}
    </>
  )
}

export default App;