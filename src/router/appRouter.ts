import { Router } from 'express';
import { authRouter } from './authRouter';
import videoRouter from './videoRouter';
import channelRouter from './channelRouter';

const appRouter = Router();

// Auth ROuter
appRouter.use('/auth', authRouter);
appRouter.use('/videos', videoRouter);
appRouter.use('/channels', channelRouter);

export default appRouter
