import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Tour from "../models/tour.model.js";
import { doesUserExist } from "../external/stakeholder.external.js";


export const createTour = async (req, res) => {
    try {
        const { author, title, description, difficulty, tags } = req.body;

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
            tags,
            status: "draft", 
            price: 0         
        });

        res.status(201).json({
            tour
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

export const getToursByAuthor = async (req, res) => {
    try {
        const { author } = req.body; 

        const tours = await Tour.find({ author });

        if (!tours || tours.length === 0) {
            return res.status(404).json({
                message: "No tours found for this author."
            });
        }

        res.status(200).json({
            tours
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};