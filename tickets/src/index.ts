import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY is not defined');
  } else {
    console.log('JWT_KEY defined', 'SECRET');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  } else {
    console.log('MONGO_URI defined', process.env.MONGO_URI);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }
  app.listen(3000, () => {
    console.log('Ticket Service Listening on port 3000');
  });
};

start();
