//import the require modules
const express = require("express");
const router = express.Router();

//Import the controllers
//Import course controllers
const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
} = require("../controllers/Course");

//Import category controllers
const {
    showAllCategories,
    createCategory,
    categoryPageDetails,
} = require("../controllers/Category");

//Import Section Controllers
const {
    createSection,
    updateSection,
    deleteSection,
} = require("../controllers/Section");

//Import Subsection Controllers
const {
    createSubSection,
    updateSubSection,
    deleteSubSection,
} = require("../controllers/SubSection");

//Import Rating Controllers
const {
    createRating,
    getAverageRating,
    getAllRating,
} = require("../controllers/RatingAndReview");

const {
    updateCourseProgress,
    getProgressPercentage,
  } = require("../controllers/CourseProgress");
  
//Import middlewares
  const {
    auth,
    isInstructor,
    isStudent,
    isAdmin,
} = require("../middlewares/auth");
  

router.post("/createCourse", auth, isInstructor, createCourse);

router.post("/editCourse", auth, isInstructor, editCourse);

router.post("/addSection", auth, isInstructor, createSection);

router.post("/updateSection", auth, isInstructor, updateSection);

router.post("/deleteSection", auth, isInstructor, deleteSection);

router.post("/addSubSection", auth, isInstructor, createSubSection);

router.post("/updateSubSection", auth, isInstructor, updateSubSection);

router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);

router.get("/getAllCourses", getAllCourses);

router.post("/getCourseDetails", getCourseDetails);

router.post("/getFullCourseDetails", auth, getFullCourseDetails);

router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

router.delete("/deleteCourse", deleteCourse);

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);

router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router;