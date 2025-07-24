import dotenv from "dotenv";
import todoRouter from "./routes/todo.js";
import mongoose from "mongoose";

dotenv.config();

const routerInit = (app) => {
  app.get("/", async (_, res) => {
    res.status(200).send({
      status: "success",
      name: "Devopsified-Mern-App-Server",
      version: "0.0.1",
      description: "This is the server of devopsified mern app project",
      client: process.env.REACT_APP_URL,
      author: {
        name: "Krunal Bhandekar",
        designation: "Full Stack Web Developer",
        email: "krunalbhandekar10@gmail.com",
      },
    });
  });

  // Liveness probe
  app.get("/health", async (_, res) => {
    res.status(200).send({ status: "healthy" });
  });

  // Readiness probe (checks MongoDB)
  app.get("/ready", async (_, res) => {
    const state = mongoose.connection.readyState;
    if (state === 1) {
      // 1 = connected
      res.status(200).send({ status: "ready" });
    } else {
      res.status(500).send({ status: "not ready" });
    }
  });

  app.use("/todo", todoRouter);
};

export default routerInit;
