import { Router } from 'express';
import { authRouter } from './authRouter';

const appRouter = Router();

// Auth ROuter
appRouter.use('/auth', authRouter);

export default appRouter
