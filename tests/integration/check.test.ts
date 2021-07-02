import request from "supertest";
import { Express } from "express-serve-static-core";

import { createApp } from "../../src/app";

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
