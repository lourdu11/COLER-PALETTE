const mongoose = require('mongoose');

const paletteSchema = new mongoose.Schema({
    title :String,
    colors : [String],  //Array of hex codes like ["#FF5733", "#33FF57"]
});

module.exports = mongoose.model('Palette', paletteSchema);