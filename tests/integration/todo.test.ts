import request from "supertest";
import { Express } from "express-serve-static-core";
import jwt from "jsonwebtoken";

import { createApp } from "../../src/app";
import prisma from "../../src/db/client";
import config from "../../src/config";

let app: Express;
let token: string;
const userOneId = 100;
const userTwoId = 200;

beforeAll(async () => {
    try {
        app = await createApp();

        await prisma.user.createMany({
            data: [
                { id: userOneId, username: "user_1", password: "testPassword" },
                { id: userTwoId, username: "user_2", password: "testPassword" },
            ],
        });

        token = jwt.sign({ userId: userOneId }, config.jwtSecret, {
            expiresIn: config.jwtLifetime,
        });
    } catch (err) {
        console.error("todo.test 的 setup error");
        console.error(err);
    }
});

afterAll(async () => {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
});

describe("GET /todos", () => {
    beforeAll(async () => {
        await prisma.todo.createMany({
            data: [
                { id: 1, userId: userOneId, text: "learn TS", isDone: false },
                {
                    id: 2,
                    userId: userOneId,
                    text: "learn Postgres",
                    isDone: false,
                },
                {
                    id: 3,
                    userId: userTwoId,
                    text: "learn Japanese",
                    isDone: false,
                },
            ],
        });
    });

    afterAll(async () => {
        await prisma.todo.deleteMany();
        await prisma.$disconnect();
    });

    it("should validate auth", async () => {
        const res = await request(app).get(`/api/todos`);

        expect(res.statusCode).toBe(401);
    });

    it("should get two todos", async () => {
        const res = await request(app)
            .get(`/api/todos`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("todos");
        expect(res.body.todos).toHaveLength(2);
    });

    it("todo item should have the right shape", async () => {
        const res = await request(app)
            .get(`/api/todos`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.body.todos[0]).toStrictEqual({
            id: 1,
            text: "learn TS",
            isDone: false,
        });
    });
});

describe("POST /todos", () => {
    afterAll(async () => {
        const deleteTodos = prisma.todo.deleteMany();

        await prisma.$transaction([deleteTodos]);
        await prisma.$disconnect();
    });

    it("should validate auth", async () => {
        const res = await request(app).post(`/api/todos`);

        expect(res.statusCode).toBe(401);
    });

    it("should validate todo input", async () => {
        const res = await request(app)
            .post(`/api/todos`)
            .set("Authorization", `Bearer ${token}`)
            .send({ wrongKey: "learn TypeScript" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({
            message: "没有传 text",
        });

        const res2 = await request(app)
            .post(`/api/todos`)
            .set("Authorization", `Bearer ${token}`)
            .send({ text: 2 });

        expect(res2.statusCode).toBe(400);
        expect(res2.body).toStrictEqual({
            message: "text 必须是 string",
        });

        const res3 = await request(app)
            .post(`/api/todos`)
            .set("Authorization", `Bearer ${token}`)
            .send({ text: "" });

        expect(res3.statusCode).toBe(400);
        expect(res3.body).toStrictEqual({
            message: "text 不能为空",
        });
    });

    it("should create a todo", async () => {
        const res = await request(app)
            .post(`/api/todos`)
            .set("Authorization", `Bearer ${token}`)
            .send({ text: "learn Something Cool" });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("todo");

        const todo = res.body.todo;
        expect(todo).toMatchObject({
            text: "learn Something Cool",
            isDone: false,
        });
        expect(todo).toHaveProperty("id");
    });
});

describe("PATCH /todos", () => {
    beforeAll(async () => {
        await prisma.todo.createMany({
            data: [
                { id: 1, userId: userOneId, text: "learn TS", isDone: false },
                {
                    id: 2,
                    userId: userOneId,
                    text: "learn Postgres",
                    isDone: false,
                },
                {
                    id: 3,
                    userId: userTwoId,
                    text: "learn Postgres",
                    isDone: false,
                },
            ],
        });
    });

    afterAll(async () => {
        const deleteTodos = prisma.todo.deleteMany();

        await prisma.$transaction([deleteTodos]);
        await prisma.$disconnect();
    });

    it("should validate auth", async () => {
        const res = await request(app)
            .patch(`/api/todos/1`)
            .send({ text: "learn football" });

        expect(res.statusCode).toBe(401);
    });

    it("should validate input", async () => {
        const res = await request(app)
            .patch(`/api/todos/a`)
            .set("Authorization", `Bearer ${token}`)
            .send({ text: "learn football" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({
            message: "param id 必须是数字",
        });

        const res2 = await request(app)
            .patch(`/api/todos/1`)
            .set("Authorization", `Bearer ${token}`)
            .send({ wrongKey: "learn football" });

        expect(res2.statusCode).toBe(400);
        expect(res2.body).toStrictEqual({
            message: "req body 应该有 text 或 isDone",
        });
    });

    it("should check validate todo's existence", async () => {
        const res = await request(app)
            .patch(`/api/todos/100`)
            .set("Authorization", `Bearer ${token}`)
            .send({ isDone: true });

        expect(res.statusCode).toBe(404);
        expect(res.body).toStrictEqual({ message: "找不到这个 todo" });
    });

    it("should check user own todo", async () => {
        const res = await request(app)
            .patch(`/api/todos/3`)
            .set("Authorization", `Bearer ${token}`)
            .send({ isDone: true });

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ message: "没有权限" });
    });

    it("should patch todo", async () => {
        const res = await request(app)
            .patch(`/api/todos/1`)
            .set("Authorization", `Bearer ${token}`)
            .send({ text: "learn football" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("todo");
        expect(res.body.todo).toMatchObject({
            text: "learn football",
        });

        const res2 = await request(app)
            .patch(`/api/todos/2`)
            .set("Authorization", `Bearer ${token}`)
            .send({ isDone: true });

        expect(res2.statusCode).toBe(200);
        expect(res2.body).toHaveProperty("todo");
        expect(res2.body.todo).toMatchObject({
            isDone: true,
        });
    });

    it("should return the right todo shape", async () => {
        const res = await request(app)
            .patch(`/api/todos/1`)
            .set("Authorization", `Bearer ${token}`)
            .send({ text: "learn football" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("todo");
        expect(res.body.todo).toStrictEqual({
            id: 1,
            text: "learn football",
            isDone: false,
        });
    });
});

describe("DELETE /todos", () => {
    beforeAll(async () => {
        await prisma.todo.createMany({
            data: [
                { id: 1, userId: userOneId, text: "learn TS", isDone: false },
                {
                    id: 2,
                    userId: userOneId,
                    text: "learn Postgres",
                    isDone: false,
                },
            ],
        });
    });

    afterAll(async () => {
        const deleteTodos = prisma.todo.deleteMany();

        await prisma.$transaction([deleteTodos]);
        await prisma.$disconnect();
    });

    it("should validate auth", async () => {
        const res = await request(app).delete(`/api/todos/1`);

        expect(res.statusCode).toBe(401);
    });

    it("should delete todo", async () => {
        const res = await request(app)
            .delete(`/api/todos/1`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);

        const todo = await prisma.todo.findUnique({ where: { id: 1 } });
        expect(todo).toBeNull();
    });
});
