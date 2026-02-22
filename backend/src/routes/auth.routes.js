const router = require("express").Router();
const authCtrl = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Public routes
router.post("/founder-register", authCtrl.founderRegister);
router.post("/login", authCtrl.login);
router.post("/reset-password", authCtrl.resetPassword);

// Protected route — requires valid JWT
router.get("/users", authMiddleware, authCtrl.getUsers);

module.exports = router;