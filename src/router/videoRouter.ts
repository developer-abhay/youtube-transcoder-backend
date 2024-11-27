import { Router } from 'express';
import { getVideoFeed, uploadVideo } from '../controllers/videoController';
import { authenticationMiddleware } from '../middleware/authenticate';

const videoRouter = Router()

videoRouter.get('/feed', getVideoFeed);
videoRouter.post('/upload', authenticationMiddleware, uploadVideo);

export default videoRouter
