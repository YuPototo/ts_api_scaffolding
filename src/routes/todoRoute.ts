import { Router } from "express";

import { auth } from "@dune/middleware/auth";
import {
    createTodoHandler,
    getTodosHandler,
    updateTodo,
    deleteTodo,
} from "@dune/controllers/todoController";

const router = Router();

router.route("/").get(auth, getTodosHandler).post(auth, createTodoHandler);

router.route("/:id").patch(auth, updateTodo).delete(auth, deleteTodo);

export default router;
