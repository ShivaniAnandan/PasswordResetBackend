import userModel from "../Model/userSchema.js";
import auth from "../Common/auth.js";
import randomstring from "randomstring";
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const signup = async(req,res)=>{
    try {
        let user = await userModel.findOne({email:req.body.email})
        if(!user)
        {
            req.body.password = await auth.hashPassword(req.body.password)
            const newuser = await userModel.create(req.body)
            res.status(201).send({
                message:`User ${req.body.userName} is Succesfully created`,
                newuser
            })
        }
       
        else{
            res.status(404).send({
                message:`user with ${req.body.email} is allready exist`
            })
        }
        
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
        })
    }
}

export const login = async(req,res)=>{
    try {
     let user = await userModel.findOne({email:req.body.email})
     if(user)
     {
        let hashcompare = await auth.hashcompare(req.body.password,user.password)
        const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        
        if(hashcompare)
        {
            const user = await userModel.findOne({email:req.body.email},{password:0})
            res.status(201).send({
                message:` User ${user.userName} is login successfully`,
                token,
                user

            })
        }
        else
        {
            res.status(404).send({
                message:"Invalid Passward"
            })
        }
     }
     else{
        res.status(404).send({
            message:`User with ${req.body.email} is not Found pleas signup`
        })
     }
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
        })
    }
}

export const getAllUser = async(req,res)=>{
    try {
       const allusers = await userModel.find({},{password:0,_id:0})
       res.status(200).send({
        message:"users Fetched Successfully",
        allusers
       })
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
        })
    }
}

// export const forgetPassword = async(req,res)=>{
//     try {
//         // const {token} = req.params
//         let user = await userModel.findOne({email:req.body.email})
//         if(user)
//         {
//             // const randomString = randomstring.generate({
//             //     length:10,
//             //     charset:"alphanumeric"
//             // })

//             // const randomString = token;

//             const randomString = crypto.randomBytes(20).toString('hex');

//             const expitationTimestamp = Date.now() + 2 * 60 * 1000

//             console.log(expitationTimestamp)

//             const resetLink = `${process.env.ResetUrl}/reset-password/${randomString}/${expitationTimestamp}`

//             const transporter = nodemailer.createTransport({
//                 service:"gmail",
//                 auth:{
//                     user:process.env.EMAIL_ID,
//                     pass:process.env.SECRET_KEY,

//                 }
//             })

//             const mailOptions = {
//                 from: process.env.EMAIL_ID,
//                 to : user.email,
//                 subject:"Password-Reset-Link",
//                 html:`
//                 <p> Dear ${user.userName} , </p>
                
//                 <p>Sorry to hear you’re having trouble logging into your account. We got a message that you forgot your password. If this was you, you can get right back into your account or reset your password now. </p>
//                 <p> Click the following Link to reset your password \n ${resetLink} </p>

//                 <p>If you didn’t request a login link or a password reset, you can ignore this message. </P>

//                 <p> Only people who know your account password or click the login link in this email can log into your account. </P>
//                 `

                
                
//             }
//             transporter.sendMail(mailOptions,(error,info)=>{
//                 if(error){
//                     console.log(error)
//                     res.status(500).send({
//                         message:"Failed to send the password reset mail"
//                     })
//                 }
//                 else
//                 {
//                     console.log("password reset email sent" + info.response)
//                     res.status(201).send({
//                         message:"password reset mail sent sucessfully"
//                     })
//                 }
//                 user.randomString=randomString
//                 console.log(randomString)
//                  user.save()
//                 res.status(201).send({message:"Reset password email sent successfully and random string update in db"})
//             })
//         }
//         else
//         {
//             res.status(400).send({
//                 message:`user with ${req.body.email} is exists`
//             })
//         }
//     } catch (error) {
//         console.log (error)
//         res.status(500).send({
//             message:"Internel Server Error"
//         })
//     }
// }

// export const resetPassword = async(req,res)=>{
    
//     try {
//         const {token,expitationTimestamp}= req.params

//         const user = await userModel.findOne({randomString:randomString})
//         if(!user || user.randomString !== token)
//         {
//             res.status(400).send({
//                 message:"Invalid Random Sting"
//             })
//         }
//         else
//         {
//             if(expitationTimestamp && expitationTimestamp<Date.now())
//             {
//                 res.status(400).send({
//                     message:"expirationTimestamp token has expired. Please request a new reset link."
//                 })
//             } else{
//                 if(req.body.newPassword){
//                     const newPassword = await auth.hashPassword(req.body.newPassword)

//                     user.password = newPassword
//                     user.randomString=null
//                     await user.save()

//                     res.status(201).send({
//                         message:"Your new password has been updated"
//                     })
//                 }else{
//                     res.status(400).send({
//                         message:"Invalid password provider"
//                     })
//                 }
//             }
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//         message: "Internal server error",
//         });
//     }

// }

// export default{
//     signup,
//     login,
//     getAllUser,
//     forgetPassword,
//     resetPassword
// }


export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        let user = await userModel.findOne({ email });
        
        if (user) {
            // Generate JWT token with expiration time
            const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, { expiresIn: '15m' });

            const resetLink = `${process.env.ResetUrl}/reset-password/${token}`;

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.SECRET_KEY,
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_ID,
                to: user.email,
                subject: "Password Reset Link",
                html: `
                    <p> Dear ${user.userName}, </p>
                    <p> Sorry to hear you’re having trouble logging into your account. We got a message that you forgot your password. If this was you, you can get right back into your account or reset your password now. </p>
                    <p> Click the following link to reset your password: <a href="${resetLink}">${resetLink}</a> </p>
                    <p> If you didn’t request a login link or a password reset, you can ignore this message. </p>
                    <p> Only people who know your account password or click the login link in this email can log into your account. </p>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Failed to send the password reset mail" });
                }
                console.log("Password reset email sent: " + info.response);
                res.status(201).send({ message: "Password reset mail sent successfully" });
            });
        } else {
            res.status(400).send({ message: `User with ${email} does not exist` });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;

        // Verify JWT token
        jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
            if (err) {
                return res.status(400).send({ message: "Invalid or expired token" });
            }

            // Find the user by email from the decoded token
            const user = await userModel.findOne({ email: decoded.email });

            if (!user) {
                return res.status(400).send({ message: "User not found" });
            }

            // Check if newPassword is provided
            if (req.body.newPassword) {
                const newPassword = await auth.hashPassword(req.body.newPassword);
                user.password = newPassword;
                await user.save();
                res.status(201).send({ message: "Your new password has been updated" });
            } else {
                res.status(400).send({ message: "New password not provided" });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};