import { Router, type Request,type Response } from "express";

const router = Router()

router.get("/", (_req:Request, res:Response)=>{
    res.json({
        success:true,
        message:"Solar CRM API"
    })
})

export default router