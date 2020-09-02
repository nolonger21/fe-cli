import React from 'react'
import { useState, useEffect } from 'react'

function App() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    setTimeout(() => {
      setCount(count + 1)
    }, 3000)
  })
  return <div id="App">hello react {count}</div>
}

export default App
