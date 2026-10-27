import app from './app.js'
import dotenv from 'dotenv'
import connectDB from './src/features/config/db.js'

dotenv.config()
const PORT = process.env.PORT || 8000

await connectDB()
app.listen(PORT, () => {
    console.log(`Event API is running on http://localhost:${PORT}`)
})
