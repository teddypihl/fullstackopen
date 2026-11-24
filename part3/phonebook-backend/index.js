
require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.json())

morgan.token('body', request => {
  return JSON.stringify(request.body || {})
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Serve the production React application
app.use(express.static(path.join(__dirname, 'dist')))

// GET all persons
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(next)
})

// GET phonebook information
app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>
      `)
    })
    .catch(next)
})

// GET one person
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(next)
})

// DELETE a person
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(next)
})

// POST a new person
app.post('/api/persons', async (request, response, next) => {
  try {
    const { name, number } = request.body

    if (typeof name !== 'string' ||
        typeof number !== 'string' ||
        !name.trim() ||
        !number.trim()) {
      return response.status(400).json({
        error: 'name or number missing'
      })
    }

    const cleanName = name.trim()
    const cleanNumber = number.trim()

    const existing = await Person.findOne({ name: cleanName })

    if (existing) {
      return response.status(400).json({
        error: 'name must be unique'
      })
    }

    const person = new Person({
      name: cleanName,
      number: cleanNumber
    })

    const savedPerson = await person.save()
    response.status(201).json(savedPerson)
  } catch (error) {
    next(error)
  }
})

// PUT update an existing phone number
app.put('/api/persons/:id', (request, response, next) => {
  const { number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { number },
    {
      returnDocument: 'after',
      runValidators: true
    }
  )
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(next)
})

// Unknown endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).json({
    error: 'unknown endpoint'
  })
}

app.use(unknownEndpoint)

// Centralized error handling
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({
      error: 'malformatted id'
    })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message
    })
  }

  if (error.code === 11000) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
