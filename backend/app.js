import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" })); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Middleware to parse URL-encoded bodies with a size limit
app.use(express.static("public")); // Middleware to serve static files from the "public" directory
app.use(cookieParser()); // Middleware to parse cookies

// cors configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// import the routes
import healthCheckRouter from "./src/routes/healthcheck.route.js";
import authRouter from "./src/routes/auth.route.js";
import productRouter from "./src/routes/product.route.js";
import categoryRouter from "./src/routes/category.route.js";
import contactRouter from "./src/routes/contact.route.js";
import locationRouter from "./src/routes/location.route.js";
import operationRouter from "./src/routes/operation.route.js";
import dashboardRouter from "./src/routes/dashboard.route.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/contacts", contactRouter);
app.use("/api/v1/locations", locationRouter);
app.use("/api/v1/operations", operationRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.get("/", (req, res) => {
  res.send("Welcome to StockMaster API");
});

// Global error handler middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
