const express = require("express");
const router = express.Router();

const { imageUpload, videoUpload, imageSizeReducer, localFileUpload } = require("../controllers/fileUplaod");

router.post("/localFileUpload", localFileUpload);
router.post("/imageUpload", imageUpload);
router.post("/videoUpload", videoUpload);
router.post("/imageSizereducer", imageSizeReducer);

module.exports = router;