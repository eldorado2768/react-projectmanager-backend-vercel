const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Permission = require("./models/Permission");
const userRoutes = require("./routes/userRoutes"); // Corrected import
const cors = require("cors"); // Add this line

dotenv.config();

const app = express();
/*app.use(cors());*/
app.use(
  cors({
    origin: [
      "https://react-projectmanager-git-master-david-brotmans-projects.vercel.app",
      "https://react-projectmanager-piw6kj6n1-david-brotmans-projects.vercel.app",
    ],
  })
);

const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests (only once)
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI) // removed empty object
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/test", (req, res) => {
  res.send("Hello from the backend!");
});

app.use("/api/users", userRoutes); // Corrected route mounting

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
