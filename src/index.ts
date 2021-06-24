import { createApp } from "@dune/app";
import config from "@dune/config";

createApp()
    .then((app) => {
        app.listen(config.port, () => {
            console.info(`Listening on http://localhost:${config.port}`);
        });
    })
    .catch((err) => {
        console.error(`Error: ${err}`);
    });
