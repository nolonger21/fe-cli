import React from 'react'
import { useState, useEffect } from 'react'

interface IMap {
  a: string
  b: number
}

const map: IMap = {
  a: '1',
  b: 2,
}

const a = {
  a: 'a',
}
const b = { ...a }

console.info(b)

function App(): React.ReactElement {
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(1)
    console.info(map)
  }, [])
  return <div id="App">hello react {count}</div>
}

export default App
