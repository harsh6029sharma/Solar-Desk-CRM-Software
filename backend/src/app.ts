import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import appRouter from './routes/index'
import { errorMiddleware } from './middlewares/error.middleware'
import { notFoundMiddleware } from './middlewares/notfound.middleware'

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true, limit: "10kb" }))
app.use(cookieParser())

app.use("/api/v1", appRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app