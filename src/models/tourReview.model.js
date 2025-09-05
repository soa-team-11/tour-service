import mongoose from "mongoose";

export const tourReviewSchema = new mongoose.Schema(
    {
        user: {
            id: {
                type: mongoose.Schema.Types.UUID,
                required: [true, "UUID is required."],
            },
            username: {
                type: String,
                required: [true, "Username  is required."],
            },
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            validate: {
                validator: Number.isInteger,
                message: "Rating must be an integer.",
            },
            required: [true, "Rating  is required."],
        },
        comment: {
            type: String,
            required: [true, "Comment  is required."],
        },
        dateVisited: {
            type: Date,
            required: [true, "Date is required."],
        },
        images: [String],
    },
    {
        timestamps: true,
    }
);
