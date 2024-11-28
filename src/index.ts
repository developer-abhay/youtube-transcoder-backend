import express from 'express'
import cookieParser from 'cookie-parser';
import appRouter from './router/appRouter';
import errorHandler from './middleware/globalErrorHandler';
import { initRedis } from './services/redis';

const app = express()
const port = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(cookieParser());

// Initialize Redis Client
initRedis()

// App Router
app.use('/api/', appRouter)

// Global error handler
app.use(errorHandler);


app.listen(port, () => console.log('Server is listening on port: ', port))