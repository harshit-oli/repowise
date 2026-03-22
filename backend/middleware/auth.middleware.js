import jwt from "jsonwebtoken"

const isAuth=async(req,res,next)=>{
    try {
        const token=req.cookies.token;
        if(!token){
            return res.status(400).json({
                success:false,
                message:"token not found",
            })
        }
        const verifyToken=await jwt.verify(token,process.env.JWT_SECRET);
        req.userId=verifyToken.userId;
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"middleware internal server error",
        })
    }
}
export default isAuth;