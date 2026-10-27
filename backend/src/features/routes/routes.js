import express, { Router } from 'express';
import router from './routes.events.js';
const router = express.Router();

router.post('/', createEvent);
router.get('/', getEvents);
Router.post('/:id',bookTicket)
export default router;
