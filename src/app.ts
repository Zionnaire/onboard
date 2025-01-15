const express = require('express')
const app = express()

import dotenv from 'dotenv';
dotenv.config();

import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
      };
    }
  }
}


module.exports = app
