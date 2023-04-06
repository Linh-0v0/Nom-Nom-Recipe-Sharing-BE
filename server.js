const express = require("express");
const mongoose = require("mongoose")
const app = express();

const url = 
"mongodb+srv://nomnom:MP5s1ZQlvHHBKWJh@nom.lhi5gkw.mongodb.net/?retryWrites=true&w=majority"
async function connect(){ 
    try { 
        await mongoose.connect(url);
        console.log("Connected to MongoDB");
    } catch (error){
        console.error(error);
    }
}

connect();

app.listen(9000, () => {
    console.log("Server is running on port 8000")
})