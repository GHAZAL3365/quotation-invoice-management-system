const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const healthRoutes = require("./routes/healthRoutes");
const clientRoutes = require("./routes/clientRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const authRoutes = require("./routes/authRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const notFoundMiddleware = require("./middleware/notFound");
const errorHandlerMiddleware = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
         credentials: true,
    })
);

app.use(helmet());



app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

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
app.use("/api/v1/quotations", quotationRoutes); 
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;