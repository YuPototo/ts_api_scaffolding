import { RequestHandler } from "express";

export const checkRes: RequestHandler = async (req, res) => {
    res.json({ message: "success" });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const checkSyncError: RequestHandler = (req, res) => {
    // synchronous error 会被 app.ts 里的 Error-handling middleware 接住
    throw new Error("这是故意设置的 sync 错误");
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const checkAsyncError: RequestHandler = async (req, res, next) => {
    // asynchronous error 需要用 next(err) 才能被接住
    try {
        throw new Error("这是故意设置的 async 错误");
    } catch (err) {
        next(err);
    }
};

export const checkAuth: RequestHandler = async (req, res, next) => {
    try {
        const user = req.currentUser;
        res.json({ user });
    } catch (err) {
        next(err);
    }
};
