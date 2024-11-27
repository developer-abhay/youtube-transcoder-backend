import { Router } from 'express';
import { getVideoFeed } from '../controllers/videoController';

const videoRouter = Router()

videoRouter.get('/feed', getVideoFeed);

export default videoRouter
