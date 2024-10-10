const jwt = require("jsonwebtoken");
const moduledata = require("../webdata/info.json");
let clientModel = require("../model/clients/index-mongo");  // Mongoose model

async function auth(req, res) {
    try {
        if (req.session.token) {
            // Verify the JWT token
            let jwtdecode = await jwt.verify(req.session.token, moduledata["json-secret"]);
            
            // Fetch the user from MongoDB using Mongoose
            let fetchuser = await clientModel.findOne({
                ids: `${jwtdecode.id}`  // Use the Mongoose syntax for querying
            });
            
            if (jwtdecode && fetchuser) {
                
                return res.status(200).json({
                    status: true,
                    accessToken: req.session.token
                });
            } else {
               
                return res.status(200).json({
                    status: false,
                });
            }
        } else {
            
            return res.status(200).json({
                status: false,
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            status: false,
        });
    }
}

module.exports = auth;
