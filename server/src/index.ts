import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import analyzeRouter from './routes/analyze'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/analyze', analyzeRouter)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`))
