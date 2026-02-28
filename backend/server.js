import express from 'express'
import connectdb from './config/db.js'


import dotenv from "dotenv";
dotenv.config();
const PORT=3000

const app=express()

await connectdb();



app.listen(PORT,()=>{
    console.log(`Server started on ${PORT}`)
})