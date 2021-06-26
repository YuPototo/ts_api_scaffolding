import request from "supertest";
import { Express } from "express-serve-static-core";

import { createApp } from "@dune/app";
import prisma from "@dune/db/client";

let app: Express;

beforeAll(async () => {
    app = await createApp();
});

describe("GET /todos", () => {
    beforeAll(async () => {
        await prisma.todo.createMany({
            data: [{ text: "learn TS" }, { text: "learn Postgres" }],
        });
    });

    afterAll(async () => {
        const deleteTodos = prisma.todo.deleteMany();

        await prisma.$transaction([deleteTodos]);
        await prisma.$disconnect();
    });

    it("should get two todos", async () => {
        const res = await request(app).get(`/todos`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("todos");
        expect(res.body.todos).toHaveLength(2);

        expect(res.body.todos[0]).toHaveProperty("text");
        expect(res.body.todos[0]).toHaveProperty("id");
        expect(res.body.todos[1]).toHaveProperty("text");
        expect(res.body.todos[1]).toHaveProperty("id");
    });
});

describe("POST /todos", () => {
    afterAll(async () => {
        const deleteTodos = prisma.todo.deleteMany();

        await prisma.$transaction([deleteTodos]);
        await prisma.$disconnect();
    });

    it("should create a todo", async () => {
        const res = await request(app)
            .post(`/todos`)
            .send({ text: "learn TypeScript" });

        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject({
            todo: {
                text: "learn TypeScript",
            },
        });
        expect(res.body.todo).toHaveProperty("id");
    });

    it("should throw error when incoming data is wrong", async () => {
        const res = await request(app)
            .post(`/todos`)
            .send({ wrongKey: "learn TypeScript" });

        expect(res.statusCode).toBe(400);

        const expectBody = {
            message: "没有传 text",
        };
        expect(res.body).toEqual(expectBody);
    });
});

describe("PATCH /todos", () => {
    let todoId: number;

    beforeAll(async () => {
        const todo = await prisma.todo.create({
            data: {
                text: "learn TypeScript",
            },
        });
        todoId = todo.id;
    });

    afterAll(async () => {
        const deleteTodos = prisma.todo.deleteMany();

        await prisma.$transaction([deleteTodos]);
        await prisma.$disconnect();
    });

    it("should patch todo", async () => {
        const res = await request(app)
            .patch(`/todos/${todoId}`)
            .send({ text: "learn Postgres" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("todo");
        expect(res.body.todo).toMatchObject({
            text: "learn Postgres",
        });
    });
});

describe("DELETE /todos", () => {
    let todoId: number;

    beforeAll(async () => {
        const todo = await prisma.todo.create({
            data: {
                text: "learn TypeScript",
            },
        });
        todoId = todo.id;
    });

    afterAll(async () => {
        const deleteTodos = prisma.todo.deleteMany();

        await prisma.$transaction([deleteTodos]);
        await prisma.$disconnect();
    });

    it("should delete todo", async () => {
        const res = await request(app).delete(`/todos/${todoId}`);
        expect(res.statusCode).toBe(200);

        const getResAfterDelete = await request(app).get(`/todos`);
        expect(getResAfterDelete.body.todos).toHaveLength(0);
    });
});
