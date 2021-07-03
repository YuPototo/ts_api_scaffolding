import { InputValidationError } from "@dune/controllers/validations/inputValidationError";

interface NewTodoInput {
    text: string;
}

interface PatchReqParam {
    id: string;
}

interface PatchTodoInput {
    text?: string;
    isDone?: string;
}

export const validatePostTodoInput = (reqBody: NewTodoInput): void => {
    const { text } = reqBody;
    if (text === undefined) {
        throw new InputValidationError("没有传 text");
    }
    if (typeof text !== "string") {
        throw new InputValidationError("text 必须是 string");
    }
    if (text === "") {
        throw new InputValidationError("text 不能为空");
    }
};

export const validatePacthTodoInput = (
    reqParam: PatchReqParam,
    reqBody: PatchTodoInput
): void => {
    const { id } = reqParam;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        throw new InputValidationError("param id 必须是数字");
    }

    const { text, isDone } = reqBody;
    if (text === undefined && isDone === undefined) {
        throw new InputValidationError("req body 应该有 text 或 isDone");
    }
};
