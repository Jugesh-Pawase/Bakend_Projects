//import model
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

//business logic
exports.createComment = async (req, res) => {
    try {
        //fetch data from request body
        const { post, user, body } = req.body;

        //create a comment object
        const comment = new Comment({
            post, user, body
        });
        
        //save the new comment into the database
        const savedComment = await comment.save();

        //find the post by the ID. add new comment to the comment array
        const updatedPost = await Post.findByIdAndUpdate(post, { $push: { comments: savedComment._id } }, { new: true })
            .populate("comments")//populate the comments array with comment document
            .exec();
        
        res.json({
            post: updatedPost,
        });
    }
    catch (error) {
        return res.status(500).json({
            e: "Error while creating comment",
            message:error,
        });
    }
}