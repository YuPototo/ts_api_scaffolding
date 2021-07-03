import { RequestHandler } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

import config from "@dune/config";
import prisma from "@dune/db/client";
import logger from "@dune/utils/logger";

class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthError";
    }
}

const getUserbyToken = async (token: string, secret: string) => {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(decoded.userId),
        },
    });

    if (!user) {
        throw new Error(`找不到用户${decoded.userId}`);
    }
    return user;
};

const validateAuthHeader = (authHeader: string | undefined) => {
    if (!authHeader) {
        throw new AuthError("request header 里没有 authorization");
    }
    const authorizationStrings = authHeader.split(" ");

    const authType = authorizationStrings[0];
    if (authType !== "Bearer") {
        throw new AuthError("Authorization 不是 Bearer Type");
    }
};

export const auth: RequestHandler = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        validateAuthHeader(authHeader);

        const token = (authHeader as string).split(" ")[1];
        req.currentUser = await getUserbyToken(token, config.jwtSecret);
        next();
    } catch (err) {
        if (err instanceof AuthError) {
            res.status(401).send({ message: err.message });
        } else if (err instanceof JsonWebTokenError) {
            res.status(401).send({ message: err.message });
        } else {
            logger.error(err.message);
            next(err);
        }
    }
};
