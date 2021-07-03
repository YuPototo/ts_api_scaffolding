import dotenvExtended from "dotenv-extended";
import dotenvParseVariables from "dotenv-parse-variables";

// winston log levels
type LogLevel =
    | "silent" // 默认选项，彻底不用 log
    | "error"
    | "warn"
    | "info"
    | "http" // prod 环境下，低于这个的不记录
    | "verbose"
    | "debug" // dev 环境
    | "silly";

// env
const env = dotenvExtended.load({
    path: process.env.ENV_FILE, // 会在 package.json 内设置这个 ENV_FILE
    defaults: "./config/.env.defaults", // 即刚才创建的 .env.defaults
    schema: "./config/.env.schema", // 即刚才创建的 .env.schema
    includeProcessEnv: true, // 把 process.env 里的变量也放进校验里
    silent: false, // 没有 .env 或 .env.defaults 文件时，会 console.log 信息
    errorOnMissing: true, // 缺少 schema 需要的变量时，会报错
    errorOnExtra: true, // 存在多余的变量时，会报错
});

const parsedEnv = dotenvParseVariables(env);

interface Config {
    // port
    port: number;

    // logger
    morganLogger: boolean;
    morganBodyLogger: boolean;
    // delare loggerLevel config property
    loggerLevel: LogLevel;

    // jwt
    jwtSecret: string;
    jwtLifetime: string;
}

const config: Config = {
    port: parsedEnv.PORT as number,

    morganLogger: parsedEnv.MORGAN_LOGGER as boolean,
    morganBodyLogger: parsedEnv.MORGAN_BODY_LOGGER as boolean,
    loggerLevel: parsedEnv.LOGGER_LEVEL as LogLevel,

    jwtSecret: parsedEnv.JWT_SECRET as string,
    jwtLifetime: parsedEnv.JWT_LIFETIME as string,
};

export default config;
