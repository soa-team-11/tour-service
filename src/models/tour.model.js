import mongoose, { Schema } from "mongoose";

import { tourReviewSchema } from "./tourReview.model.js";

const durationSchema = new mongoose.Schema({
    transportType: {
        type: String,
        enum: ["walking", "bicycle", "car"],
        required: [true, "Transport type is required."]
    },
    minutes: {
        type: Number,
        required: [true, "Duration in minutes is required."],
        min: 1
    }
});

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
            enum: ["draft", "published", "archived"],
            default: "draft",
        },
        price: {
            type: Number,
            default: 0,
        },
        publishedAt: {
            type: Date
        },
        archivedAt: {
            type: Date
        },
        length: {
            type: Number,
            default: 0
        },
        reviews: [tourReviewSchema],
        tags: [String],
        keyPoints: [keyPointSchema],
        durations: [durationSchema]
    },
    {
        timestamps: true,
    }
);


const Tour = mongoose.model("Tour", tourSchema);
export default Tour;
