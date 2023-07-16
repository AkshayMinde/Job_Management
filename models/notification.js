const mongoose = require('mongoose');
const notifSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    body:{
        type:String,
        // required:true
    },
    author:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('notification', notifSchema);
