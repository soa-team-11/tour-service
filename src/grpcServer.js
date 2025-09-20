import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import Tour from "./models/tour.model.js";
import { doesUserExist } from "./external/stakeholder.external.js";
import mongoose from "mongoose";
import cloudinary from "./config/cloudinary.js";

const PROTO_PATH = path.resolve("proto/tour.proto");

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

export function startGrpcServer() {
  const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const grpcObj = grpc.loadPackageDefinition(packageDef);
  const tourPackage = grpcObj.tour;

  const handlers = {
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
    },
  };

  const server = new grpc.Server();
  server.addService(tourPackage.TourService.service, handlers);

  const GRPC_PORT = process.env.GRPC_PORT || 50052;
  server.bindAsync(
    `0.0.0.0:${GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("gRPC server failed:", err);
        return;
      }
      console.log(`Tour gRPC listening on port ${port}`);
      server.start();
    }
  );
}
