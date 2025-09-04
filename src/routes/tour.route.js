import express from "express";

import {
    createTour,
    createTourReview,
    getToursByAuthor,
} from "../controllers/tour.controller.js";

const router = express.Router();

router.post("/", createTour);
router.post("/review/:tour_id", createTourReview);
router.get("/tourByAuthor", getToursByAuthor);

export default router;
