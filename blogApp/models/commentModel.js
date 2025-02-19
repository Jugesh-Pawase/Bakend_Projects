//import mpongoose
const mongoose = require("mongoose");

//route handler
const commentSchema = new mongoose.Schema({
    post: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post", //reference to the post model
    },
    user: {     //comment karne wala
        type: String,
        required:true,
    },
    body: {     //comment
        type: String,
        required:true,
    }
})

//export
module.exports = mongoose.model("Comment", commentSchema);