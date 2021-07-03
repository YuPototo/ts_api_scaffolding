import { InputValidationError } from "@dune/controllers/validations/inputValidationError";

interface AuthInput {
    username: string;
    password: string;
}

const validateUsername = (username: string) => {
    if (username.length < 3) {
        throw new InputValidationError("用户名长度不能小于3");
    }
    if (username.length > 15) {
        throw new InputValidationError("用户名长度不能大于15");
    }
    if (username.includes(" ")) {
        throw new InputValidationError("用户名不能包含空格");
    }
};

const validatePassword = (password: string) => {
    if (password.length < 7) {
        throw new InputValidationError("密码长度不能小于7");
    }
    if (password.length > 30) {
        throw new InputValidationError("密码长度不能大于30");
    }
    if (password.includes(" ")) {
        throw new InputValidationError("密码不能包含空格");
    }
};

export const validateSignupInput = (reqBody: AuthInput): void => {
    // check existence
    const { username, password } = reqBody;
    if (username === undefined) {
        throw new InputValidationError("request body 缺少 username");
    }
    if (password === undefined) {
        throw new InputValidationError("request body 缺少 password");
    }

    // 用户名
    validateUsername(username);

    // 密码
    validatePassword(password);
};

export const validateLoginInput = (reqBody: AuthInput): void => {
    const { username, password } = reqBody;
    if (username === undefined) {
        throw new InputValidationError("request body 缺少 username");
    }
    if (password === undefined) {
        throw new InputValidationError("request body 缺少 password");
    }
};
