import Booking from '../schemas/schema.bookings.js'
import Event from '../schemas/schema.events.js'

const formatEvent = (event) => ({
    id: event.id,
    title: event.title,
    venue: event.venue,
    date: event.date.toISOString().split('T')[0],
    totalSeats: event.totalseats,
    availSeats: event.availseats
})

export const createEvent = async (req, res) => {
    try {
        const { title, venue, date, totalSeats } = req.body
        if (!title || !venue || !date || totalSeats === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Title, venue, date, and total seats are required.'
            })
        }

        const event = await Event.create({
            title,
            venue,
            date,
            totalseats: totalSeats
        })

        return res.status(201).json({
            success: true,
            message: 'Event created successfully.',
            data: formatEvent(event)
        })
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            const message = error.name === 'ValidationError'
                ? Object.values(error.errors).map((validationError) => validationError.message).join(', ')
                : 'Please enter valid event details.'
            return res.status(400).json({ success: false, message })
        }
        console.error('Could not create event:', error)
        return res.status(500).json({ success: false, message: 'Could not create event.' })
    }
}

export const getEvents = async (req, res) => {
    try {
        const filter = {}
        if (typeof req.query.search === 'string' && req.query.search.trim()) {
            const search = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { venue: { $regex: search, $options: 'i' } }
            ]
        }

        const events = await Event.find(filter).sort({ date: 1 })
        return res.status(200).json({
            success: true,
            data: events.map(formatEvent)
        })
    } catch (error) {
        console.error('Could not get events:', error)
        return res.status(500).json({ success: false, message: 'Could not get events.' })
    }
}

export const bookTicket = async (req, res) => {
    try {
        const { attendeeName, email, seats } = req.body
        if (!attendeeName?.trim() || !email?.trim() || !Number.isInteger(seats) || seats < 1 || seats > 5) {
            return res.status(400).json({
                success: false,
                message: 'Enter your name, a valid email, and a ticket quantity between 1 and 5.'
            })
        }

        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, availseats: { $gte: seats } },
            { $inc: { availseats: -seats } },
            { new: true, runValidators: true, timestamps: false }
        )

        if (!event) {
            const exists = await Event.exists({ _id: req.params.id })
            return exists
                ? res.status(400).json({ success: false, message: 'Not enough seats left.' })
                : res.status(404).json({ success: false, message: 'Event not found.' })
        }

        try {
            const booking = await Booking.create({
                eventId: event._id,
                attendeeName: attendeeName.trim(),
                email: email.trim(),
                seats
            })

            return res.status(201).json({
                success: true,
                message: 'Tickets booked successfully.',
                data: {
                    id: booking.id,
                    eventId: event.id,
                    attendeeName: booking.attendeeName,
                    email: booking.email,
                    seats: booking.seats
                }
            })
        } catch (error) {
            await Event.findByIdAndUpdate(event._id, { $inc: { availseats: seats } })
            throw error
        }
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Please enter valid booking details.' })
        }
        console.error('Could not book tickets:', error)
        return res.status(500).json({ success: false, message: 'Could not book tickets.' })
    }
}
