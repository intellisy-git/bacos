const expressRouter = require("express").Router();
let {
    Login,Register
} = require("../controller/auth-mongo");

const authMiddleware = require("../middleware/auth-mongo");

expressRouter.post("/api/user/check/",authMiddleware);
expressRouter.post("/api/user/register/",Register);
expressRouter.post("/api/user/login/",Login);

module.exports = expressRouter;