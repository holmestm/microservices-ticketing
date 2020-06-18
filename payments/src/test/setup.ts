import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signin(user?: Object): string[];
    }
  }
}

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = 'sk_test_Cc7ooiOCyet0uG4JZACu3bky';

let mongo: any;
beforeAll(async () => {
  console.debug = () => {};
  process.env.JWT_KEY = 'asdfasdf';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (optionalUser: Object) => {
  const user = { id: '12345', email: 'test@test.com', ...optionalUser };
  const userJwt = jwt.sign(user, process.env.JWT_KEY!);
  const session = {
    jwt: userJwt,
  };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString('base64');

  const cookie = `express:sess=${base64}`;
  return [cookie];
};
