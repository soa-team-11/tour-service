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
        keyPoints: [keyPointSchema]
    },
    {
        timestamps: true,
    }
);

const keyPointSchema = new mongoose.Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            auto: true
        },
        name: {
            type: String,
            required: [true, "Key point name is required."],
        },

        description: {
            type: String,
            required: [true, "Key point description is required."],
        },

        latitude: {
            type: Number,
            required: [true, "Latitude is required."],
        },

        longitude: {
            type: Number,
            required: [true, "Longitude is required."],
        },

        image: {
            type: String
        }
    }
);

const Tour = mongoose.model("Tour", tourSchema);
export default Tour;
