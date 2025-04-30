import mongoose from "mongoose";

const connectDB = async () => {
  // Add event listeners for detailed logging
  mongoose.connection.on("connecting", () =>
    console.log("Connecting to MongoDB...")
  );
  mongoose.connection.on("connected", () =>
    console.log("Connected to MongoDB!")
  );
  mongoose.connection.on("disconnecting", () =>
    console.log("Disconnecting from MongoDB...")
  );
  mongoose.connection.on("disconnected", () =>
    console.log("Disconnected from MongoDB!")
  );
  mongoose.connection.on("error", (err) =>
    console.error("MongoDB Connection Error:", err.message)
  );
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds
    });
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1); // Exit process if connection fails
  }
};

export default connectDB;
