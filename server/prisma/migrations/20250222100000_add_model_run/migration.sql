-- CreateTable
CREATE TABLE "ModelRun" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "rawModelText" TEXT NOT NULL,
    "parsedJson" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModelRun_ticketId_idx" ON "ModelRun"("ticketId");

-- AddForeignKey
ALTER TABLE "ModelRun" ADD CONSTRAINT "ModelRun_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
