import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { corsConfig } from "./config/cors";
import { connectDB } from "./config/db";
import authRoutes from "./routers/authRoutes";
import projectRoutes from "./routers/projectRoutes";

dotenv.config(); //configuracion de las varibles de entorno
connectDB(); //conexion a la base de datos

// llamada a express
const app = express();
app.use(cors(corsConfig));
app.use(morgan("dev"));
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

export default app;
