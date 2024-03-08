const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const UserModel = require("../models/user.model");

function generateUniqueCode() {
    const alphanumericChars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZ';  // O, 0 , I excluded
    let code = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * alphanumericChars.length);
        code += alphanumericChars.charAt(randomIndex);
    }
    return code;
}

const forgetPasswordController = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await UserModel.findOneAndUpdate(
            { email },
            {
                $set: {
                    resetPasswordToken: generateUniqueCode(),
                    resetPasswordExpires: Date.now() + 3600000 // One hour expiration
                }
            },
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = user.resetPasswordToken;
        console.log('Generated Token:', token);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port : 587,
            secure : false,
            auth: {
                user: 'satresumit2op@gmail.com',
                pass: 'Sumit@123'
            }
        });

        const mailOptions = {
            from: 'saurabhsatre2001@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `Use this token to reset your password: ${token}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                res.status(500).json({ message: 'Failed to send email' });
            } else {
                res.status(200).json({ message: 'Token sent to your email' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = forgetPasswordController;
