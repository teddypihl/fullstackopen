
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = encodeURIComponent(process.argv[2])
const name = process.argv[3]
const number = process.argv[4]

const username = 'sneddypeddy_db_user'
const host = 'cluster0.5kbzbgk.mongodb.net'

const url = `mongodb+srv://${username}:${password}@${host}/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

const main = async () => {
  try {
    await mongoose.connect(url)

    if (name && number) {
      const person = new Person({ name, number })
      await person.save()
      console.log(`added ${name} number ${number} to phonebook`)
    } else if (!name && !number) {
      const persons = await Person.find({})
      console.log('phonebook:')
      persons.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
    } else {
      console.log('give both name and number')
    }
  } catch (error) {
    console.error('MongoDB error:', error.message)
  } finally {
    await mongoose.disconnect()
  }
}

main()
