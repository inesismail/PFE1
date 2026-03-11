-- CreateTable
CREATE TABLE "actor_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actor_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actors" (
    "id" TEXT NOT NULL,
    "actorTypeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "implementation_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "configSchema" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "implementation_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "implementations" (
    "id" TEXT NOT NULL,
    "implementationTypeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "handlerClass" TEXT NOT NULL,
    "defaultConfig" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "implementations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actor_implementations" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "implementationId" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "enabledAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actor_implementations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "actor_types_code_key" ON "actor_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "actors_code_key" ON "actors"("code");

-- CreateIndex
CREATE INDEX "actors_actorTypeId_idx" ON "actors"("actorTypeId");

-- CreateIndex
CREATE INDEX "actors_isActive_idx" ON "actors"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "implementation_types_code_key" ON "implementation_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "implementations_code_key" ON "implementations"("code");

-- CreateIndex
CREATE INDEX "implementations_implementationTypeId_idx" ON "implementations"("implementationTypeId");

-- CreateIndex
CREATE INDEX "implementations_isActive_idx" ON "implementations"("isActive");

-- CreateIndex
CREATE INDEX "actor_implementations_actorId_idx" ON "actor_implementations"("actorId");

-- CreateIndex
CREATE INDEX "actor_implementations_implementationId_idx" ON "actor_implementations"("implementationId");

-- CreateIndex
CREATE INDEX "actor_implementations_isEnabled_idx" ON "actor_implementations"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "actor_implementations_actorId_implementationId_key" ON "actor_implementations"("actorId", "implementationId");

-- AddForeignKey
ALTER TABLE "actors" ADD CONSTRAINT "actors_actorTypeId_fkey" FOREIGN KEY ("actorTypeId") REFERENCES "actor_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "implementations" ADD CONSTRAINT "implementations_implementationTypeId_fkey" FOREIGN KEY ("implementationTypeId") REFERENCES "implementation_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actor_implementations" ADD CONSTRAINT "actor_implementations_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "actors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actor_implementations" ADD CONSTRAINT "actor_implementations_implementationId_fkey" FOREIGN KEY ("implementationId") REFERENCES "implementations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
