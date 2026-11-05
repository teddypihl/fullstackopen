
import { useState } from 'react'

const Button = (props) => {
  return (
    <button onClick={props.onClick}>
      {props.text}
    </button>
  )
}


const StatisticLine = (props) => {
  return (
    <tr>
      <td>{props.text}</td>
      <td>{props.value}</td>
    </tr>
  )
}



const Statistics = (props) => {
  const all = props.good + props.neutral + props.bad

  if (all === 0) {
    return <p>No feedback given</p>
  }

  const average = (props.good - props.bad) / all
  const positive = (props.good / all) * 100

  return (
    <table>
      <tbody>
        <StatisticLine text="good" value={props.good} />
        <StatisticLine text="neutral" value={props.neutral} />
        <StatisticLine text="bad" value={props.bad} />
        <StatisticLine text="all" value={all} />
        <StatisticLine text="average" value={average} />
        <StatisticLine text="positive" value={`${positive} %`} />
      </tbody>
    </table>
  )
}


const App = () => {
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      <h1>Give feedback</h1>

      <Button
        text="good"
        onClick={() => setGood(good + 1)}
      />
      <Button
        text="neutral"
        onClick={() => setNeutral(neutral + 1)}
      />
      <Button
        text="bad"
        onClick={() => setBad(bad + 1)}
      />

      <h2>Statistics</h2>
      <Statistics good={good} neutral={neutral} bad={bad} />
    </div>
  )
}

export default App
