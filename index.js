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
    app.use(cors({
      origin: allowedOrigins,
      credentials: true,
    }));

    const server = new ApolloServer({ typeDefs, resolvers });

    await server.start();
    server.applyMiddleware({ app });

    app.listen(process.env.PORT, () =>
      console.log(`Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`)
    );
  } catch (err) {
    console.error('Failed to start server', err);
  }
}

startServer();
