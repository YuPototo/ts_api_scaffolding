import request from "supertest";
import jwt from "jsonwebtoken";
import { Express } from "express-serve-static-core";

import { createApp } from "../../src/app";
import prisma from "../../src/db/client";
import config from "../../src/config";

let app: Express;

beforeAll(async () => {
    app = await createApp();
});

describe("GET /checks/success", () => {
    it("should return success message", async () => {
        const res = await request(app).get(`/checks/success`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "success" });
    });
});

describe("GET /checks/syncError", () => {
    it("should return error message", async () => {
        const res = await request(app).get(`/checks/syncError`);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ message: "这是故意设置的 sync 错误" });
    });
});

describe("GET /checks/asyncError", () => {
    it("should return error message", async () => {
        const res = await request(app).get(`/checks/asyncError`);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ message: "这是故意设置的 async 错误" });
    });
});

describe("GET /checks/auth", () => {
    /*
        前提：signup 能正常使用
    */

    it("should return 401 when no authorization is provided", async () => {
        const res = await request(app).get(`/checks/auth`);

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({
            message: "request header 里没有 authorization",
        });
    });

    it("should return 401 when token is not bearer type", async () => {
        const res = await request(app)
            .get(`/checks/auth`)
            .set("Authorization", "Basic something");

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({
            message: "Authorization 不是 Bearer Type",
        });
    });

    it("should return 401 when token is not valid JWT", async () => {
        const res = await request(app)
            .get(`/checks/auth`)
            .set("Authorization", "Bearer wrongToken");

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({
            message: "jwt malformed",
        });
    });

    it("should return 401 when token has expired", async () => {
        const token = jwt.sign({ userId: 1 }, config.jwtSecret, {
            expiresIn: "1ms",
        });
        const res = await request(app)
            .get(`/checks/auth`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ message: "jwt expired" });
    });

    it("should return success message when request has right token", async () => {
        const res1 = await request(app)
            .post(`/api/auth/signup`)
            .send({ username: "testUser", password: "testPassword" });
        const token = res1.body.token;

        const res2 = await request(app)
            .get(`/checks/auth`)
            .set("Authorization", `Bearer ${token}`);

        expect(res2.statusCode).toBe(200);
        expect(res2.body).toHaveProperty("user");

        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });
});
