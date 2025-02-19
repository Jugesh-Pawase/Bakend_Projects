const File = require("../models/File");
const cloudinary = require("cloudinary").v2;

//localfileupload -> handler function
exports.localFileUpload = async (req, res) => {
    try {
        //fetch file from request
        const file = req.files.file;
        console.log("File -> ",file);

        //create a path where file need to be stored on server
        let path = __dirname + "/files/" + Date.now()+`.${file.name.split('.')[1]}`;
        console.log("Path -> ", path);

        //add path to move function
        file.mv(path, (err) => {
            console.log(err);
        });

        //create a successfull response
        res.json({
            success: true,
            message: "Local file uploaded successfully",
        });
    }
    catch (error) {
        console.log(error);
    }
}

function isFileTypeSupported(type, supportedTypes) {
    return supportedTypes.includes(type);
}

async function uploadFileToCloudinary(file, folder, quality) {
    const options = { folder: folder };

    //only for imagSizeReducer controller
    if (quality) {
        options.quality = quality;
    }

    //only for videoUpload controller
    options.resource_type = "auto";

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}

//image upload ka handler
exports.imageUpload = async (req, res) => {
    try {
        //fetch data
        const { name, tags, email } = req.body;
        console.log(name, tags, email);

        const file = req.files.imageFile;
        console.log(file);

        //validation
        const supportedTypes = ["jpg", "jpeg", "png"];
        const fileType = file.name.split('.')[1].toLowerCase();
        console.log("fileType", fileType);

        if (!isFileTypeSupported(fileType, supportedTypes)) {
            return res.status(400).json({
                success: false,
                message: "File format not supported",
            });
        }

        //file format supported hai
        console.log("Uploading to Clashgyan");
        const response = await uploadFileToCloudinary(file, "Clashgyan");
        console.log(response);

        //DB me entry karni hai
        const fileData = await File.create({
            name,
            tags,
            email,
            imageUrl: response.secure_url,
        });

        res.json({
            success: true,
            imageUrl: response.secure_url,
            message: "Image successfully uploaded",
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Something went wrong",
            data: error.message,
        });
    }
}

//video upload ka handler
exports.videoUpload = async (req, res) => {
    try {
        //fetch data
        const { name, tags, email } = req.body;
        console.log(name, tags, email);

        const file = req.files.videoFile;

        //validation
        const supportedTypes = ["mp4", "mov"];
        const fileType = file.name.split('.')[1].toLowerCase();
        console.log("fileType", fileType);
        
        //TODO:add a upper limit of 5MB for video
        if (!isFileTypeSupported(fileType, supportedTypes)) {
            return res.status(400).json({
                success: false,
                message: "File format not supported",
            });
        }

        //file format supported hai
        console.log("Uploading to Clashgyan");
        const response = await uploadFileToCloudinary(file, "Clashgyan");
        console.log(response);

        //DB me entry karni hai
        const fileData = await File.create({
            name,
            tags,
            email,
            imageUrl: response.secure_url,
        });

        res.json({
            success: true,
            imageUrl: response.secure_url,
            message: "Video successfully uploaded",
        });
    }
    catch(error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Something went wrong",
            data: error.message,
        });
    }
}

exports.imageSizeReducer = async (req, res) => {
    try {
        //fetch data
        const { name, tags, email } = req.body;
        console.log(name, tags, email);

        const file = req.files.imageFile;
        console.log(file);

        //validation
        const supportedTypes = ["jpg", "jpeg", "png"];
        const fileType = file.name.split('.')[1].toLowerCase();
        console.log("fileType",fileType)

        if (!isFileTypeSupported(fileType, supportedTypes)) {
            return res.status(400).json({
                success: false,
                message:"File format not supported",
            })
        }

        //file format supported hai
        console.log("Uploading to Clashgyan");
        const response = await uploadFileToCloudinary(file, "Clashgyan", 30);
        console.log(response);

        //DB me entry karni hai
        const fileData = await File.create({
            name,
            tags,
            email,
            imageUrl:response.secure_url,
        })

        res.json({
            success: true,
            imageUrl:response.secure_url,
            message:"Image successfully uploaded",
        })   
    }
    catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Something went wrong",
            data: error.message,
        });
    }
}