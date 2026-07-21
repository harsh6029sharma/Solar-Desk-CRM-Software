import app from './app'
import appRouter from './routes/index'

const port = process.env.PORT || 7000

app.get("/", appRouter)

app.listen(port, ()=>{
    console.log(`server is listening on port:${port}`)
})