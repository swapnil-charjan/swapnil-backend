import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { username, fullname, email, password } = req.body;

    //Use validation for every single required field
    // if (fullname === "") {
    //     throw new ApiError(400, "fullname is required")
    // }

    //Use validation for all required fields
    if ([username, fullname, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    //Check user is exists
    if (existedUser) {
        throw new ApiError(409, "User with email or username is already exists.!")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImgLocalPath = req.files?.coverImage[0]?.path;
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImgLocalPath)

    //Check avatar required
    if (!avatarLocalPath || !avatar) {
        throw new ApiError(400, "Avatar is file requied")
    }

    const user = User.create({
        username: username.toLowerCase(),
        fullname,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //Check avatar required
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registring user.!")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully.!")
    )
})

export {
    registerUser,
}