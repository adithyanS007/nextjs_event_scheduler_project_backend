const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
require('dotenv').config();

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    const app = express();

    const allowedOrigins = ['https://nextjs-event-scheduler-project-fron.vercel.app'];

    // Properly configure CORS
    app.use(cors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }));

    // Explicitly set headers for preflight requests
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", allowedOrigins[0]);
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true"); // Ensure credentials are accepted

      if (req.method === "OPTIONS") {
        return res.sendStatus(200);
      }
      next();
    });

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({
        headers: req.headers,
      }),
    });

    await server.start();
    server.applyMiddleware({ app, cors: false }); // Disable Apollo's built-in CORS

    app.listen(process.env.PORT, () => {
      console.log(`Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
  }
}

startServer();