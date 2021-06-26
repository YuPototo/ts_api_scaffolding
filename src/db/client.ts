import { PrismaClient } from "@prisma/client";

// 由 prisma 生成的 type
export { Todo } from "@prisma/client";

const prisma = new PrismaClient();
export default prisma;
