import app from './app'
import type { Request,Response } from 'express'

const port = process.env.PORT || 7000

app.get("/", (req:Request,res:Response)=>{
    res.send('hello world')
})

app.listen(port, ()=>{
    console.log(`server is listening on port:${port}`)
}) 