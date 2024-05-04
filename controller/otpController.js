const OTP = require("../model/otp");
const generateOTP = require("../util/genarateOtp");
const sendEmail = require("../util/mail");
const bcrypt = require("bcryptjs");
const { AUTH_EMAIL } = process.env;

const sendOTP = async (email) => {
  try {
    if (!email) {
      throw new Error("Provide values for email");
    }

    // Clear old OTP
    await OTP.deleteOne({ email });
    console.log("deleted: ",email);

    // Generate new OTP
    const generatedOTP = await generateOTP();

    // Sending email to the user
    const mailOptions = {
      from: AUTH_EMAIL,
      to: email,
      subject: "Verify the email using this OTP",
      html: `<p>Hello new user, use this OTP to verify your email and continue:</p>
             <p style="color:tomato;font-size:25px;letter-spacing:2px;">
             <b>${generatedOTP}</b></p>
             <p>OTP will expire in <b>10 minute(s)</b>.</p>`,
    };

    await sendEmail(mailOptions);

    // Save OTP record
    const hashedOTP = await bcrypt.hash(generatedOTP, 10);
    const currentDate = new Date();
    const expireAt = new Date(currentDate.getTime() + 10 * 60 * 1000); // 10 minutes
    const newOTP = new OTP({
      email,
      otp: hashedOTP,
      createdAt: currentDate,
      expireAt,
    });

    const createdOTPrecord = await newOTP.save();
    return createdOTPrecord;
  } catch (err) {
    throw err;
  }
};

module.exports = sendOTP;