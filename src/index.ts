
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import authRoute from './routes/authRoute';
import inventoryRoute from './routes/inventoryRoute';
import connectDB from './configs/db'; // Assuming connectDB is a default export from db.ts
// const cors = require('cors');
// import cors from 'cors';
const cors: any = require('cors'); // Use any type for now

// Initialize dotenv to load environment variables
import * as dotenv from 'dotenv';
dotenv.config();


const app: Application = express();

// CORS options
const corsOptions = {
  origin: '*', // You may want to restrict this in production
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/inventory', inventoryRoute);

// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
