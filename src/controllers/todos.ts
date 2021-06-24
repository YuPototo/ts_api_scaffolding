import { RequestHandler } from "express";
import { Todo } from "@dune/models/todo";

const TODOS: Todo[] = [];

export const createTodo: RequestHandler = (req, res, next) => {
    const text = (req.body as { text: string }).text;
    const newTodo = new Todo(Math.random().toString(), text);

    TODOS.push(newTodo);

    res.status(201).json({ todo: newTodo });
};

export const getTodos: RequestHandler = (req, res, next) => {
    res.json({ todos: TODOS });
};

export const updateTodo: RequestHandler<{ id: string }> = (req, res, next) => {
    const todoId = req.params.id;
    const updatedText = (req.body as { text: string }).text;
    const todoIndex = TODOS.findIndex((todo) => todo.id === todoId);

    if (todoIndex < 0) {
        throw new Error("could not find todo");
    }

    TODOS[todoIndex] = new Todo(todoId, updatedText);

    res.status(200).json({ todo: TODOS[todoIndex] });
};

export const deleteTodo: RequestHandler<{ id: string }> = (req, res, next) => {
    const todoId = req.params.id;
    const todoIndex = TODOS.findIndex((todo) => todo.id === todoId);

    if (todoIndex < 0) {
        throw new Error("could not find todo");
    }

    TODOS.splice(todoIndex, 1);

    res.json({ message: "deleted" });
};
