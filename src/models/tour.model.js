import mongoose from "mongoose";

import { tourReviewSchema } from "./tourReview.model.js";

const tourSchema = new mongoose.Schema(
    {
        author: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: [true, "Title  is required."],
        },
        description: {
            type: String,
            required: [true, "Description is required."],
        },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            required: [true, "Difficulty is required."],
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },
        price: {
            type: Number,
            default: 0,
        },
        reviews: [tourReviewSchema],
        tags: [String],
    },
    {
        timestamps: true,
    }
);

const Tour = mongoose.model("Tour", tourSchema);
export default Tour;
