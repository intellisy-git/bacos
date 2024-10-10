const jwt = require("jsonwebtoken");
const moduledata = require("../webdata/info.json");
let clientModel = require("../model/clients/index");
async function auth(req,res)  {
    try {

        if(req.body.ls) {

            let jwtdecode = await jwt.verify(req.body.ls,moduledata["json-secret"]);
            let fetchuser = await clientModel.findOne({
                where: {
                    ids: `${jwtdecode.id}`
                }
            });
            if(jwtdecode && fetchuser) {
                
                return res.status(200).json({
                    status: true,
                    accessToken: req.body.ls
                });
            }else {

                return res.status(200).json({
                    status: false,
                });
            }

        }else {
            return res.status(200).json({
                status: false,
            });
        }

    } catch(error) {
        return res.status(200).json({
            status: false,
        })
    }

}

module.exports = auth;
