import { RequestHandler } from "express";
import Todo from "@dune/models/todo";

export const createTodo: RequestHandler = async (req, res) => {
    const text = (req.body as { text: string }).text;

    if (text === undefined) {
        return res.status(400).json({ message: "没有传 text" });
    }

    const newTodo = await Todo.createTodo(text);

    res.status(201).json({ todo: newTodo });
};

export const getTodos: RequestHandler = async (req, res) => {
    const todos = await Todo.getTodos();
    res.json({ todos });
};

export const updateTodo: RequestHandler<{ id: string }> = async (req, res) => {
    const todoId = parseInt(req.params.id);
    const updatedText = (req.body as { text: string }).text;

    const todo = await Todo.updateTodo(todoId, updatedText);

    res.json({ todo });
};

export const deleteTodo: RequestHandler<{ id: string }> = async (req, res) => {
    const todoId = parseInt(req.params.id);
    await Todo.deleteTodo(todoId);

    res.json({ message: "deleted" });
};
