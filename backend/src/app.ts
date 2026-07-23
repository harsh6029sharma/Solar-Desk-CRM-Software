import express from 'express'
import cookieParser from 'cookie-parser'
import appRouter from './routes/index'
import { errorMiddleware } from './middlewares/error.middleware'
import { notFoundMiddleware } from './middlewares/notfound.middleware'

const app = express()

app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true, limit: "10kb" }))
app.use(cookieParser())

app.use("/api/v1", appRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app