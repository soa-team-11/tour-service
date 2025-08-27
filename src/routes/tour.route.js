import express from "express";
import { createTour, getToursByAuthor } from "../controllers/tour.controller.js";
const router = express.Router();

router.post("/", createTour);
router.get("/tourByAuthor", getToursByAuthor);

export default router;