// server.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import session from 'express-session'
import { requestLogger } from './utils/requestLogger.js'
import authRoutes from './routes/auth.js'
import bookRoutes from './routes/books.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(morgan('dev'))

app.use(
  session({
    secret: 'bookverse_session_secret',
    resave: false,
    saveUninitialized: false
  })
)

// Routes
app.use('/auth', authRoutes)
app.use('/books', bookRoutes)

app.get('/', (req, res) => {
  res.send('📚 Welcome to BookVerse Review API')
})

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`))
