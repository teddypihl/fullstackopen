
import { useState } from 'react'

const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas' }
  ])

  const [newName, setNewName] = useState('')

  
const addPerson = (event) => {
  event.preventDefault()

  if (newName.trim() === '') {
    return
  }

  const alreadyExists = persons.some(
    person => person.name === newName
  )

  if (alreadyExists) {
    alert(`${newName} is already added to phonebook`)
    return
  }

  const person = {
    name: newName
  }

  setPersons(persons.concat(person))
  setNewName('')
}


  return (
    <div>
      <h2>Phonebook</h2>

      <form onSubmit={addPerson}>
        <div>
          name: <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
          />
        </div>

        <button type="submit">add</button>
      </form>

      <h2>Numbers</h2>

      {persons.map(person =>
        <p key={person.name}>{person.name}</p>
      )}
    </div>
  )
}

export default App
