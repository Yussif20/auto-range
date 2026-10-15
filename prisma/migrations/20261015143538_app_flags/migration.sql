-- CreateTable
CREATE TABLE "AppFlag" (
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppFlag_pkey" PRIMARY KEY ("key")
);
