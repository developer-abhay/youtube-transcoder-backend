import { Router } from "express";
import {
  getVideoDetails,
  getVideoFeed,
  updateTimestamp,
  uploadVideo,
} from "../controllers/videoController";
import { authenticationMiddleware } from "../middleware/authenticate";

const videoRouter = Router();

videoRouter.get("/feed", getVideoFeed);
videoRouter.post("/upload", authenticationMiddleware, uploadVideo);
videoRouter.get("/:videoId", authenticationMiddleware, getVideoDetails);
videoRouter.put("/:videoId/time", authenticationMiddleware, updateTimestamp);

export default videoRouter;
