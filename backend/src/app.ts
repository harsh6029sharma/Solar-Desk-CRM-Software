import express from 'express'
import cookieParser from 'cookie-parser'
import { errorMiddleware } from './middlewares/error.middleware'
import { notFoundMiddleware } from './middlewares/notfound.middleware'

const app = express()

app.use(express.json({limit:"10kb"})) // we have set limit=10kb to protect from large payload attacks
app.use(express.urlencoded({extended:true, limit:"10kb"}))
app.use(cookieParser())

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app