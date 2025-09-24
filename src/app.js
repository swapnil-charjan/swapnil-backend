import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

//Use for getting url and methods
app.use((req, res, next) => {
    console.log(req.url, req.method)
    next()
})


//routes import
import userRouter from "./routes/user.routes.js"
import { ApiError } from "./utils/ApiError.js";

//routes declaration 
app.use("/api/v1/users", userRouter)

//Global error handler
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data,
        });
    }

    if (err.name === "ValidationError") {
    const errorMessages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
        success: false,
        message: errorMessages.join(", ") // combine into one string
    });
}

    // fallback for unexpected errors
    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

export { app }