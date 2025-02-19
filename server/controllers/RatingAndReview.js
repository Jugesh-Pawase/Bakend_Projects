const RatingAndReview = require("../models/RatingAndReview");
const Course = require('../models/Course');
const mongoose = require("mongoose");  

//createRating
exports.createRating = async (req, res) => {
    try {
        //get user id
        const userId = req.user.id;
        // fetch data from req body
        const { ratig, review, courseId } = req.body;
        //check if user enrolled or not
        const coursedetails = await Course.findOne({
            _id: courseId,
            studentsEnrolled: { $elemMatch: { $eq: userId } },
        });
        if (!coursedetails) {
            return res.status(400).json({
                success: false,
                message:"student is not enrolled in the course",
           }) 
        }
        //check if user aleady reviewed the coure
        const alreadyReviewed = await RatingAndReview.findOne({ user: userId, course: courseId, });
        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message:"Course is already reviewed by user",
           }) 
        }
        //create rating and review 
        const ratingReview = await RatingAndReview.create({
            ratig, review, course: courseId, user: userId,
        });
        //update coure with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId}, {
            $push: {
                ratingAndReviews:ratingReview._id,
            }
        }, { new: true })
        console.log(updatedCourseDetails);
        //return response        
        return res.status(200).json({
            success: true,
            message: "Rating and Review created successfully",
            ratingReview,
       }) 
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//getAverageRating
exports.getAverageRating = async (req, res) => {
    try {
        //get courseId
        const courseId = req.body.courseId;
        //calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course:new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating:{$avg:"$rating"},
                },
            },
        ])
        //return rating
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating:result[0].averageRating,
            })
        }
        //if no rating/reviews exist
        return res.status(200).json({
            success: true,
            message:"Average rating is 0, no rating given till now",
            averageRating:0,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//getAllRatingAndReviews
exports.getAllRating = async(req, res)=> {
    try {
        const allReviews = await RatingAndReview.find({}).sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image",
            })
            .populate({
                path: "course",
                select: "courseName",
            }).exec();
    
        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}