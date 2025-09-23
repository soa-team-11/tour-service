import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import Tour from "./models/tour.model.js";
import { doesUserExist } from "./external/stakeholder.external.js";
import mongoose from "mongoose";
import cloudinary from "./config/cloudinary.js";
import { handlers } from "./controllers/tour.controller.js";

const PROTO_PATH = path.resolve("proto/tour.proto");

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

  const server = new grpc.Server(
    {
        'grpc.max_send_message_length': 50 * 1024 * 1024, // 50 MB
        'grpc.max_receive_message_length': 50 * 1024 * 1024, // 50 MB
    }
  );
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
