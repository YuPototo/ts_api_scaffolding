import express, { Request, Response } from "express";
import { Express } from "express-serve-static-core";
import morgan from "morgan";
import morganBody from "morgan-body";

import config from "@dune/config";

import todoRoutes from "@dune/routes/todos";

const setLogger = (app: Express) => {
    if (config.morganLogger) {
        const loggerFormat =
            ":method :url :status :response-time ms - :res[content-length]";
        app.use(morgan(loggerFormat));
    }

    if (config.morganBodyLogger) {
        morganBody(app);
    }
};

export async function createApp(): Promise<Express> {
    const app = express();

    // middleware
    app.use(express.json()); // 保证 http request body 会被作为 json 传入

    // logger
    setLogger(app);

    // routes
    app.use("/api/todos", todoRoutes);

    // 500 错误
    app.use((err: Error, req: Request, res: Response) => {
        res.status(500).json({ message: err.message });
    });

    return app;
}
