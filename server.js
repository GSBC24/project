import express from "express";
import dotenv from "dotenv";
import participantsRouter from "./routes/participants.js";

// Load variables from .env file
dotenv.config();

// Create the Express application
const app = express();

// This allows us to read JSON data from Postman requests
app.use(express.json());

// This is the home route.
// It is only used to check if the server is working.
app.get("/", (req, res) => {
  res.json({
    message: "Census API is running",
    endpoints: {
      participants: "/participants",
      add: "/participants/add",
      details: "/participants/details",
    }
  });
});

// Connect our participant routes to /participants
app.use("/participants", participantsRouter);

// If the user goes to a route that does not exist,
// we send a 404 error message in JSON format.
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    requested: req.originalUrl
  });
});

// Choose the port from .env or use 3000
const PORT = process.env.PORT || 3000;

// Start the server and listen for requests
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
