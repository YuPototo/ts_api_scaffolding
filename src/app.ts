import express, { Request, Response, NextFunction } from "express";
import { Express } from "express-serve-static-core";

import todoRoutes from "@dune/routes/todos";

export async function createApp(): Promise<Express> {
    const app = express();

    app.use(express.json()); // 保证 http request body 会被作为 json 传入

    app.use("/todos", todoRoutes);

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        res.status(500).json({ message: err.message });
    });

    return app;
}
