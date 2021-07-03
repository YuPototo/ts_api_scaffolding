import prisma, { User } from "@dune/db/client";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class LoginError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "LoginError";
    }
}

export class SignupError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SignupError";
    }
}

const createUser = async (
    username: string,
    password: string
): Promise<User> => {
    const existingUser = await prisma.user.findUnique({
        where: {
            username,
        },
    });
    if (existingUser !== null) {
        throw new SignupError("用户名已存在");
    }

    const user = await prisma.user.create({
        data: {
            username,
            password: await bcrypt.hash(password, 12),
        },
    });

    return user;
};

const login = async (username: string, password: string): Promise<User> => {
    const user = await prisma.user.findUnique({
        where: { username },
    });
    if (user === null) {
        throw new LoginError("用户不存在");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw new LoginError(`密码错误`);
    }

    return user;
};

const createToken = async (
    userId: number,
    secret: string,
    expireDays: string
): Promise<string> => {
    const payload = { userId };
    const token = jwt.sign(payload, secret, { expiresIn: expireDays });
    return token;
};

export { createUser, login, createToken };
