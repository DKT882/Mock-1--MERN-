import Event from '../schemas/schema.events.js';

export const createEvent = async (req, res) => {
    try {
        const { title, venue, date, totalSeats } = req.body;
        if (!title || !venue || !date || totalSeats === undefined) {
            return res.status(400).json({
                success: false,
                message: "Validation failed: title, venue, date, and totalSeats are required fields."
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
            totalseats: totalSeats,
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
                availSeats: newEvent.availseats
            }
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: `Validation failed: ${messages.join(', ')}`
            });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getEvents = async (req, res) => {
    try {
        const { search } = req.query;
        let queryFilter = {};

        if (search) {
            queryFilter = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { venue: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const events = await Event.find(queryFilter).sort({ date: 1 });
        
        const formattedData = events.map(event => ({
            id: event.id,
            title: event.title,
            venue: event.venue,
            date: event.date.toISOString().split('T')[0],
            totalSeats: event.totalseats,
            availSeats: event.availseats
        }));

        return res.status(200).json({
            success: true,
            data: formattedData
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const bookTicket = async (req, res) => {
    try {
        const { title, venue, date, totalSeats } = req.body;
        if (!title || !venue || !date || totalSeats === undefined) {
            return res.status(400).json({
                success: false,
                message: "Validation failed: title, venue, date, and totalSeats are required fields."
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
            totalseats: totalSeats,
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
                availSeats: newEvent.availseats
            }
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: `Validation failed: ${messages.join(', ')}`
            });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}