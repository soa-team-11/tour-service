import express from "express";

import {
    activateTour,
    addKeyPoint,
    archiveTour,
    createTour,
    createTourReview,
    deleteKeyPoint,
    getPublishedTours,
    getToursByAuthor,
    publishTour,
    updateKeyPoint,
} from "../controllers/tour.controller.js";

const router = express.Router();

router.post("/", createTour);
router.post("/review/:tour_id", createTourReview);
router.get("/tourByAuthor", getToursByAuthor);
router.patch("/add-key-point/:tourId", addKeyPoint);
router.patch("/update-key-point/:tourId/:keyPointId", updateKeyPoint);
router.patch("/delete-key-point/:tourId/:keyPointId", deleteKeyPoint);
router.post("/:tourId/publish", publishTour);
router.post("/:tourId/archive", archiveTour);
router.post("/:tourId/activate", activateTour);
router.get("/published", getPublishedTours);



export default router;
