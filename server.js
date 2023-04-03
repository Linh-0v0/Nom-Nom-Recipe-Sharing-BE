const express = require("express");
const mongoose = require("mongoose")
const app = express();

const url = 
    "mongodb+srv://nomnom:nomnom@nom.lhi5gkw.mongodb.net/?retryWrites=true&w=majority"

async function connect(){ 
    try { 
        await mongoose.connect(url);
        console.log("Connected to MongoDB");
    } catch (error){
        console.error(error);
    }
}

connect();

app.listen(8000, () => {
    console.log("Server is running on port 8000")
})