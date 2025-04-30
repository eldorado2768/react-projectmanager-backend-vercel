import mongoose from "mongoose";

export default async function handler(req, res) {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    res.status(200).json({ message: "MongoDB connection successful!" });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    res.status(500).json({ error: error.message });
  }
}
