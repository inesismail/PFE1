-- CreateTable
CREATE TABLE "dso_connections" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "baseUrl" TEXT NOT NULL,
    "authEmail" TEXT NOT NULL,
    "authPassword" TEXT NOT NULL,
    "tariffUrl" TEXT,
    "energyUrl" TEXT,
    "regions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dso_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_links" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "dsoConnectionId" TEXT NOT NULL,
    "dsoSiteRef" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "optimizationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "energy_snapshots" (
    "id" TEXT NOT NULL,
    "siteLinkId" TEXT NOT NULL,
    "energieKw" DOUBLE PRECISION NOT NULL,
    "tarif" DOUBLE PRECISION NOT NULL,
    "signal" INTEGER NOT NULL,
    "congestionLevel" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "energy_snapshots_pkey" PRIMARY KEY ("id","timestamp")
);

-- CreateTable
CREATE TABLE "dso_optimization_logs" (
    "id" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dsoSiteRef" TEXT NOT NULL,
    "dsoSiteName" TEXT NOT NULL,
    "siteLinkId" TEXT,
    "energyKw" DOUBLE PRECISION NOT NULL,
    "maxCapacityKw" DOUBLE PRECISION NOT NULL,
    "computedLimitKw" DOUBLE PRECISION NOT NULL,
    "level" TEXT NOT NULL,
    "remark" TEXT,
    "totalDsoEnergyKw" DOUBLE PRECISION,
    "totalDemandKw" DOUBLE PRECISION,
    "appliedToCpo" BOOLEAN NOT NULL DEFAULT false,
    "triggeredBy" TEXT NOT NULL DEFAULT 'auto',

    CONSTRAINT "dso_optimization_logs_pkey" PRIMARY KEY ("id","time")
);

-- CreateIndex
CREATE INDEX "dso_connections_isActive_idx" ON "dso_connections"("isActive");

-- CreateIndex
CREATE INDEX "dso_connections_lastSyncAt_idx" ON "dso_connections"("lastSyncAt" DESC);

-- CreateIndex
CREATE INDEX "site_links_siteId_idx" ON "site_links"("siteId");

-- CreateIndex
CREATE INDEX "site_links_dsoConnectionId_idx" ON "site_links"("dsoConnectionId");

-- CreateIndex
CREATE INDEX "site_links_enabled_idx" ON "site_links"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "site_links_siteId_dsoConnectionId_dsoSiteRef_key" ON "site_links"("siteId", "dsoConnectionId", "dsoSiteRef");

-- CreateIndex
CREATE INDEX "energy_snapshots_siteLinkId_idx" ON "energy_snapshots"("siteLinkId");

-- CreateIndex
CREATE INDEX "energy_snapshots_timestamp_idx" ON "energy_snapshots"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "dso_optimization_logs_dsoSiteRef_time_idx" ON "dso_optimization_logs"("dsoSiteRef", "time" DESC);

-- CreateIndex
CREATE INDEX "dso_optimization_logs_time_idx" ON "dso_optimization_logs"("time" DESC);

-- AddForeignKey
ALTER TABLE "site_links" ADD CONSTRAINT "site_links_dsoConnectionId_fkey" FOREIGN KEY ("dsoConnectionId") REFERENCES "dso_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_snapshots" ADD CONSTRAINT "energy_snapshots_siteLinkId_fkey" FOREIGN KEY ("siteLinkId") REFERENCES "site_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
