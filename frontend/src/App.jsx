import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/events'

const emptyEvent = {
  title: '',
  venue: '',
  date: '',
  totalSeats: '',
}

function readResponse(result) {
  if (result.success === false) {
    throw new Error(result.message || 'Something went wrong. Please try again.')
  }

  return result
}

function getErrorMessage(requestError, fallback) {
  return requestError.response?.data?.message || requestError.message || fallback
}

function App() {
  const [events, setEvents] = useState([])
  const [eventForm, setEventForm] = useState(emptyEvent)
  const [bookingEvent, setBookingEvent] = useState(null)
  const [bookingForm, setBookingForm] = useState({ attendeeName: '', email: '', seats: 1 })
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadEvents = useCallback(async (query = '') => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get(API_URL, {
        params: query.trim() ? { search: query.trim() } : {},
      })
      const result = readResponse(response.data)
      setEvents(result.data)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not load events. Check that the server is running.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents('')
  }, [loadEvents])

  async function handleCreateEvent(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      const response = await axios.post(API_URL, {
        ...eventForm,
        totalSeats: Number(eventForm.totalSeats),
      })
      readResponse(response.data)
      setEventForm(emptyEvent)
      setMessage('Your event has been created.')
      await loadEvents()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not create the event.'))
    }
  }

  async function handleBookTicket(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      const response = await axios.post(`${API_URL}/${bookingEvent.id}/book`, {
        ...bookingForm,
        seats: Number(bookingForm.seats),
      })
      const result = readResponse(response.data)
      setBookingEvent(null)
      setBookingForm({ attendeeName: '', email: '', seats: 1 })
      setMessage(result.message || 'Your tickets have been booked.')
      await loadEvents()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not book tickets.'))
    }
  }

  function updateEventForm(event) {
    setEventForm({ ...eventForm, [event.target.name]: event.target.value })
  }

  return (
    <div className="app-shell">
      <main>
        {(message || error) && (
          <div className={`notice ${error ? 'notice-error' : 'notice-success'}`} role="status">
            <span>{error || message}</span>
            <button type="button" onClick={() => { setMessage(''); setError('') }}>Dismiss</button>
          </div>
        )}

        <section className="events-section" id="events">
          <div className="section-heading">
            <h1>Events</h1>
            <form className="search-form" onSubmit={(event) => { event.preventDefault(); loadEvents(search) }}>
              <label className="sr-only" htmlFor="event-search">Search events</label>
              <input
                id="event-search"
                type="search"
                placeholder="Search events or places"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>

          {loading ? (
            <p className="empty-state">Finding the good stuff...</p>
          ) : events.length ? (
            <div className="event-grid">
              {events.map((event) => {
                const soldOut = Number(event.availSeats) <= 0

                return (
                  <article className="event-card" key={event.id}>
                    <div className="event-card-body">
                      <h2>{event.title}</h2>
                      <p className="event-date">{new Date(`${event.date}T00:00:00`).toLocaleDateString()}</p>
                      <p className="event-venue">{event.venue}</p>
                      <div className="event-card-bottom">
                        <span className={soldOut ? 'sold-out-label' : 'seats-count'}>
                          {soldOut ? 'Sold out' : `${event.availSeats} ${event.availSeats === 1 ? 'seat' : 'seats'} left`}
                        </span>
                        <button
                          type="button"
                          className="book-button"
                          onClick={() => { setBookingEvent(event); setError(''); setMessage('') }}
                          disabled={soldOut}
                        >
                          Book tickets
                        </button>
                      </div>
                      {bookingEvent?.id === event.id && !soldOut && (
                        <form className="booking-form" onSubmit={handleBookTicket}>
                          <label>
                            Your name
                            <input
                              required
                              minLength="1"
                              value={bookingForm.attendeeName}
                              onChange={(inputEvent) => setBookingForm({ ...bookingForm, attendeeName: inputEvent.target.value })}
                            />
                          </label>
                          <label>
                            Email
                            <input
                              required
                              type="email"
                              value={bookingForm.email}
                              onChange={(inputEvent) => setBookingForm({ ...bookingForm, email: inputEvent.target.value })}
                            />
                          </label>
                          <label>
                            Tickets
                            <input
                              required
                              type="number"
                              min="1"
                              max={Math.min(5, Number(event.availSeats))}
                              value={bookingForm.seats}
                              onChange={(inputEvent) => setBookingForm({ ...bookingForm, seats: inputEvent.target.value })}
                            />
                          </label>
                          <div className="booking-actions">
                            <button type="button" className="cancel-button" onClick={() => setBookingEvent(null)}>Cancel</button>
                            <button type="submit" className="confirm-button">Confirm booking</button>
                          </div>
                        </form>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>No events found. Be the first to create one.</p>
            </div>
          )}
        </section>

        <section className="create-section" id="create-event">
          <div className="create-copy">
            <h2>Create an event</h2>
            <p>Share your event with others.</p>
          </div>
          <form className="create-form" onSubmit={handleCreateEvent}>
            <label>
              Event name
              <input name="title" placeholder="e.g. Sunday in the park" required minLength="3" value={eventForm.title} onChange={updateEventForm} />
            </label>
            <label>
              Where
              <input name="venue" placeholder="Venue or address" required value={eventForm.venue} onChange={updateEventForm} />
            </label>
            <div className="form-row">
              <label>
                When
                <input name="date" type="date" required min={new Date().toISOString().slice(0, 10)} value={eventForm.date} onChange={updateEventForm} />
              </label>
              <label>
                How many seats?
                <input name="totalSeats" type="number" placeholder="50" required min="1" max="500" value={eventForm.totalSeats} onChange={updateEventForm} />
              </label>
            </div>
            <button className="primary-button create-button" type="submit">Create event</button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
