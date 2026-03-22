import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config();
const transporter = nodemailer.createTransport({
    host: process.env.GMAIL_HOST,
    port: Number(process.env.GMAIL_PORT),
    secure: true, // true for port 465, false for other ports
    auth: {
      user: process.env.GMAIL_SENDERMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  const sendMail=async(to,otp)=>{
    await transporter.sendMail({
    from: process.env.GMAIL_SENDERMAIL,
    to,
    subject: "Reset Your Password",
    text: `Please click on this link to verify :
     ${otp} is your otp for rest the password and it will expires in 5 minutes`,
    });
  }

  export default sendMail;









//    ctua jbek rjia ywee