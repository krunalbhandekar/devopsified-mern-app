import express from "express";
import Todo from "../models/todo.js";
import logger from "../../utils/logger.js";

const TodoRouter = express.Router();

TodoRouter.get("/", async (req, res) => {
  try {
    const todos = await Todo.find();

    res.status(200).send({
      status: "success",
      todos,
    });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[get-todos]", err.message);
    }
    res
      .status(200)
      .send({ status: "error", error: "Error fetching data from resource" });
  }
});

TodoRouter.post("/", async (req, res) => {
  const { title } = req.body;
  try {
    const todo = await Todo.create({ title });

    res.status(200).send({
      status: "success",
      todo,
    });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[create-todo]", err.message);
    }
    res.status(200).send({ status: "error", error: "Error creating resource" });
  }
});

TodoRouter.delete("/:todoId", async (req, res) => {
  const _id = req.params.todoId;
  try {
    const todo = await Todo.deleteOne({ _id });

    res.status(200).send({
      status: "success",
      todo,
    });
  } catch (err) {
    if (err instanceof Error) {
      logger.error("[delete-todo]", err.message);
    }
    res.status(200).send({
      status: "error",
      error: "Error deleting resource with provided identifier",
    });
  }
});

export default TodoRouter;
