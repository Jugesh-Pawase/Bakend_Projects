const Profile = require("../models/Profile");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const mongoose = require("mongoose");
const { convertSecondsToDuration } = require("../utils/SecToDuration");

exports.updateProfile = async (req, res) => {
  try {
    //get data
    const { dateOfBirth = "", about = "", contactNumber = "", gender = "" } = req.body;

    //get userId
    const id = req.user.id;

    //validation
    if (!contactNumber || !gender) {
      return res.status(400).json({
        success: false,
        message: "All fields are require",
      })
    }

    //find profile
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    //update profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    //return response
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profileDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

//deleteAccount
exports.deleteAccount = async (req, res) => {
  try {
    //get data
    const id = req.user.id;
   // console.log("UserId ", id);

    //validation
    const userDetails = await User.findById({ _id: id });
  //  console.log("UserDetails ", userDetails);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    //delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    //TODO: unenroll user from all enrolled courses
    // for (const courseId of userDetails.courses) {
    //   await Course.findByIdAndUpdate(
    //     courseId,
    //     { $pull: { studentsEnroled: id } },
    //     { new: true }
    //   );
    // }

    //delete user
    await User.findByIdAndDelete({ _id: id });

    //return response
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

exports.getAllUserDetails = async (req, res) => {
  try {
    //get id
    const id = req.user.id;
    //validation and get user details
    const userDetails = await User.findById(id).select('+image').populate("additionalDetails").exec();
    //return response
    return res.status(200).json({
      success: true,
      message: "User data fetched suuccessfully",
      userDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

exports.updateDisplayPicture = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if file was uploaded
    if (!req.files || !req.files.displayPicture) {
      return res.status(400).json({
        message: 'No file uploaded.'
      });
    }

    // Access the uploaded file
    const file = req.files.displayPicture;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    // Upload image to cloudinary
    const uploadResult = await uploadImageToCloudinary(file, 'Clashgyan');

    // Update user's profile picture URL
    user.image = uploadResult.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully.',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};


exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec();
    userDetails = userDetails.toObject();
    var SubsectionLength = 0;
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0;
      SubsectionLength = 0;
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce(
          (acc, curr) => acc + parseInt(curr.timeDuration),
          0
        );
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        );
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length;
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      });
      courseProgressCount = courseProgressCount?.completedVideos.length;
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100;
      } else {
        const multiplier = Math.pow(10, 2);
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier;
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      });
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id });

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnroled.length;
      const totalAmountGenerated = totalStudentsEnrolled * course.price;

      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,

        totalStudentsEnrolled,
        totalAmountGenerated,
      };

      return courseDataWithStats;
    });

    res.status(200).json({ courses: courseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};