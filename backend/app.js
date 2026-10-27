import express from 'express'
import cors from 'cors'
import eventRoutes from './src/features/routes/routes.events.js'

const app = express()

app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
    res.json({ message: 'Event booking API is running.' })
})
app.use('/api/events', eventRoutes)

export default app