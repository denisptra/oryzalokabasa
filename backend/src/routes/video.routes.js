const express = require("express");
const router = express.Router();
const videoController = require("../controllers/video.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const { uploadSetting, setUploadType } = require("../middleware/upload");

// PUBLIC
router.get("/homepage-video/active", videoController.getActiveVideo);

// PROTECTED (ADMIN & SUPER_ADMIN)
router.get("/homepage-video/", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), videoController.getAllVideos);

router.post(
    "/homepage-video/save", 
    authenticate, 
    authorize(["ADMIN", "SUPER_ADMIN"]), 
    setUploadType("settings"), 
    uploadSetting.single("videoFile"), 
    videoController.saveVideo
);

router.put("/homepage-video/toggle/:id", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), videoController.toggleActive);
router.delete("/homepage-video/delete/:id", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), videoController.deleteVideo);

module.exports = router;
