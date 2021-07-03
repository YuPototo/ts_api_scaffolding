import { RequestHandler } from "express";
import Todo, { PatchTodoInput } from "@dune/models/todoModel";

import {
    validatePostTodoInput,
    validatePacthTodoInput,
} from "@dune/controllers/validations/todoValidation";
import { InputValidationError } from "@dune/controllers/validations/inputValidationError";

export const createTodoHandler: RequestHandler = async (req, res, next) => {
    try {
        validatePostTodoInput(req.body);

        const { text } = req.body as { text: string };
        const todo = await Todo.createTodo(req.currentUser.id, text);

        res.status(201).json({ todo });
    } catch (err) {
        if (err instanceof InputValidationError) {
            res.status(400).json({ message: err.message });
        } else {
            next(err);
        }
    }
};

export const getTodosHandler: RequestHandler = async (req, res, next) => {
    try {
        const todos = await Todo.getTodos(req.currentUser.id);
        res.json({ todos });
    } catch (err) {
        next(err);
    }
};

export const updateTodo: RequestHandler<{ id: string }> = async (
    req,
    res,
    next
) => {
    try {
        validatePacthTodoInput(req.params, req.body);

        const reqBody = req.body as PatchTodoInput;
        const todoId = parseInt(req.params.id);
        const todo = await Todo.getTodoById(todoId);
        if (!todo) {
            return res.status(404).json({ message: "找不到这个 todo" });
        }
        if (todo.userId !== req.currentUser.id) {
            return res.status(401).json({ message: "没有权限" });
        }
        const updatedTodo = await Todo.updateTodo(todoId, reqBody);

        res.json({ todo: updatedTodo });
    } catch (err) {
        if (err instanceof InputValidationError) {
            res.status(400).json({ message: err.message });
        } else {
            next(err);
        }
    }
};

export const deleteTodo: RequestHandler<{ id: string }> = async (req, res) => {
    const todoId = parseInt(req.params.id);
    await Todo.deleteTodo(todoId);

    res.json({ message: "deleted" });
};
