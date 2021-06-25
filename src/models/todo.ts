import { PrismaClient, Todo } from "@prisma/client";

// import logger from "@dune/utils/logger";

const prisma = new PrismaClient();

const createTodo = async (text: string): Promise<Todo> => {
    const todo = await prisma.todo.create({
        data: {
            text,
        },
    });
    return todo;
};

const getTodos = async (): Promise<Todo[]> => {
    const todos = await prisma.todo.findMany();
    return todos;
};

const updateTodo = async (id: number, newText: string): Promise<Todo> => {
    const todo = await prisma.todo.update({
        where: {
            id,
        },
        data: {
            text: newText,
        },
    });
    return todo;
};

const deleteTodo = async (id: number): Promise<Todo> => {
    const deletedTodo = await prisma.todo.delete({
        where: {
            id,
        },
    });
    return deletedTodo;
};

export default {
    createTodo,
    getTodos,
    updateTodo,
    deleteTodo,
};
