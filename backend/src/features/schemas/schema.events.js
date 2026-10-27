import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const eventSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        default: () => nanoid(7),
        unique: true,
    },
    title: {
        type: String,
        required: [true, "Title is required"],
        minlength: [3, "Title must be at least 3 characters"],
        trim: true
    },
    venue: {
        type: String,
        required: [true, "Venue is required"],
        minlength: [1, "Venue cannot be empty"],
        trim: true
    },
    date: {
        type: Date,
        required: [true, "Date is required"],
        validate: {
            validator: function(value) {
                return value >= new Date().setHours(0, 0, 0, 0);
            },
            message: "Date cannot be in the past"
        }
    },
    totalseats: {
        type: Number,
        required: [true, "Total seats are required"],
        min: [1, "Total seats must be at least 1"],
        max: [500, "Total seats cannot exceed 500"],
        validate: {
            validator: Number.isInteger, // Ensures it is an integer
            message: "Total seats must be an integer"
        }
    },
    availseats: {
        type: Number,
        required: [true, "Available seats are required"],
        default: function() {
            return this.totalseats;
        }
    }
}, {
    timestamps: true 
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
