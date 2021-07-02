import { createApp } from "@dune/app";
import config from "@dune/config";
import logger from "@dune/utils/logger";
import prisma from "@dune/db/client";

createApp()
    .then((app) => {
        app.listen(config.port, () => {
            logger.info(`Listening on http://localhost:${config.port}`);
        });
    })
    .catch((err) => {
        logger.error(`Error: ${err}`);
    });

prisma
    .$connect()
    .then(() => {
        logger.info("db connected");
        prisma.$disconnect();
    })
    .catch((err) => {
        logger.error(`db fail to connect: ${err}`);
    });

// prisma 导致 ts-node-dev 失败。需要用下面的代码来解决。
process.on("SIGTERM", () => {
    process.exit();
});
