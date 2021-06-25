import request from "supertest";
import { Express } from "express-serve-static-core";

import { createApp } from "@dune/app";

let app: Express;

beforeAll(async () => {
    app = await createApp();
});

/*
用下面这个方法删除内存里的 todo
不是个好方法，删除动作依赖于两个 endpoint，而这两个 endpoint 本身就是被测试的对象
测试里的 setup 也有类似的问题。如果有数据库的话，应该直接操作数据库来 setup 和 teardown。
*/
const deleteAllTodo = async () => {
    const res = await request(app).get(`/todos`);
    if (res.body.todos.length === 0) return;
    for (const todo of res.body.todos) {
        await request(app).delete(`/todos/${todo.id}`);
    }
};

describe("POST /todos", () => {
    afterAll(async () => {
        await deleteAllTodo();
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

describe("GET /todos with data", () => {
    beforeAll(async () => {
        await request(app).post(`/todos`).send({ text: "learn TypeScript" });

        await request(app).post(`/todos`).send({ text: "learn Postgres" });
    });

    afterAll(async () => {
        await deleteAllTodo();
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

describe("PATCH /todos", () => {
    beforeAll(async () => {
        await request(app).post(`/todos`).send({ text: "learn TypeScript" });
    });

    afterAll(async () => {
        await deleteAllTodo();
    });

    it("should patch todo", async () => {
        const getRes = await request(app).get(`/todos`);
        const id = getRes.body.todos[0].id;

        const res = await request(app)
            .patch(`/todos/${id}`)
            .send({ text: "learn Postgres" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("todo");
        expect(res.body.todo).toMatchObject({
            text: "learn Postgres",
        });
    });
});

describe("DELETE /todos", () => {
    beforeAll(async () => {
        await request(app).post(`/todos`).send({ text: "learn TypeScript" });
    });

    afterAll(async () => {
        await deleteAllTodo();
    });

    it("should get two todos", async () => {
        const getRes = await request(app).get(`/todos`);
        const id = getRes.body.todos[0].id;

        const res = await request(app).delete(`/todos/${id}`);
        expect(res.statusCode).toBe(200);

        const getResAfterDelete = await request(app).get(`/todos`);
        expect(getResAfterDelete.body.todos).toHaveLength(0);
    });
});
