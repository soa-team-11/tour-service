import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

import Tour from "../models/tour.model.js";

import { doesUserExist } from "../external/stakeholder.external.js";

export const createTour = async (req, res) => {
    try {
        const { author, title, description, difficulty, price, tags } =
            req.body;

        const userExists = await doesUserExist(author);

        // if (!userExists) {
        //     return res.status(404).json({
        //         message: "User was not found."
        //     });
        // }

        const tour = await Tour.create({
            author,
            title,
            description,
            difficulty,
            price,
            tags,
        });

        res.status(201).json({
            tour,
        });
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};

export const createTourReview = async (req, res) => {
    try {
        const tourId = req.params["tour_id"];
        const { user, rating, comment, images } = req.body;

        const tour = await Tour.findById(tourId);
        // Check if user visited the tour

        if (tour == undefined) {
            res.status(404).json({
                error: `Tour with id:'${tourId}' not found.`,
            });
        }

        tour.reviews.push({
            user,
            rating,
            comment,
            dateVisited: Date.now(), // Change to actual visitation date
            images,
        });

        await tour.save({ timestamps: false });

        res.status(201).json({
            message: "Review added successfully.",
            reviews: tour.reviews,
        });
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};

export const getToursByAuthor = async (req, res) => {
    try {
        const { author } = req.body;

        const tours = await Tour.find({ author });

        if (!tours || tours.length === 0) {
            return res.status(404).json({
                message: "No tours found for this author.",
            });
        }

        res.status(200).json({
            tours,
        });
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};
