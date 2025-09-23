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

// export const createTour = async (req, res) => {
//     try {
//         const { author, title, description, difficulty, price, tags, keyPoints, durations, length } =
//             req.body;

//         const userExists = await doesUserExist(author);
//         // if (!userExists) return res.status(404).json({ message: "User not found." });

//         const processedKeyPoints = keyPoints?.length
//             ? await Promise.all(
//                 keyPoints.map(async (kp) => ({
//                     ...kp,
//                     image: await uploadKeyPointImage(kp.image),
//                     _id: new mongoose.Types.ObjectId(),
//                 }))
//             )
//             : [];

//         const tour = await Tour.create({
//             author,
//             title,
//             description,
//             difficulty,
//             price,
//             tags,
//             keyPoints: processedKeyPoints,
//             durations,
//             length
//         });

//         res.status(201).json({ tour });
//     } catch (error) {
//         console.error(error);
//         res.status(400).json({ error: error.message });
//     }
// };

export const handlers = {
    CreateTour: async (call, callback) => {
      try {
        const { author, title, description, difficulty, price, tags, keyPoints, durations, length } =
          call.request;

        const userExists = await doesUserExist(author);
        if (!userExists) {
          return callback({
            code: grpc.status.NOT_FOUND,
            message: "User not found",
          });
        }

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
          durations,
          length,
        });

        const response = {
          message: "Tour created successfully",
          tour: {
            id: tour._id.toString(),
            author: tour.author,
            title: tour.title,
            description: tour.description,
            difficulty: tour.difficulty,
            price: tour.price,
            tags: tour.tags,
            keyPoints: tour.keyPoints.map((kp) => ({
              name: kp.name,
              description: kp.description,
              latitude: kp.latitude,
              longitude: kp.longitude,
              image: kp.image,
            })),
            durations: tour.durations,
            length: tour.length,
            createdAt: tour.createdAt.toISOString(),
          },
        };

        return callback(null, response);
      } catch (err) {
        console.error("gRPC CreateTour error:", err);
        return callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      }
    }
};

export const uploadReviewImage = async (image) => {
    if (!image) return null;

    try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: "tours/reviews",
        });
        return uploadResponse.secure_url;
    } catch (err) {
        console.error("Cloudinary upload failed:", err);
        throw new Error("Failed to upload review image");
    }
};

export const createTourReview = async (req, res) => {
    try {
        const tourId = req.params["tour_id"];
        const { user, rating, comment, images } = req.body;

        const tour = await Tour.findById(tourId);
        if (!tour)
            return res
                .status(404)
                .json({ error: `Tour with id '${tourId}' not found.` });

        const imageUrl = await uploadReviewImage(images);

        tour.reviews.push({
            user,
            rating,
            comment,
            dateVisited: Date.now(), // Replace with actual visitation date if needed
            images: [imageUrl],
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

// backend route
export const getToursByAuthor = async (req, res) => {
    try {
        const { author } = req.query; // <-- changed from req.body
        const tours = await Tour.find({ author });
        if (!tours || tours.length === 0)
            return res
                .status(404)
                .json({ message: "No tours found for this author." });
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
        if (!keyPoint)
            return res.status(404).json({ message: "Key point not found" });

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

        // Filter out the key point by _id
        const originalLength = tour.keyPoints.length;
        tour.keyPoints = tour.keyPoints.filter(
            (kp) => kp._id.toString() !== keyPointId
        );

        if (tour.keyPoints.length === originalLength) {
            return res.status(404).json({ message: "Key point not found" });
        }

        const updatedTour = await tour.save();

        res.status(200).json({ tour: updatedTour });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

export const publishTour = async (req, res) => {
    try {
        const { tourId } = req.params;

        const tour = await Tour.findById(tourId);
        if (!tour) return res.status(404).json({ message: "Tour not found" });

        if (
            !tour.title ||
            !tour.description ||
            !tour.difficulty ||
            !tour.tags?.length
        ) {
            return res.status(400).json({
                message:
                    "Tour must have title, description, difficulty, and tags.",
            });
        }

        if (!tour.keyPoints || tour.keyPoints.length < 2) {
            return res
                .status(400)
                .json({ message: "Tour must have at least 2 key points." });
        }

        if (!tour.durations || tour.durations.length === 0) {
            return res.status(400).json({
                message:
                    "Tour must have at least one duration for a transport type.",
            });
        }

        tour.status = "published";
        tour.publishedAt = new Date();

        await tour.save();

        res.status(200).json({ message: "Tour published successfully.", tour });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

export const archiveTour = async (req, res) => {
    try {
        const { tourId } = req.params;

        const tour = await Tour.findById(tourId);
        if (!tour) return res.status(404).json({ message: "Tour not found" });

        if (tour.status !== "published") {
            return res
                .status(400)
                .json({ message: "Only published tours can be archived." });
        }

        tour.status = "archived";
        tour.archivedAt = new Date();

        await tour.save();

        res.status(200).json({ message: "Tour archived successfully.", tour });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

export const activateTour = async (req, res) => {
    try {
        const { tourId } = req.params;

        const tour = await Tour.findById(tourId);
        if (!tour) return res.status(404).json({ message: "Tour not found" });

        if (tour.status !== "archived") {
            return res
                .status(400)
                .json({ message: "Only archived tours can be reactivated." });
        }

        tour.status = "published";
        tour.archivedAt = null;
        tour.publishedAt = new Date();

        await tour.save();

        res.status(200).json({
            message: "Tour reactivated successfully.",
            tour,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

export const getPublishedTours = async (req, res) => {
    try {
        const tours = await Tour.find({ status: "published" });

        if (!tours || tours.length === 0) {
            return res
                .status(404)
                .json({ message: "No published tours found." });
        }

        const limitedTours = tours.map((tour) => ({
            _id: tour._id,
            title: tour.title,
            description: tour.description,
            difficulty: tour.difficulty,
            tags: tour.tags,
            price: tour.price,
            keyPoints: tour.keyPoints.length > 0 ? [tour.keyPoints[0]] : [], // samo prva kt
        }));

        res.status(200).json({ tours: limitedTours });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

export const getTourById = async (req, res) => {
    try {
        const { tourId } = req.params;

        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({ message: "Tour not found" });
        }

        res.status(200).json(tour);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};
