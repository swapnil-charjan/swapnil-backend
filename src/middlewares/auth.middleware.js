//Verify user is available with JWT or not

import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        //check is exist or not
        if (!token) {
            throw new ApiError(401, "Unautorizes request!..")
        }
    
        //verify JWT token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
            .select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "invalid access token")
        }

        req.user = user;
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token")
    }
})