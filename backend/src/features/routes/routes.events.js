import express from 'express';
import { bookTicket, createEvent, getEvents } from '../controllers/controllers.bookings.js'

const router = express.Router();

router.post('/', createEvent)
router.get('/', getEvents)
router.post('/:id/book', bookTicket)


export default router;