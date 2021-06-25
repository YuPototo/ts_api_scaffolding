import { createApp } from "@dune/app";
import config from "@dune/config";
import logger from "@dune/utils/logger";

createApp()
    .then((app) => {
        app.listen(config.port, () => {
            logger.info(`Listening on http://localhost:${config.port}`);
        });
    })
    .catch((err) => {
        logger.error(`Error: ${err}`);
    });
