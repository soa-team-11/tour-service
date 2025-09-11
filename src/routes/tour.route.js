import express from "express";

import {
    addKeyPoint,
    createTour,
    createTourReview,
    deleteKeyPoint,
    getToursByAuthor,
    updateKeyPoint,
} from "../controllers/tour.controller.js";

const router = express.Router();

router.post("/", createTour);
router.post("/review/:tour_id", createTourReview);
router.get("/tourByAuthor", getToursByAuthor);
router.patch("/add-key-point/:tourId", addKeyPoint);
router.patch("/update-key-point/:tourId/:keyPointId", updateKeyPoint);
router.patch("/delete-key-point/:tourId/:keyPointId", deleteKeyPoint);

export default router;
