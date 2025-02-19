const Category = require("../models/Category");

//handler function of create category
exports.createCategory = async (req, res) => {
    try {
        //fetch data
        const { name, description } = req.body;

        //validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are require",
            })
        }
        
        //create entry in DB
        const categoryDetails = await Category.create({
            name: name,
            description:description,
        })
        console.log("CategoryDetails ", categoryDetails);

        //return response
        return res.status(200).json({
            success: true,
            message: "Category created successfully",
            categoryDetails,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//handler function for get all categories
exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({}, { name: true, description: true });

        return res.status(200).json({
            success: true,
            data: allCategories,
            message: "All categories returned successfully",
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//CategoryPageDetails
exports.categoryPageDetails = async (req, res) => {
    try {
        //get categoryId
        const { categoryId } = req.body;
        //get courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();
        //validation
        if (!selectedCategory) {
            return res.status(400).json({
                success: false,
                message: "Data not found",
            })
        }
        //get courses for different categories
        const differentCategories = await Category.find({ _id: { $ne: categoryId }, }).populate("courses").exec();
        //get top(10) selling courses:todo

        //return response
        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}