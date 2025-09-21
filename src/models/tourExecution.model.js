import mongoose from "mongoose";
import { keyPointSchema } from "./tour.model.js";

const executionKeyPointSchema = new mongoose.Schema({
    generalInfo: keyPointSchema,
    completedAt: {
        type: Date,
        default: null
    }
});

const tourExecutionSchema = new mongoose.Schema({
    title: String,
    description: String,
    user: String,
    keyPoints: [executionKeyPointSchema],
    lastActivity: {
        type: Date,
        default: Date.now  
    },
    status: {
        type: String,
        enum: ["active", "completed", "abandoned"],
        default: "active"
    }
});

const TourExecution = mongoose.model("TourExecution", tourExecutionSchema);
export default TourExecution;