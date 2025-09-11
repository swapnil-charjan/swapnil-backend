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


//routes declaration 
app.use("/api/v1/users", userRouter)

export { app }