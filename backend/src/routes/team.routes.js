const express = require("express");
const router = express.Router();
const teamController = require("../controllers/team.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const { uploadTeam, setUploadType } = require("../middleware/upload");

// PUBLIC ENDPOINTS

// GET /api/team - Ambil semua member (admin view, include inactive)
router.get("/team", teamController.getAllMembers);

// GET /api/team/active - Ambil member aktif saja (untuk website frontend)
router.get("/team/active", teamController.getActiveMembers);

// GET /api/team/:id - Ambil detail member
router.get("/team/:id", teamController.getMemberById);

// PROTECTED ENDPOINTS (ADMIN+)

// POST /api/team/create - Buat member baru (file upload)
router.post(
    "/team/create",
    authenticate,
    authorize("ADMIN", "SUPER_ADMIN"),
    setUploadType("team"),
    uploadTeam.single("image"), // Menggunakan instance yang sama dari upload middleware, atau buat uploadTeam
    teamController.createMember
);

// PUT /api/team/update/:id - Edit member (optional new file)
router.put(
    "/team/update/:id",
    authenticate,
    authorize("ADMIN", "SUPER_ADMIN"),
    setUploadType("team"),
    uploadTeam.single("image"),
    teamController.updateMember
);

// PUT /api/team/toggle/:id - Aktifkan/nonaktifkan member
router.put(
    "/team/toggle/:id",
    authenticate,
    authorize("ADMIN", "SUPER_ADMIN"),
    teamController.toggleMemberStatus
);

// PUT /api/team/reorder - Ubah urutan member
router.put(
    "/team/reorder",
    authenticate,
    authorize("ADMIN", "SUPER_ADMIN"),
    teamController.reorderMembers
);

// DELETE /api/team/delete/:id - Hapus member
router.delete(
    "/team/delete/:id",
    authenticate,
    authorize("ADMIN", "SUPER_ADMIN"),
    teamController.deleteMember
);

module.exports = router;
