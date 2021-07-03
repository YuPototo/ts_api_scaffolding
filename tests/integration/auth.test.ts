import request from "supertest";
import { Express } from "express-serve-static-core";
import validator from "validator";

import { createApp } from "../../src/app";
import prisma, { User } from "../../src/db/client";

let app: Express;

beforeAll(async () => {
    app = await createApp();
});

describe("POST /auth/signup", () => {
    afterEach(async () => {
        const deleteUsers = prisma.user.deleteMany();

        await prisma.$transaction([deleteUsers]);
        await prisma.$disconnect();
    });

    /* --- input validation error --- */
    it("request body should contain username and password", async () => {
        const res1 = await request(app)
            .post(`/api/auth/signup`)
            .send({ password: "testPassword" });

        expect(res1.statusCode).toBe(400);
        expect(res1.body).toStrictEqual({
            message: "request body 缺少 username",
        });

        const res2 = await request(app)
            .post(`/api/auth/signup`)
            .send({ username: "testUser" });

        expect(res2.statusCode).toBe(400);
        expect(res2.body).toStrictEqual({
            message: "request body 缺少 password",
        });
    });

    // 校验用户名
    it("should validate username input", async () => {
        // 用户长度小于 x
        const res1 = await request(app)
            .post(`/api/auth/signup`)
            .send({ username: "te", password: "testPassword" });

        expect(res1.statusCode).toBe(400);
        expect(res1.body).toStrictEqual({ message: "用户名长度不能小于3" });

        // 用户名长度大于 y
        const res2 = await request(app)
            .post(`/api/auth/signup`)
            .send({ username: "12345abcde12345a", password: "testPassword" });

        expect(res2.statusCode).toBe(400);
        expect(res2.body).toStrictEqual({ message: "用户名长度不能大于15" });

        // 用户名不能包含空格
        const res3 = await request(app)
            .post(`/api/auth/signup`)
            .send({ username: "ab haha", password: "testPassword" });

        expect(res3.statusCode).toBe(400);
        expect(res3.body).toStrictEqual({ message: "用户名不能包含空格" });
    });

    // 校验密码
    it("should validate password input", async () => {
        // 密码长度小于 x
        const res1 = await request(app)
            .post(`/api/auth/signup`)
            .send({ username: "testPassword", password: "123456" });

        expect(res1.statusCode).toBe(400);
        expect(res1.body).toStrictEqual({ message: "密码长度不能小于7" });

        // 密码长度大于 x
        const password = "0123456789abcdefghijklmnopqrstuvwxy";
        const res2 = await request(app)
            .post(`/api/auth/signup`)
            .send({ username: "testPassword", password });

        expect(res2.statusCode).toBe(400);
        expect(res2.body).toStrictEqual({ message: "密码长度不能大于30" });

        // 密码不能包含空格
        const res3 = await request(app)
            .post(`/api/auth/signup`)
            .send({ username: "testPassword", password: "ab cdefgdefg" });

        expect(res3.statusCode).toBe(400);
        expect(res3.body).toStrictEqual({ message: "密码不能包含空格" });
    });

    /* --- buisness logic error --- */
    it("should not allow duplicate user", async () => {
        await prisma.user.create({
            data: {
                username: "testUser",
                password: "testPassword",
            },
        });

        const res = await request(app)
            .post(`/api/auth/signup`)
            .send({ username: "testUser", password: "testPassword" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({ message: "用户名已存在" });
    });

    /* --- endpoint response --- */
    it("should successfully create user and return data", async () => {
        const res = await request(app)
            .post(`/api/auth/signup`)
            .send({ username: "testUser", password: "testPassword" });

        expect(res.statusCode).toBe(201);

        expect(res.body).toHaveProperty("user.username");
        expect(res.body).toHaveProperty("token");
        expect(validator.isJWT(res.body.token)).toBeTruthy();
    });

    /* --- other testing point --- */
    it("should create a record in db", async () => {
        await request(app)
            .post(`/api/auth/signup`)
            .send({ username: "testUser", password: "testPassword" });

        const user = await prisma.user.findFirst({
            where: { username: "testUser" },
        });

        expect(user).not.toBe(null);
    });

    it("should not save raw testPassword", async () => {
        await request(app)
            .post(`/api/auth/signup`)
            .send({ username: "testUser", password: "testPassword" });

        const user = (await prisma.user.findFirst({
            where: { username: "testUser" },
        })) as User;

        expect(user.password).not.toBe("testPassword");
    });
});

describe("POST /auth/login", () => {
    beforeAll(async () => {
        await request(app)
            .post(`/api/auth/signup`)
            .send({ username: "testUser", password: "testPassword" });
    });

    afterAll(async () => {
        const deleteUsers = prisma.user.deleteMany();

        await prisma.$transaction([deleteUsers]);
        await prisma.$disconnect();
    });

    /* --- input validation --- */
    it("request body should contain username and password", async () => {
        const res1 = await request(app)
            .post(`/api/auth/login`)
            .send({ password: "testPassword" });

        expect(res1.statusCode).toBe(400);
        expect(res1.body).toStrictEqual({
            message: "request body 缺少 username",
        });

        const res2 = await request(app)
            .post(`/api/auth/login`)
            .send({ username: "testUser" });

        expect(res2.statusCode).toBe(400);
        expect(res2.body).toStrictEqual({
            message: "request body 缺少 password",
        });
    });

    /* --- endpoint response --- */

    it("should successfully login", async () => {
        const res = await request(app)
            .post(`/api/auth/login`)
            .send({ username: "testUser", password: "testPassword" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("user.username");
        expect(res.body.user.username).toBe("testUser");
        expect(res.body).toHaveProperty("token");
        expect(validator.isJWT(res.body.token)).toBeTruthy();
    });

    it("should fail when username doesn't exist", async () => {
        const res = await request(app)
            .post(`/api/auth/login`)
            .send({ username: "notExitUser", password: "testPassword" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({ message: "用户不存在" });
    });

    it("should fail when username and password not match", async () => {
        const res = await request(app)
            .post(`/api/auth/login`)
            .send({ username: "testUser", password: "wrongPassword" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({ message: "密码错误" });
    });
});
