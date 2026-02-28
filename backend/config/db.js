import express from 'express';
import mongoose from 'mongoose'


const connectdb= async()=>{
    try {
        await mongoose.connect(process.env.MONGOURI);
        console.log("DB connectd sucessfully");
    } catch (error) {
        console.log(error);
    }
};

export default connectdb;