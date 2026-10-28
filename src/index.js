import express from 'express';
import authroutes from './routes/auth.js'
import marketroutes from './routes/market.js'
import resolveroutes from './routes/resolve.js'
import mongoose from 'mongoose';
import "dotenv/config";

await mongoose.connect(process.env.MONGO_URL)
   .then(()=>{console.log("MongoDB connected")})
   .catch((error)=>{console.log("Connection failed",error)})

const app = express();

app.use(express.json());
app.use("/", authroutes);
app.use("/", marketroutes);
app.use("/", resolveroutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server listening on Port ${PORT}`);
})