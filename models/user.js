const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');/* for using passport with mongoose */


const userSchema = new mongoose.Schema({
    username:{ /* for passport module it is compulsory to have a username variable */
        type:String,
        unique:true,
        required:true
    },
    dob:String,
    phone:String,
    gender:String,
    isAdmin: {
        type:Boolean,
        default:false
    },
    cgpa:{
        type:Number,
        min:0,
        max:10
    },
    resume: {
        type: mongoose.Schema.ObjectId,
        ref: 'resume'
    }

})

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('user', userSchema);