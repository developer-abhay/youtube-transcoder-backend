import { Router } from 'express';
import { authRouter } from './authRouter';
import videoRouter from './videoRouter';

const appRouter = Router();

// Auth ROuter
appRouter.use('/auth', authRouter);
appRouter.use('/videos', videoRouter);

export default appRouter
