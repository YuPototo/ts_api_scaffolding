/*
    用于 unit test
    代码来自：https://www.prisma.io/docs/guides/testing/unit-testing#mocking-the-prisma-client
*/
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, MockProxy } from "jest-mock-extended";

import prisma from "./client";

jest.mock("./client", () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
    mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as MockProxy<PrismaClient>;
