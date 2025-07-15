import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import morgan from "morgan";
import bodyParser from "body-parser";
import routerInit from "./router.js";
import logger from "../utils/logger.js";
import mongoDbInit from "../utils/mongodb.js";
import hpp from "hpp";

dotenv.config();

// Initialize the mongoDB connection
mongoDbInit();

const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(
  cors({
    origin: process.env.REACT_APP_URL, // Client origin
    credentials: true, // Allow cookies
  })
);
app.use(hpp());
app.use(morgan("short"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize the routes
routerInit(app);

const server = http.createServer(app);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
