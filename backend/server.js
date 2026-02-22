const express = require('express');
const mongoose = require('mongoose');
const Palette = require('./models/palette');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/palettesDB";

mongoose.connect(mongoURI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('Error in connecting to Database:', err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;


//Add new colors

app.post("/api/palettes", async (req, res) => {
        const newpalette = new Palette(req.body);
        await newpalette.save();
        res.status(201).json(newpalette);
});

//Get all Colors
app.get("/api/palettes", async (req, res) => {
    const palettes = await Palette.find({});
    res.status(200).json(palettes);
});

//Delete colour
app.delete("/api/palettes/:id", async (req, res) => {
    try{
        const deleted=await Palette.findByIdAndDelete(req.params.id);
        if(!deleted){
            return res.status(404).json({message: "Palette not found"});
        }
        res.status(200).json({message: "Deleted successfully"});
    }catch(error){
        res.status(500).send(error.message);
    }
});