const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const crypto = require("crypto");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");
const { courseEnrollmentEmail } = require("../mail/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mail/PaymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");

//capture the payment and instance the razorpay order
exports.capturePayment = async (req, res) => {
    //get courseId and userId
    const { course_id } = req.body;
    const userId = req.user.id;
    //validation
    //valid courseId
    if (!course_id) {
        return res.json({
            success: false,
            message:"Please provide valid course ID"
        })
    }
    //valid courseDetail
    let course;
    try {
        course = await Course.findById(course_id);
        if (!course) {
            return res.json({
                success: false,
                message:"Could not found the course",
            })
        }

        //check for user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: false,
                message:"Student is already enrolled",
            })
        }
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

    //create order
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            course: {
                courseId: course_id,
                userId,
            }
        }
    }

    try {
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        //return response
        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription:course.courseDescripton,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount:paymentResponse.amount,
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message:"Could not initiate order",
        })
    }
}

//verify signature of razorpay and server
exports.verifyPayment = async (req, res) => {
    const webhookSecret = "12345678";//server
    const signature = req.headers("x-razorpay-signature");//razorpay

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature === digest) {
        console.log("Payment is Authorised");

        const { courseId, userId } = req.body.payload.payment.entity.notes;
        
        try {
            //find the course and enroll the student in it
            const enrolledCourse = await Course.findByIdAndUpdate({ _id: courseId },
                { $push: { studentsEnrolled: userId } },{new:true},
            )
            if (!enrolledCourse) {
                return res.status(500).json({
                    success: false,
                    message: "Course not found",
                });
            }
            console.log(enrolledCourse);

            //find the student and add the course in their enrolled courses list
            const enrolledStudent = await User.findByIdAndUpdate({ _id: userId },
                {$push:{courses:courseId}},{new:true},
            )
            console.log(enrolledStudent);

            //send confirmaton mail to student/user
            const emailResponse = await mailSender(enrolledStudent.email,
                "Congratulations from CodeHelp",
                "Congratulations, you rae unboarded into a new CodeHelp course",
            );
            console.log(emailResponse);

            return res.status(200).json({
                success: true,
                message: "Signature verified and course added",
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    else {
        return res.status(400).json({
            success: false,
            message: "Invalid request",
        });
    }
}

exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body;
  
    const userId = req.user.id;
  
    if (!orderId || !paymentId || !amount || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the details" });
    }
  
    try {
      const enrolledStudent = await User.findById(userId);
  
      await mailSender(
        enrolledStudent.email,
        `Payment Received`,
        paymentSuccessEmail(
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
          amount / 100,
          orderId,
          paymentId
        )
      );
    } catch (error) {
      console.log("error in sending mail", error);
      return res
        .status(400)
        .json({ success: false, message: "Could not send email" });
    }
  };
  
  const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please Provide Course ID and User ID",
        });
    }
  
    for (const courseId of courses) {
      try {
        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId },
          { $push: { studentsEnroled: userId } },
          { new: true }
        );
  
        if (!enrolledCourse) {
          return res
            .status(500)
            .json({ success: false, error: "Course not found" });
        }
        console.log("Updated course: ", enrolledCourse);
  
        const courseProgress = await CourseProgress.create({
          courseID: courseId,
          userId: userId,
          completedVideos: [],
        });
  
        const enrolledStudent = await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              courses: courseId,
              courseProgress: courseProgress._id,
            },
          },
          { new: true }
        );
  
        console.log("Enrolled student: ", enrolledStudent);
  
        const emailResponse = await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
          )
        );
  
        console.log("Email sent successfully: ", emailResponse.response);
      } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, error: error.message });
      }
    }
  };
  