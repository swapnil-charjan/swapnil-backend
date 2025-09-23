import dotenv from "dotenv"
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

//With DB connection
connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`\n Server is running at http://localhost:${process.env.PORT}`);            
        })
    })
    .catch((error) => {
        console.log("MONGO DB connection failed !!!", error)
        throw error
    })

//Without DB connection
// app.listen(process.env.PORT, () => {
//     console.log(`\n Server is running at http://localhost:${process.env.PORT}`)
// })
