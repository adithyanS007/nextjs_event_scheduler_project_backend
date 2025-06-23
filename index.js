const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const dotenv = require("dotenv");

dotenv.config();

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    const app = express();

    const allowedOrigin = "https://nextjs-event-scheduler-project-fron.vercel.app";

    // Use CORS middleware correctly
    app.use(cors({
      origin: allowedOrigin,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }));

     app.use(express.json());

     app.options("*", cors());

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({
        headers: req.headers,
      }),
    });

    await server.start();
    server.applyMiddleware({ app, cors: false }); // Let Express handle CORS

    app.listen(process.env.PORT, () => {
      console.log(
        `Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`
      );
    });
  } catch (err) {
    console.error("Failed to start server", err);
  }
}

startServer();
