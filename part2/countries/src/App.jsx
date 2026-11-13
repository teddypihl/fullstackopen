
import { useState, useEffect } from 'react'
import axios from 'axios'

const Weather = ({ country }) => {
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState(false)

  const capital = country.capital?.[0]
  const coordinates = country.capitalInfo?.latlng
  const latitude = coordinates?.[0]
  const longitude = coordinates?.[1]

  useEffect(() => {
    setWeather(null)
    setError(false)

    if (!capital || latitude == null || longitude == null) {
      return
    }

    let cancelled = false

    const url = 'https://api.open-meteo.com/v1/forecast'

    axios.get(url, {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,wind_speed_10m,weather_code'
      }
    })
      .then(response => {
        if (!cancelled) {
          setWeather(response.data.current)
        }
      })
      .catch(error => {
        console.error(error)
        if (!cancelled) {
          setError(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [capital, latitude, longitude])

  if (!capital || latitude == null || longitude == null) {
    return <p>Weather is not available for this country</p>
  }

  return (
    <div>
      <h2>Weather in {capital}</h2>

      {error ? (
        <p>Could not load weather</p>
      ) : !weather ? (
        <p>Loading weather...</p>
      ) : (
        <div>
          <p>Temperature: {weather.temperature_2m} °C</p>
          <p>Wind: {weather.wind_speed_10m} km/h</p>
          <p>Weather code: {weather.weather_code}</p>
        </div>
      )}

      <small>Weather data from Open-Meteo.com</small>
    </div>
  )
}

const Country = ({ country }) => {
  return (
    <div>
      <h2>{country.name.common}</h2>

      <p>Capital: {country.capital?.join(', ') || 'N/A'}</p>
      <p>Area: {country.area} km²</p>

      <h3>Languages</h3>
      <ul>
        {Object.values(country.languages || {}).map(language => (
          <li key={language}>{language}</li>
        ))}
      </ul>

      <img
        src={country.flags.png}
        alt={country.flags.alt || `Flag of ${country.name.common}`}
        width="150"
      />

      <Weather country={country} />
    </div>
  )
}

const App = () => {
  const [countries, setCountries] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    axios.get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
      .catch(error => {
        console.error(error)
        setError(true)
      })
  }, [])

  const handleSearch = (event) => {
    setSearch(event.target.value)
    setSelected(null)
  }

  const matches = search.trim() === ''
    ? []
    : countries.filter(country =>
        country.name.common.toLowerCase()
          .includes(search.toLowerCase())
      )

  const selectedCountry = selected
    ? countries.find(country => country.cca3 === selected)
    : matches.length === 1
      ? matches[0]
      : null

  return (
    <div>
      <h1>Countries</h1>

      <div>
        find countries:
        <input value={search} onChange={handleSearch} />
      </div>

      {error && <p>Could not load countries</p>}

      {selectedCountry ? (
        <Country country={selectedCountry} />
      ) : matches.length > 10 ? (
        <p>Too many matches, specify another filter</p>
      ) : matches.length > 1 ? (
        <div>
          {matches.map(country => (
            <div key={country.cca3}>
              {country.name.common}{' '}
              <button onClick={() => setSelected(country.cca3)}>
                show
              </button>
            </div>
          ))}
        </div>
      ) : search.trim() !== '' && countries.length > 0 ? (
        <p>No countries found</p>
      ) : null}
    </div>
  )
}

export default App
