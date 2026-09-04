import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDB.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import requirementsRoutes from "./routes/requirementsRoutes.js";
import empRequirementRoutes from "./routes/empRequirementRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// middleware that allows to read req.body
app.use(express.json());

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//routes
app.get("/", (req, res) => {
  res.json({ message: "Hello World! from Wion" });
});
//for auth
app.use("/api/auth", authRoutes);
//for (admin, manager, user) info
app.use("/api/users", userRoutes);
//for employee onboarding
app.use("/api/employees", employeeRoutes);
//for employee onboarding
app.use("/api/requirements", requirementsRoutes);
//employee-requirements
app.use("/api/employee-requirements", empRequirementRoutes);
//documents (pdf)
app.use("/api/documents", documentRoutes);

//starts the db before the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
  });
});
