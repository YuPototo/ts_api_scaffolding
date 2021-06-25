import dotenvExtended from "dotenv-extended";
import dotenvParseVariables from "dotenv-parse-variables";

// winston log levels
type LogLevel =
    | "silent"
    | "error"
    | "warn"
    | "info"
    | "http"
    | "verbose"
    | "debug"
    | "silly";

// env
const env = dotenvExtended.load({
    path: process.env.ENV_FILE,
    defaults: "./config/.env.defaults",
    schema: "./config/.env.schema",
    includeProcessEnv: true,
    silent: false,
    errorOnMissing: true,
    errorOnExtra: true,
});

const parsedEnv = dotenvParseVariables(env);

interface Config {
    port: number;

    // logger
    morganLogger: boolean;
    morganBodyLogger: boolean;
    // delare loggerLevel config property
    loggerLevel: LogLevel;
}

const config: Config = {
    port: parsedEnv.PORT as number,

    morganLogger: parsedEnv.MORGAN_LOGGER as boolean,
    morganBodyLogger: parsedEnv.MORGAN_BODY_LOGGER as boolean,
    loggerLevel: parsedEnv.LOGGER_LEVEL as LogLevel,
};

export default config;
