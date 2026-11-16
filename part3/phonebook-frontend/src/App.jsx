
import { useState, useEffect, useRef } from 'react'
import personService from './services/persons'
import Notification from './components/Notification'

const Filter = ({ value, onChange }) => (
  <div>
    filter shown with: <input value={value} onChange={onChange} />
  </div>
)

const PersonForm = ({
  addPerson,
  newName,
  newNumber,
  handleNameChange,
  handleNumberChange
}) => (
  <form onSubmit={addPerson}>
    <div>
      name: <input value={newName} onChange={handleNameChange} />
    </div>
    <div>
      number: <input value={newNumber} onChange={handleNumberChange} />
    </div>
    <button type="submit">add</button>
  </form>
)

const Persons = ({ persons, deletePerson }) => (
  <div>
    {persons.map(person => (
      <p key={person.id}>
        {person.name} {person.number}{' '}
        <button onClick={() => deletePerson(person.id)}>
          delete
        </button>
      </p>
    ))}
  </div>
)

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)

  const notificationTimer = useRef(null)

  const showNotification = (message, type = 'success') => {
    clearTimeout(notificationTimer.current)
    setNotification({ message, type })

    notificationTimer.current = setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  useEffect(() => {
    personService.getAll()
      .then(initialPersons => setPersons(initialPersons))
      .catch(error => {
        console.error(error)
        showNotification('Could not load phonebook', 'error')
      })

    return () => clearTimeout(notificationTimer.current)
  }, [])

  const addPerson = (event) => {
    event.preventDefault()

    const name = newName.trim()
    const number = newNumber.trim()

    if (!name || !number) {
      return
    }

    const existingPerson = persons.find(
      person => person.name === name
    )

    if (existingPerson) {
      if (!window.confirm(
        `${name} is already added to phonebook, replace the old number with a new one?`
      )) {
        return
      }

      const changedPerson = { ...existingPerson, number }

      personService.update(existingPerson.id, changedPerson)
        .then(returnedPerson => {
          setPersons(current => current.map(person =>
            person.id === existingPerson.id
              ? returnedPerson
              : person
          ))

          setNewName('')
          setNewNumber('')
          showNotification(`Updated ${name}'s number`)
        })
        .catch(error => {
          console.error(error)

          if (error.response?.status === 404) {
            setPersons(current => current.filter(
              p => p.id !== existingPerson.id
            ))
            showNotification(
              `Information of ${name} has already been removed from server`,
              'error'
            )
          } else {
            showNotification(`Failed to update ${name}`, 'error')
          }
        })

      return
    }

    personService.create({ name, number })
      .then(returnedPerson => {
        setPersons(current => current.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
        showNotification(`Added ${name}`)
      })
      .catch(error => {
        console.error(error)
        showNotification(`Failed to add ${name}`, 'error')
      })
  }

  const deletePerson = (id) => {
    const person = persons.find(p => p.id === id)

    if (!person) return

    if (window.confirm(`Delete ${person.name}?`)) {
      personService.remove(id)
        .then(() => {
          setPersons(current => current.filter(p => p.id !== id))
          showNotification(`Deleted ${person.name}`)
        })
        .catch(error => {
          console.error(error)

          if (error.response?.status === 404) {
            setPersons(current => current.filter(p => p.id !== id))
            showNotification(
              `${person.name} was already removed from server`,
              'error'
            )
          } else {
            showNotification(
              `Failed to delete ${person.name}`,
              'error'
            )
          }
        })
    }
  }

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification
        message={notification?.message}
        type={notification?.type}
      />

      <Filter
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      />

      <h3>Add a new</h3>

      <PersonForm
        addPerson={addPerson}
        newName={newName}
        newNumber={newNumber}
        handleNameChange={(event) => setNewName(event.target.value)}
        handleNumberChange={(event) => setNewNumber(event.target.value)}
      />

      <h3>Numbers</h3>

      <Persons
        persons={personsToShow}
        deletePerson={deletePerson}
      />
    </div>
  )
}

export default App
