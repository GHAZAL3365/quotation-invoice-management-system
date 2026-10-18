const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const healthRoutes = require("./routes/healthRoutes");
const clientRoutes = require("./routes/clientRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const authRoutes = require("./routes/authRoutes");
const notFoundMiddleware = require("./middleware/notFound");
const errorHandlerMiddleware = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
    })
);

app.use(helmet());



app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/auth", authRoutes);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;