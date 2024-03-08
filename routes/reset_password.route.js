const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const UserModel = require("../models/user.model");

const resetPasswordController = async (req, res) => {
    const { email, token, newPassword } = req.body;

    try {
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.resetPasswordToken !== token) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Token expired' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = resetPasswordController;