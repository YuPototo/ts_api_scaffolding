import { RequestHandler } from "express";

import logger from "@dune/utils/logger";
import {
    validateSignupInput,
    validateLoginInput,
} from "@dune/controllers/validations/authValidation";
import { InputValidationError } from "@dune/controllers/validations/inputValidationError";

import config from "@dune/config";
import * as UserModel from "@dune/models/userModel";

export const signupHandler: RequestHandler = async (req, res, next) => {
    // 创建用户
    try {
        validateSignupInput(req.body);
        const { username, password } = req.body;

        const user = await UserModel.createUser(username, password);
        const token = await UserModel.createToken(
            user.id,
            config.jwtSecret,
            config.jwtLifetime
        );
        res.status(201).json({
            user: {
                username: user.username,
            },
            token,
        });
    } catch (err) {
        if (err instanceof InputValidationError) {
            res.status(400).json({ message: err.message });
        } else if (err instanceof UserModel.SignupError) {
            res.status(400).json({ message: err.message });
        } else {
            logger.error(err);
            next(err);
        }
    }
};

export const loginHandler: RequestHandler = async (req, res, next) => {
    try {
        validateLoginInput(req.body);
        const { username, password } = req.body;

        const user = await UserModel.login(username, password);
        const token = await UserModel.createToken(
            user.id,
            config.jwtSecret,
            config.jwtLifetime
        );
        res.json({
            user: { username: user.username },
            token,
        });
    } catch (err) {
        if (err instanceof InputValidationError) {
            res.status(400).json({ message: err.message });
        } else if (err instanceof UserModel.LoginError) {
            res.status(400).json({ message: err.message });
        } else {
            logger.error(err);
            next(err);
        }
    }
};
