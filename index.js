import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB  from './Database/config.js';
import router from './Router/userRouter.js';
dotenv.config();

const app = express();
const port = process.env.PORT;
connectDB();

app.use(express.json())

app.use(cors());


app.use('/user',router)


app.use('/', (req,res)=>{
    // res.status(200).send("example")
    res.status(200).send(` <h1> Welcome to our Password Reset backend</h1>`);
})



app.listen(port,()=>{
    console.log(`server is running on ${port}`);
})