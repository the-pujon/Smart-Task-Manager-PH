import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';

const app: Application = express();

// Trust proxy - required when behind a proxy/load balancer (AWS Lambda, nginx, etc.)
// This allows express-rate-limit to correctly identify users by their IP
app.set('trust proxy', true);

app.use(express.json());
app.use(bodyParser.json());

const allowedOrigins = process.env.FRONTEND_URLS?.split(',').map(url => url.trim()) || [];

app.use(cors({
  origin: (origin, callback) => {
    console.log('Request Origin:', origin);
    console.log('Allowed Origins:', allowedOrigins);

    // Allow requests with no origin (e.g. mobile apps, curl, postman)
    if (!origin) {
      return callback(null, true);
    }

    // If no origins are configured, allow all (for development)
    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['set-cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(cookieParser());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})


// Apply the rate limiting middleware to all requests.
app.use(limiter)
// application routes
app.use('/api/v1', router);   

app.get('/', (req: Request, res: Response) => {
  res.send('Hi Express Server v2!! you are live now!!!!');
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
