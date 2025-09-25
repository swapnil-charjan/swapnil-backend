import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

//Generate access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found while generating tokens!..");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Store refresh token in DB
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        console.log("Token generation error:", error);
        throw new ApiError(500, "Something went wrong while generating tokens!..");
    }
};


//Register user 
const registerUser = asyncHandler(async (req, res) => {
    const { username, fullname, email, password } = req.body;

    //Use validation for every single required field
    // if (fullname === "") {
    //     throw new ApiError(400, "fullname is required")
    // }

    //Use validation for all required fields
    // if ([username, fullname, email, password].some((fields) => fields?.trim() === "")) {
    //     throw new ApiError(400, `All fields are required`)
    // }

    //check user with username or email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    //Check user is exists
    if (existedUser) {
        throw new ApiError(409, "User with email or username is already exists.!")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImgLocalPath = req.files?.coverImage[0]?.path;

    //Check avatar required
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is file requied")
    }

    //upload on clouldinary
    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // const coverImage = await uploadOnCloudinary(coverImgLocalPath)

    //Check avatar required on clouldinary
    // if (!avatar) {
    //     throw new ApiError(400, "Avatar is not upload on cloudinary")
    // }

    const user = await User.create({
        username: username,
        fullname,
        email,
        password,
        avatar: avatarLocalPath,
        coverImage: coverImgLocalPath || "",
        // avatar: avatar.url,                              //If use cloudinary
        // coverImage: coverImage?.url || "",
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

//Login user using with username or email and password
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or Email is required!..");
    }

    // Find login user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist. Register the user first!..");
    }

    // Check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid username or password!..");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Exclude sensitive data
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Cookie options
    const options = {
        httpOnly: true,
        secure: true                    //use for production process.env.NODE_ENV === "production"
    };

    // Send response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully!.."
            )
        );
});


//Logout the user
const LogoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToke: undefined }
        },
        {
            new: true     // return new data
        }
    )

    //for security purpose
    const options = {
        httpOnly: true,
        secure: true            //Only modify by server
    }

    return res.status(200)
        .clearCookies("accessToken", options)
        .clearCookies("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged out!.."))
})

export {
    registerUser,
    loginUser,
    LogoutUser
} 