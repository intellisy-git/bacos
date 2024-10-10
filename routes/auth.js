const expressRouter = require("express").Router();
let {
    Login,Register
} = require("../controller/auth");

const authMiddleware = require("../middleware/auth");

expressRouter.post("/api/user/check/",authMiddleware);
expressRouter.post("/api/user/register/",Register);
expressRouter.post("/api/user/login/",Login);

module.exports = expressRouter;