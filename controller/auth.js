const jwt = require("jsonwebtoken");
const moduldata = require("../webdata/info.json");
const usermodel = require("../model/clients/index");
const crypto = require("crypto");

 class Auth {

    async Register(req,res) {
        try {
            
            let {
                phone,
                password,
                server
            } = req.body;

            if(!server) return res.status(401).json({
                status: false,
                message: "UnAuthorized"
            });

            if(!phone || !password) {

                return res.status(200).json({
                    status: false,
                    message: "all fields required!"
                });

            }

            if(phone.length < 10 || phone.length > 15) {
                return res.status(200).json({
                    status: false,
                    message: "invalid phone number!"
                });
            }

            if(password.length < 4 || password.length > 10) {
                return res.status(200).json({
                    status: false,
                    message: "password must be between 4 and 10 characters."
                });
            }
            let userid = crypto.randomBytes(50).toString("hex");

            let availabel = await usermodel.findOne({
                where: {
                    phone: phone
                }
            });

            if(availabel) {

                return res.status(200).json({
                    status: false,
                    message: "phone number taken!"
                });
            }
                
            
            let saveuser = await usermodel.create({
                ids: userid,
                username: `n***${Math.floor(Math.random()*9) + 1}`,
                currencType: "RWF",
                seed: crypto.randomBytes(20).toString("hex"),
                phone: phone,
                password: password,
                balance: 10000,
                image: `${Math.floor(Math.random()*60) + 1}`
            });
 

            if(!saveuser) throw "user not saved!";

            let jwttoken = jwt.sign({id: saveuser.ids},"burden-oxen",{expiresIn: "1d"});

            res.status(200).json({
                status: true,
                a: jwttoken
            })


        } catch(error) {

            console.log(error);
            return res.status(500).json({
                status: false,
                message: "Error:: unxepected error occured!"
            });
        }
    }

    async Login(req,res) {

        try {
            
            let {
                phone,
                password
            } = req.body;

            if(!phone || !password) {

                return res.status(200).json({
                    status: false,
                    message: "all fields required!"
                });

            }

            if(phone.length < 10 || phone.length > 15) {
                return res.status(200).json({
                    status: false,
                    message: "invalid phone number!"
                });
            }

            if(password.length < 4 || password.length > 10) {
                return res.status(200).json({
                    status: false,
                    message: "password must be between 4 and 10 characters."
                });
            }
            
            let search = await usermodel.findOne({
                where: {
                    phone: phone,
                    password: password
                }
            });

            if(!search) {
                return res.status(200).json({
                    status: false,
                    message: "phone or password is invalid."
                });
            }

            let jwttoken = jwt.sign({id: search.ids},"burden-oxen",{expiresIn: "1d"});

            res.status(200).json({
                status: true,
                a: jwttoken
            })


        } catch(error) {

            console.log(error);
            return res.status(500).json({
                status: false,
                message: "Error:: unxepected error occured!"
            });

        }

    }

}

module.exports = new Auth();