import mongoose from 'mongoose';

const validateEmail = function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const bookingSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event reference is required']
    },
    attendeeName: {
        type: String,
        required: [true, 'Attendee name is required'],
        trim: true,
        validate: {
            validator: (value) => value.length > 0,
            message: 'Attendee name cannot be empty'
        }
    },
    email: {
        type: String,
        required: [true, 'Email address is required'],
        trim: true,
        lowercase: true,
        validate: [validateEmail, 'Please fill a valid email address']
    },
    seats: {
        type: Number,
        required: [true, 'Number of seats is required'],
        min: [1, 'Must book at least 1 seat'],
        max: [5, 'Cannot book more than 5 seats'],
        validate: {
            validator: Number.isInteger,
        }
    },
    bookedAt: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;