import prisma, { Todo } from "@dune/db/client";

interface TodoOutput {
    id: number;
    text: string;
    isDone: boolean;
}

export interface PatchTodoInput {
    text?: string;
    isDone?: string;
}

const getTodoById = async (id: number): Promise<Todo | null> => {
    const todo = await prisma.todo.findUnique({
        where: { id },
    });
    return todo;
};

const createTodo = async (
    userId: number,
    text: string
): Promise<TodoOutput> => {
    const todo = await prisma.todo.create({
        data: {
            userId,
            text,
        },
    });
    return todo;
};

const getTodos = async (userId: number): Promise<TodoOutput[]> => {
    const todos = await prisma.todo.findMany({
        where: { userId },
        select: { id: true, text: true, isDone: true },
    });
    return todos;
};

const updateTodo = async (
    id: number,
    patchTodoInput: PatchTodoInput
): Promise<TodoOutput> => {
    const { text, isDone } = patchTodoInput;
    if (text === undefined && isDone === undefined) {
        throw new Error("text 和 isDone 都是 undefined");
    }
    const updatedData = {};

    if (text !== undefined) {
        Object.assign(updatedData, { text });
    }

    if (isDone !== undefined) {
        Object.assign(updatedData, { isDone });
    }

    const todo = await prisma.todo.update({
        where: {
            id,
        },
        data: updatedData,
        select: {
            id: true,
            text: true,
            isDone: true,
        },
    });
    return todo;
};

const deleteTodo = async (id: number): Promise<TodoOutput> => {
    const deletedTodo = await prisma.todo.delete({
        where: {
            id,
        },
    });
    return deletedTodo;
};

export default {
    getTodoById,
    createTodo,
    getTodos,
    updateTodo,
    deleteTodo,
};
