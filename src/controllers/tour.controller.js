import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

import Tour from "../models/tour.model.js";
import { doesUserExist } from "../external/stakeholder.external.js";

const uploadKeyPointImage = async (image) => {
    if (!image) return null;

    try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: "tours/keypoints",
        });
        return uploadResponse.secure_url;
    } catch (err) {
        console.error("Cloudinary upload failed:", err);
        throw new Error("Failed to upload key point image");
    }
};

export const createTour = async (req, res) => {
    try {
        const { author, title, description, difficulty, price, tags, keyPoints } =
            req.body;

        const userExists = await doesUserExist(author);
        // if (!userExists) return res.status(404).json({ message: "User not found." });

        const processedKeyPoints = keyPoints?.length
            ? await Promise.all(
                keyPoints.map(async (kp) => ({
                    ...kp,
                    image: await uploadKeyPointImage(kp.image),
                    _id: new mongoose.Types.ObjectId(),
                }))
            )
            : [];

        const tour = await Tour.create({
            author,
            title,
            description,
            difficulty,
            price,
            tags,
            keyPoints: processedKeyPoints,
        });

        res.status(201).json({ tour });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

export const createTourReview = async (req, res) => {
    try {
        const tourId = req.params["tour_id"];
        const { user, rating, comment, images } = req.body;

        const tour = await Tour.findById(tourId);
        if (!tour)
            return res.status(404).json({ error: `Tour with id '${tourId}' not found.` });

        tour.reviews.push({
            user,
            rating,
            comment,
            dateVisited: Date.now(), // Replace with actual visitation date if needed
            images,
        });

        await tour.save({ timestamps: false });

        res.status(201).json({
            message: "Review added successfully.",
            reviews: tour.reviews,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

export const getToursByAuthor = async (req, res) => {
    try {
        const { author } = req.body;

        const tours = await Tour.find({ author });
        if (!tours || tours.length === 0)
            return res.status(404).json({ message: "No tours found for this author." });

        res.status(200).json({ tours });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

export const addKeyPoint = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { name, description, latitude, longitude, image } = req.body;

        const tour = await Tour.findById(tourId);
        if (!tour) return res.status(404).json({ message: "Tour not found" });

        const imageUrl = await uploadKeyPointImage(image);

        const newKeyPoint = {
            _id: new mongoose.Types.ObjectId(),
            name,
            description,
            latitude,
            longitude,
            image: imageUrl,
        };

        tour.keyPoints.push(newKeyPoint);
        const updatedTour = await tour.save();

        res.status(201).json({ tour: updatedTour });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

export const updateKeyPoint = async (req, res) => {
    try {
        const { tourId, keyPointId } = req.params;
        const updates = { ...req.body };

        const tour = await Tour.findById(tourId);
        if (!tour) return res.status(404).json({ message: "Tour not found" });

        const keyPoint = tour.keyPoints.id(keyPointId);
        if (!keyPoint) return res.status(404).json({ message: "Key point not found" });

        if (updates.image) {
            updates.image = await uploadKeyPointImage(updates.image);
        }

        Object.assign(keyPoint, updates);
        const updatedTour = await tour.save();

        res.status(200).json({ tour: updatedTour });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

export const deleteKeyPoint = async (req, res) => {
    try {
        const { tourId, keyPointId } = req.params;

        const tour = await Tour.findById(tourId);
        if (!tour) return res.status(404).json({ message: "Tour not found" });

        const keyPoint = tour.keyPoints.id(keyPointId);
        if (!keyPoint) return res.status(404).json({ message: "Key point not found" });

        keyPoint.remove();
        const updatedTour = await tour.save();

        res.status(200).json({ tour: updatedTour });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};
