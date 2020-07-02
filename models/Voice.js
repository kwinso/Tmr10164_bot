const { Schema, model } = require("mongoose");

const VoiceSchema = new Schema({
    voice_url: String, 
    tags: [String],
    title: String, 
});
module.exports = model("Voice", VoiceSchema);