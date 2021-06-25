import { Router } from "express";

import {
    createTodo,
    getTodos,
    updateTodo,
    deleteTodo,
} from "@dune/controllers/todo";

const router = Router();

router.route("/").get(getTodos).post(createTodo);

router.route("/:id").patch(updateTodo).delete(deleteTodo);

export default router;
