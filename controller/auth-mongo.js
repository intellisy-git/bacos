const jwt = require("jsonwebtoken");
const usermodel = require("../model/clients/index-mongo"); // Mongoose model
const crypto = require("crypto");

class Auth {

    // Register Method
    async Register(req, res) {
        try {
            let { phone, password, server } = req.body;
            req.session.token = null
            // if (!server) {
            //     return res.status(200).json({
            //         status: false,
            //         message: "UnAuthorized"
            //     });
            // }

            if (!phone || !password) {
                return res.status(200).json({
                    status: false,
                    message: "all fields required!"
                });
            }

            if (phone.length < 10 || phone.length > 15) {
                return res.status(200).json({
                    status: false,
                    message: "invalid phone number!"
                });
            }

            if (password.length < 4 || password.length > 10) {
                return res.status(200).json({
                    status: false,
                    message: "password must be between 4 and 10 characters."
                });
            }

            let userid = crypto.randomBytes(50).toString("hex");

            // Check if the phone number already exists in MongoDB
            let available = await usermodel.findOne({
                phone: phone
            });

            if (available) {
                return res.status(200).json({
                    status: false,
                    message: "phone number taken!"
                });
            }

            // Create and save the new user in MongoDB
            let saveuser = await usermodel.create({
                ids: userid,
                username: `n***${Math.floor(Math.random() * 9) + 1}`,
                currencType: "RWF",
                seed: crypto.randomBytes(20).toString("hex"),
                phone: phone,
                password: password,
                balance: 10000,
                image: `${Math.floor(Math.random() * 60) + 1}`
            });

            if (!saveuser) throw new Error("User not saved!");

            // Generate JWT token
            let jwttoken = jwt.sign({ id: saveuser.ids }, "burden-oxen", { expiresIn: "1d" });
            req.session.token = jwttoken
            res.status(200).json({
                status: true,
                a: jwttoken
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: "Error:: unexpected error occurred!"
            });
        }
    }

    // Login Method
    async Login(req, res) {
        try {
            let { phone, password } = req.body;
            req.session.token = null
            if (!phone || !password) {
                return res.status(200).json({
                    status: false,
                    message: "all fields required!"
                });
            }

            if (phone.length < 10 || phone.length > 15) {
                return res.status(200).json({
                    status: false,
                    message: "invalid phone number!"
                });
            }

            if (password.length < 4 || password.length > 10) {
                return res.status(200).json({
                    status: false,
                    message: "password must be between 4 and 10 characters."
                });
            }

            // Search for the user by phone and password in MongoDB
            let search = await usermodel.findOne({
                phone: phone,
                password: password
            });

            if (!search) {
                return res.status(200).json({
                    status: false,
                    message: "phone or password is invalid."
                });
            }

            // Generate JWT token
            let jwttoken = jwt.sign({ id: search.ids }, "burden-oxen", { expiresIn: "1d" });
            req.session.token = jwttoken
            res.status(200).json({
                status: true,
                a: jwttoken
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: "Error:: unexpected error occurred!"
            });
        }
    }
}

module.exports = new Auth();
