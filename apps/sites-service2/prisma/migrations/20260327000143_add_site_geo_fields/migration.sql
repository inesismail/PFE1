-- CreateTable
CREATE TABLE "cpo_connections" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "authUrl" TEXT,
    "authType" TEXT NOT NULL,
    "tenant" TEXT,
    "email" TEXT,
    "encryptedPassword" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "fetchIntervalMinutes" INTEGER NOT NULL DEFAULT 30,
    "fetchEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastFetchAt" TIMESTAMP(3),
    "nextFetchAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cpo_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'EDF',
    "apiEndpoint" TEXT,
    "datasetId" TEXT,
    "apiKey" TEXT,
    "country" TEXT NOT NULL DEFAULT 'France',
    "countryCode" TEXT NOT NULL DEFAULT 'FR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "cpoConnectionId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "department" TEXT,
    "cpoRegion" TEXT,
    "regionId" TEXT,
    "maxCapacityKw" DOUBLE PRECISION,
    "currentLimitKw" DOUBLE PRECISION,
    "reducedLimitKw" DOUBLE PRECISION,
    "manualOverrideLimitKw" DOUBLE PRECISION,
    "manualOverrideUntil" TIMESTAMP(3),
    "manualOverrideReason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSignalValue" INTEGER,
    "lastSignalAt" TIMESTAMP(3),
    "lastLimitSetAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charging_stations" (
    "id" TEXT NOT NULL,
    "cpoConnectionId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "siteId" TEXT,
    "chargePointId" TEXT,
    "vendor" TEXT,
    "model" TEXT,
    "firmwareVersion" TEXT,
    "ocppVersion" TEXT,
    "status" TEXT,
    "lastStatusAt" TIMESTAMP(3),
    "maxPowerKw" DOUBLE PRECISION,
    "connectorsCount" INTEGER NOT NULL DEFAULT 0,
    "connectorsJson" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charging_stations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cpo_connections_actorId_key" ON "cpo_connections"("actorId");

-- CreateIndex
CREATE INDEX "cpo_connections_actorId_idx" ON "cpo_connections"("actorId");

-- CreateIndex
CREATE INDEX "cpo_connections_isConnected_idx" ON "cpo_connections"("isConnected");

-- CreateIndex
CREATE INDEX "cpo_connections_fetchEnabled_idx" ON "cpo_connections"("fetchEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- CreateIndex
CREATE INDEX "regions_code_idx" ON "regions"("code");

-- CreateIndex
CREATE INDEX "regions_isActive_idx" ON "regions"("isActive");

-- CreateIndex
CREATE INDEX "regions_provider_idx" ON "regions"("provider");

-- CreateIndex
CREATE INDEX "regions_countryCode_idx" ON "regions"("countryCode");

-- CreateIndex
CREATE INDEX "sites_cpoConnectionId_idx" ON "sites"("cpoConnectionId");

-- CreateIndex
CREATE INDEX "sites_regionId_idx" ON "sites"("regionId");

-- CreateIndex
CREATE INDEX "sites_isActive_idx" ON "sites"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "sites_cpoConnectionId_externalId_key" ON "sites"("cpoConnectionId", "externalId");

-- CreateIndex
CREATE INDEX "charging_stations_cpoConnectionId_idx" ON "charging_stations"("cpoConnectionId");

-- CreateIndex
CREATE INDEX "charging_stations_siteId_idx" ON "charging_stations"("siteId");

-- CreateIndex
CREATE INDEX "charging_stations_status_idx" ON "charging_stations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "charging_stations_cpoConnectionId_externalId_key" ON "charging_stations"("cpoConnectionId", "externalId");

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_cpoConnectionId_fkey" FOREIGN KEY ("cpoConnectionId") REFERENCES "cpo_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_stations" ADD CONSTRAINT "charging_stations_cpoConnectionId_fkey" FOREIGN KEY ("cpoConnectionId") REFERENCES "cpo_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_stations" ADD CONSTRAINT "charging_stations_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
