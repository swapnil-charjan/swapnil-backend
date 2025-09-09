import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.COULDINARY_CLOUD_NAME,
    api_key: process.env.COULDINARY_API_KEY,
    api_secret: process.env.COULDINARY_API_SRCRESTE
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'                                                       //uploaad the file on cloudinary 
        })
        console.log("File is uploaded on cloudinary", response.url)                     // file has been uploaded successfully
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)                                                     // remove the locally saved tempary file as the upload opration failed
        return null;
    }
}

export { uploadOnCloudinary }

