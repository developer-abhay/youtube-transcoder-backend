import { Router } from 'express';
import { getVideoDetails, getVideoFeed, uploadVideo } from '../controllers/videoController';
import { authenticationMiddleware } from '../middleware/authenticate';

const videoRouter = Router()

videoRouter.get('/feed', getVideoFeed);
videoRouter.post('/upload', authenticationMiddleware, uploadVideo);
videoRouter.get('/api/videos/:video_id', authenticationMiddleware, getVideoDetails)

export default videoRouter
