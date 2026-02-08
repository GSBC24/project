import express from "express";
import dotenv from "dotenv";
import participantsRouter from "./routes/participants.js";

dotenv.config();

const app = express();

// Middleware para leer JSON
app.use(express.json());

// Ruta raíz de verificación (útil para Render y Postman)
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

// Rutas principales
app.use("/participants", participantsRouter);

// Manejo de rutas no existentes (404)
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    requested: req.originalUrl
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});