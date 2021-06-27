-- CreateTable
CREATE TABLE "Todo" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text" VARCHAR(255) NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);
