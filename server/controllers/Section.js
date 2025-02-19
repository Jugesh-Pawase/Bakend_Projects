const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

exports.createSection = async (req, res) => {
    try {
        //data fetch
        const { sectionName, courseId } = req.body;

        //data validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "All fields are require",
            })
        }

        //create section
        const newSection = await Section.create({ sectionName });

        //update course with section objectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                }
            }, { new: true },
        )
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        //return response
        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourseDetails,
        })

    }
    catch (error) {
        return res.status(200).json({
            success: false,
            message: "Unable to create section, please try again",
            error: error.message,
        })
    }
}

exports.updateSection = async (req, res) => {
    try {
        //data fetch
        const { sectionName, sectionId } = req.body;

        //data  validateion
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "All fields are require",
            })
        }

        //update date
        const section = await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true });

        //return response
        return res.status(200).json({
            success: true,
            section,
            message: "Section updated successfully",
        })

    } catch (error) {
        return res.status(200).json({
            success: false,
            message: "Unable to update section, please try again",
            error: error.message,
        })
    }
}

exports.deleteSection = async (req, res) => {
    try {
        const { sectionId, courseId } = req.body;

        //uudate course schema
        await Course.findByIdAndUpdate(courseId, {
            $pull: {
                courseContent: sectionId,
            },
        });

        const section = await Section.findById(sectionId);
        console.log(sectionId, courseId);
        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }

        await SubSection.deleteMany({ _id: { $in: section.subSection } });

        await Section.findByIdAndDelete(sectionId);

        res.status(200).json({
            success: true,
            message: "Section deleted",
        });
    } catch (error) {
        console.error("Error deleting section:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};