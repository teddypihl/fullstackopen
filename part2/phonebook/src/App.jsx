
import { useState, useEffect } from 'react'
import personService from './services/persons'

const Filter = ({ filter, handleFilterChange }) => {
  return (
    <div>
      filter shown with:
      <input value={filter} onChange={handleFilterChange} />
    </div>
  )
}

const PersonForm = ({
  addPerson,
  newName,
  newNumber,
  handleNameChange,
  handleNumberChange
}) => {
  return (
    <form onSubmit={addPerson}>
      <div>
        name:
        <input value={newName} onChange={handleNameChange} />
      </div>
      <div>
        number:
        <input value={newNumber} onChange={handleNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ persons, deletePerson }) => {
  return (
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
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    personService.getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
      .catch(error => {
        console.error('Could not load persons', error)
      })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()

    const name = newName.trim()
    const number = newNumber.trim()

    if (name === '' || number === '') {
      return
    }

    const existingPerson = persons.find(
      person => person.name === name
    )

    if (existingPerson) {
      const confirmUpdate = window.confirm(
        `${name} is already added to phonebook, replace the old number with a new one?`
      )

      if (confirmUpdate) {
        const updatedPerson = {
          ...existingPerson,
          number: number
        }

        personService.update(existingPerson.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(current =>
              current.map(person =>
                person.id === existingPerson.id
                  ? returnedPerson
                  : person
              )
            )
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
            console.error('Could not update person', error)
            alert('Could not update the number')
          })
      }

      return
    }

    const personObject = {
      name: name,
      number: number
    }

    personService.create(personObject)
      .then(returnedPerson => {
        setPersons(current => current.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        console.error('Could not add person', error)
        alert('Could not add person')
      })
  }

  const deletePerson = (id) => {
    const person = persons.find(p => p.id === id)

    if (!person) {
      return
    }

    if (window.confirm(`Delete ${person.name}?`)) {
      personService.remove(id)
        .then(() => {
          setPersons(current =>
            current.filter(p => p.id !== id)
          )
        })
        .catch(error => {
          console.error('Could not delete person', error)
          alert('Could not delete person')
        })
    }
  }

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      <Filter
        filter={filter}
        handleFilterChange={(event) =>
          setFilter(event.target.value)
        }
      />

      <h3>Add a new</h3>

      <PersonForm
        addPerson={addPerson}
        newName={newName}
        newNumber={newNumber}
        handleNameChange={(event) =>
          setNewName(event.target.value)
        }
        handleNumberChange={(event) =>
          setNewNumber(event.target.value)
        }
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
