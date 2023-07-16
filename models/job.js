const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); /* used for pagination  */

// 1. Schema
// 2. model
// 3. export
//  use -> model -> queries

const jobSchema = new mongoose.Schema({ /* syntax for creating any schema */
    /* for posting any job what info we needs are stated in this schema */
    postName: {
        /* by expanding this we can provide more specific details to be inserted */
        type: String,
        required: true,/* as name states if we use this then person who is posting jobs will be required to give postName */
        default: 'SDE',/* if he didn't pass any name in required value then if default value is set it will act as same */
        // enum means this are the only allowed values which can be used in this section
        // enum: ['SDE', 'Frontend Developer', 'Backend Developer', 'analyst', 'UI', 'hr', 'manager' ]
    },
    companyName: {
        type: String,
        required: true
    },
    ctc: {
        type: Number,
        required: true
    },
    location:{
        type:String,
        required:true
    },
    cgpa: {
        type:Number,
        required:true,
        min:0,
        max:10

    },
    status: {
        type:String,
        enum: ['active', 'over', 'interview'],
        default: 'active'
    },
    description: String, /* we can do this to but it doesn't perfectly give details what we need to insert here */
    numberOfPositions: Number, /* 1st then below steps */
    appliedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ],
    questions:[
        {
            title:String,
            option1: String,
            option2: String,
            option3: String,
            option4: String,
            correctAnswer : String,
        }
    ]
})

jobSchema.plugin(mongoosePaginate); /* for pagination (page nos) */
// module.exports = mongoose.model('job', jobSchema);
const jobModel = mongoose.model('job', jobSchema); /* for exporting */
module.exports = jobModel;
