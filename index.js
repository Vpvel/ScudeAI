const express = require('express');
const dotenv = require("dotenv").config();
const cors = require('cors');
const connectDb = require('./config/dbConnect');
const cookieParser = require('cookie-parser');


connectDb();

const app = express();

app.use(express.json());
const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:5502",
    "https://homepagejwlnew.netlify.app",
    "http://192.168.1.63:6011",
]
app.use(cors({
    origin: function (origin,callback){
        if(!origin || allowedOrigins.includes(origin)){
            callback(null,true);
        }else{
            callback(new Error("Not allowed by CORS"));
        }
    } ,
    credentials: true,               // Allow cookies to be sent across domains
}));
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));



app.use("/api", require('./routes/newuserRoutes'));
  



const port = process.env.PORT || 5000;
app.listen(port, ()=>{
    console.log(`server is running on ${port}`);
})
