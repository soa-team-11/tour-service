import TourExecution from "../models/tourExecution.model.js";
import Tour from "../models/tour.model.js";

export const startTour = async (req, res) => {
    const { userId, tourId } = req.body;

    try {
        const tour = await Tour.findById(tourId);
        if (!tour) return res.status(404).json({ message: "Tour not found" });

        const executionKeyPoints = tour.keyPoints.map(kp => ({
            generalInfo: kp.toObject()
        }));

        const tourExecution = await TourExecution.create({
            title: tour.title,
            description: tour.description,
            user: userId,
            keyPoints: executionKeyPoints
        });

        res.status(201).json(tourExecution);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const progressTour = async (req, res) => {
    const { tourExecutionId } = req.params;
    const { position } = req.body;

    try {
        const execution = await TourExecution.findById(tourExecutionId);
        if (!execution) 
            return res.status(404).json({ message: "Tour execution not found" });

        execution.keyPoints.forEach(kp => {
            if (!kp.completedAt && arePointsWithin20m(position.latitude, position.longitude, kp.generalInfo.latitude, kp.generalInfo.longitude))
                kp.completedAt = new Date();
        });

        const allCompleted = execution.keyPoints.every(kp => kp.completedAt !== null);
        if (allCompleted) 
            execution.status = "completed";

        execution.lastActivity = new Date();
        await execution.save();
        
        res.json(execution);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const abandonTour = async (req, res) => {
    const { tourExecutionId } = req.params;

    try {
        const execution = await TourExecution.findById(tourExecutionId);
        if (!execution) 
            return res.status(404).json({ message: "Tour execution not found" });

        execution.status = "abandoned";
        await execution.save();
        res.status(200).json(execution);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getActiveTour = async (req, res) => {
    const { userId } = req.params;

    try {
        const activeTour = await TourExecution.findOne({
            user: userId,
            status: "active"
        });

        res.json(activeTour);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

function arePointsWithin20m(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // distance in meters

    return distance <= 20;
};