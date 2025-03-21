import express from "express";
import { authMiddleWare } from "./middleware";
import { prismaClient } from "db/client";
import cors from "cors";

const app = express()

app.use(cors())
app.use(express.json())
app.post("/api/v1/website", authMiddleWare, async (req,res)=>{
    console.log("sending website Post request")
    const userId = req.userId!;
    const {url} = req.body;

    const data = await prismaClient.website.create({
       data:{
        userId,
        url
       }
    })

    res.json({
        id:data.id,
        url:data.url
    })
    console.log("website Post")

})

app.get("/api/v1/website/status", authMiddleWare, async (req,res) =>{
    const websiteId = req.query.websiteId! as unknown as string;
    const userId = req.userId;

    const data = await prismaClient.website.findFirst({
        where:{
            id: websiteId,
            userId,
            disabled:false
        },
        include:{
            ticks:true
        }
    })

    res.json(data);
})

app.get("/api/v1/websites", authMiddleWare, async (req,res) =>{
    const userId = req.userId;

    const webesites = await prismaClient.website.findMany({
        where:{
            userId,
            disabled:false
        },
        include:{
            ticks:true
        }
    })

    res.json(webesites)
    console.log("API2 HIT")
})

app.delete("/api/v1/website", authMiddleWare, async(req,res) =>{
    const websiteId = req.body.websiteId
    const userId = req.userId

    await prismaClient.website.update({
        where:{
            id:websiteId,
            userId
        },
        data:{
            disabled:true
        }
    })

    res.json({
        message: "Website Deleted"
    })
})

app.listen(8080)