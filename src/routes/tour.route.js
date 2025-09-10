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
router.patch("/add-key-point", addKeyPoint);
router.patch("/update-key-point", updateKeyPoint);
router.patch("/delete-key-point", deleteKeyPoint);

export default router;
