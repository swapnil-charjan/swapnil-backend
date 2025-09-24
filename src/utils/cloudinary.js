import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("No file path provided for upload.");
            return null;
        }

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto' // Automatically detect file type (image, video, etc.)
        });

        //file has been uploaded successfully
        console.log("File successfully uploaded to Cloudinary:", response.url);
        return response;

        // Optionally delete the file after upload if desired
        // if (fs.existsSync(localFilePath)) {
        //     fs.unlinkSync(localFilePath);
        //     console.log("Temporary file deleted:", localFilePath);
        // }

    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);

        // Optionally delete the file if upload fails
        // if (fs.existsSync(localFilePath)) {
        //     fs.unlinkSync(localFilePath);
        //     console.log("Temporary file deleted:", localFilePath);
        // }

        return null;
    }
};

export { uploadOnCloudinary };
