import express from 'express';
import Event from '../schemas/schema.bookings.js';
const router = express.Router();

router.post('/events', async (req, res) => {
    try {
        const { title, venue, date, totalSeats } = req.body;

        if (!title || !venue || !date || totalSeats === undefined) {
            return res.status(400).json({
                success: false,
                message: "Validation failed: title, venue, date, and totalSeats are all required fields."
            });
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format." });
        }
        
        const today = new Date().setHours(0, 0, 0, 0);
        if (parsedDate < today) {
            return res.status(400).json({ success: false, message: "Date cannot be in the past" });
        }

        const newEvent = new Event({
            title,
            venue,
            date: parsedDate,
            totalseats: totalSeats
        });

        await newEvent.save();

        return res.status(201).json({
            success: true,
            message: "event created successfully",
            data: {
                id: newEvent.id,
                title: newEvent.title,
                venue: newEvent.venue,
                date: newEvent.date.toISOString().split('T')[0],
                totalSeats: newEvent.totalseats,
                availSeates: newEvent.availseats
            }
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.get('/events', async (req, res) => {
    try {
        const { search } = req.query;
        let queryCondition = {};

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            queryCondition = {
                $or: [
                    { title: searchRegex },
                    { venue: searchRegex }
                ]
            };
        }

        const events = await Event.find(queryCondition).sort({ date: 1 });

        const formattedEvents = events.map(event => ({
            id: event.id,
            title: event.title,
            venue: event.venue,
            date: event.date.toISOString().split('T')[0],
            totalSeats: event.totalseats,
            availSeates: event.availseats
        }));

        return res.status(200).json({
            success: true,
            data: formattedEvents
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.post('/events/:id/book', async (req, res) => {
    try {
        const { bookingId, eventId, attendeeName, seats, availSeates } = req.body;
        
    } catch (error) {
        
    }
});


export default router;
