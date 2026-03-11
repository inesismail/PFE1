-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "siteId" TEXT,
    "siteName" TEXT,
    "connectionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id","timestamp")
);

-- CreateIndex
CREATE INDEX "system_logs_timestamp_idx" ON "system_logs"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "system_logs_level_timestamp_idx" ON "system_logs"("level", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "system_logs_source_timestamp_idx" ON "system_logs"("source", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "system_logs_actorId_timestamp_idx" ON "system_logs"("actorId", "timestamp" DESC);
