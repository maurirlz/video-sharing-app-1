const { Router } = require("express");

const { getUsers, register } = require("../controllers/userController")

const router = Router();

router.get("/all", getUsers);
router.post("/register", register)

module.exports = router;