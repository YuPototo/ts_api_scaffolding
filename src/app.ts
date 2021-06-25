import express, { Request, Response } from "express";
import { Express } from "express-serve-static-core";
import morgan from "morgan";
import morganBody from "morgan-body";

import config from "@dune/config";
import todoRoutes from "@dune/routes/todos";

const setLogger = (app: Express) => {
    if (config.morganLogger) {
        app.use(
            morgan(
                ":method :url :status :response-time ms - :res[content-length]"
            )
        );
    }

    if (config.morganBodyLogger) {
        morganBody(app);
    }
};

export async function createApp(): Promise<Express> {
    const app = express();

    app.use(express.json()); // 保证 http request body 会被作为 json 传入

    // logger
    setLogger(app);

    app.use("/todos", todoRoutes);

    app.use((err: Error, req: Request, res: Response) => {
        res.status(500).json({ message: err.message });
    });

    return app;
}
