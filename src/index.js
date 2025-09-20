import express from "express";
import dotenv from "dotenv";
import tourRutes from "./routes/tour.route.js"
import { connectDB } from "./config/db.js";
import { startGrpcServer } from "./grpcServer.js";

dotenv.config();

const app = express();
connectDB();

app.use(express.json({ limit: "50mb" }));
app.use("/api/tour", tourRutes);

app.listen(process.env.PORT, () => console.log(`Server is running on PORT: ${process.env.PORT}`));

startGrpcServer();