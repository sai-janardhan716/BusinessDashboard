const router = require("express").Router();
const authCtrl = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");


router.post("/founder-register", authCtrl.founderRegister);
router.post("/login", authCtrl.login);
router.post("/reset-password", authCtrl.resetPassword);


router.get("/users", authMiddleware, authCtrl.getUsers);

module.exports = router;