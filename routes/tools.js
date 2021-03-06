const express = require("express");
const router = express.Router();
const Auth = require("../app/middlewares/Auth");

const toolsController = require("../app/controllers/ToolsController");

//[GET] domain.com/tools/
router.get("/", Auth, toolsController.index);

module.exports = router;
