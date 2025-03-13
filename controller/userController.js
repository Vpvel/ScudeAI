const asyncHandler = require('express-async-handler');
const Usernew = require('../models/userschema');
const nodemailer = require("nodemailer"); // ✅ Import nodemailer
const axios = require("axios");
const OTP_STORE = {}; 
require("dotenv").config();



const sendOTP = asyncHandler(async (req, res) => {
    const { phone, email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email Address is required" });
    }

    // Check if user exists by phone or email
    let user = await Usernew.findOne({    $or: [{ phone }, { emaild: email }]  });
    let userType = "existing"; // Default to existing user

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const identifier = phone || email; // Determine identifier
    OTP_STORE[identifier] = otp; // Store OTP temporarily

    console.log(`Generated OTP for ${identifier}: ${otp}`); // Debugging (Remove in production)

    if (!user) {
        // Create a new user
        user = new Usernew();
        userType = "new"; // Mark as new user
        user.phone = phone || "null"; // Store phone if provided, else set as "null"
        user.emaild = email || "null"; // Store email if provided, else set as "null"
        user.name = "null";
        user.otp = otp;
        user.ImageBase64 = "null";
        await user.save();
    } else {
        user.otp = otp;
        if (email) user.emaild = email; // Ensure email is updated
        await user.save();
    }

    console.error("Email ID:", user.emaild);
    console.error("Email ID:", user.phone);
    console.error("Email ID:", user.phone);

    // Send OTP via Email if email is provided
    if (user.emaild !== "null") {
        await sendEmailOTP(user.emaild, otp, user.name);
    }

 
    try {
        res.json({ 
            success: true, 
            message: "OTP generated and sent successfully", 
            otp, 
            id: user.id, 
            userType 
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ success: false, message: "Error sending OTP" });
    }
});




// Function to send OTP via email
const sendEmailOTP = async (email,otp,username) => {
    try {

        console.log("SEND_EMAIL:", process.env.SEND_EMAIL);
        console.log("SEND_EMAIL_PASS:", process.env.SEND_EMAIL_PASS);

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.SEND_EMAIL,
                pass: process.env.SEND_EMAIL_PASS,
            },
        });
    
        const mailOptions = {
            from: 'sdmedia.connect@gmail.com',
            to: email,
            subject: `Welcome on board User`,
            // text: `Reset Link ${resetUrl}`
            html:
   ` <!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
    .header { background-color: #e03131; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; font-size: 25px; }
    .header h1 { font-size: 28px; color: white; font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; font-style: italic; }
    .content { background-color: #fbfbfb; text-align: center; color: #e03131; padding: 20px;}
    .content h2 { color: #e03131; font-size: 22px; font-weight: 800; }
    .content p { color: #555; font-size: 16px; }
    .otp-code { font-size: 24px; font-weight: bold; color: #e03131; background: #ffe3e3; padding: 10px 20px; display: inline-block; border-radius: 5px; margin-top: 10px; }
    .image img { width: 100%; border-radius: 8px 8px 0 0; }
    .footer { font-size: 14px; text-align: center; color: white; margin-top: 20px; background-color: #e03131; padding: 10px; border-radius: 0px 0px 8px 8px;}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>S cube innovation</h1>
    </div>

    <div class="content">
      <div class='image'>
        <img src='https://www.scubeinnovation.com/img/logo.png' alt="S cube innovation">
      </div>
      <h2>Hello User,</h2>
      <p>Your One-Time Password (OTP) for verification is:</p>
      <p class="otp-code">${otp}</p>
      <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
      <p>Thank you for choosing S cube innovation.</p>
      <p class="bottom-style">Best regards,<br>S cube  innovation Support</p>
    </div>

    <div class="footer">
      <p>&copy; 2025 S cube innovation. All rights reserved.</p>
    </div>
  </div>

</body>
</html>`,
 }
    
        await transporter.sendMail(mailOptions);
        console.error("Welcome Mail", 'Welcome Mail');
       // res.json({ message: 'Welcome Mail' });
    
    } catch (error) {
        console.error("Error sending email:", error);
    }
};


const getUserDetials = asyncHandler(async(req, res)=>{
    const {id} = req.body;

    try {
        let user = await Usernew.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            message: "User Details",
            name: user.name,
            phone: user.phone,
            ImageBase64: user.ImageBase64
        });

    } catch (error) {
        console.log("Error Fetching User", error);
        res.status(500).json({message: 'Server Error'})
    }
});

const updateUserDetails = asyncHandler(async (req, res) => {
    const { id, name, phone, ImageBase64 } = req.body;

    try {
        let user = await Usernew.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update fields only if they are provided
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (ImageBase64) user.ImageBase64 = ImageBase64;

        await user.save();

        res.json({
            success: true,
            message: "User details updated successfully",
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                ImageBase64: user.ImageBase64
            }
        });

    } catch (error) {
        console.error("Error updating user details", error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// verify OTP
const verifyOTP = asyncHandler(async (req, res) => {
    const { email,phone, otp } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email ID address Required" });
    }

    if (!phone) {
        return res.status(400).json({ success: false, message: "Phone number Required" });
    }

    if (!otp) {
        return res.status(400).json({ success: false, message: "Otp Required" });
    }

    // Check if user exists
    let user = await Usernew.findOne({ phone });

    if (!user) {
        return res.status(404).json({ success: false, message: "User not registered" });
    }

    // Retrieve stored OTP
    if (!user.otp) {
        return res.status(400).json({ success: false, message: "OTP expired or not requested" });
    }

    // Validate OTP
    if (user.otp.toString()== otp.toString()) {
    
        // Optionally, update user verification status
        user.otp = "null"; // Clear OTP field in DB
        await user.save();

        return res.json({
            success: true,
            message: "OTP verified successfully",
            userId: user.id
        });
    } else {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
});



module.exports = { sendOTP,verifyOTP,updateUserDetails,getUserDetials}
