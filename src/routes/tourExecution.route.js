import express from "express";
import { abandonTour, getActiveTour, progressTour, startTour } from "../controllers/tourExecution.controller.js";

const router = express.Router();

router.post("/start", startTour);
router.patch("/abandon/:tourExecutionId", abandonTour);
router.patch("/progress/:tourExecutionId", progressTour);
router.get("/active/:userId", getActiveTour);

export default router;
