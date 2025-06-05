const { ObjectId } = require("mongodb");
const connectDB = require("./db");

const resolvers = {
  Query: {
    events: async () => {
      const db = await connectDB();
      return db
        .collection("events")
        .find({ startTime: { $gte: new Date().toISOString() } })
        .toArray();
    },
    event: async (_, { id }) => {
      const db = await connectDB();
      return db.collection("events").findOne({ _id: new ObjectId(String(id)) });
    },
    eventsByDateRange: async (_, { start, end }) => {
      const db = await connectDB();
      return db
        .collection("events")
        .find({
          startTime: { $gte: start },
          endTime: { $lte: end },
        })
        .toArray();
    },
  },

  Mutation: {
    addEvent: async (_, { title, description, startTime, endTime, location, isRecurring, recurrenceRule }) => {
      const db = await connectDB();

      const eventData = {
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        location,
        isRecurring,
        recurrenceRule,
      };

      const result = await db.collection("events").insertOne(eventData);
      return { _id: result.insertedId, ...eventData };
    },

    updateEvent: async (_, { id, title, description, startTime, endTime, location, isRecurring, recurrenceRule }) => {
      const db = await connectDB();

      const eventData = {
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        location,
        isRecurring,
        recurrenceRule,
      };

      await db.collection("events").updateOne(
        { _id: new ObjectId(String(id)) }, // Ensure `id` is always treated as a string
        { $set: eventData }
      );

      return db.collection("events").findOne({ _id: new ObjectId(String(id)) });
    },

    deleteEvent: async (_, { id }) => {
      const db = await connectDB();
      const res = await db.collection("events").deleteOne({ _id: new ObjectId(String(id)) });
      return res.deletedCount > 0;
    },
  },
};

module.exports = resolvers;