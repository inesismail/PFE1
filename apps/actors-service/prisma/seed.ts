import "dotenv/config";
import { Pool } from "pg";

const dbUrl = process.env.DATABASE_URL || '';
const schemaMatch = dbUrl.match(/schema=([^&]+)/);
const schema = schemaMatch ? schemaMatch[1] : 'actors';
const pool = new Pool({ connectionString: dbUrl, options: `-c search_path=${schema}` });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg(pool, { schema });
const prisma = new PrismaClient({ adapter });
async function main() {
  // Actor Types (ajoute/enlève selon ton monolithe)
  const actorTypes = [
    { code: "CPO", name: "CPO", description: "Charge Point Operator" },
    { code: "DSO", name: "DSO", description: "Distribution System Operator" },
    { code: "EMSP", name: "EMSP", description: "E-Mobility Service Provider" },
    { code: "TSO", name: "TSO", description: "Transmission System Operator" },
    { code: "PROVIDER", name: "Provider", description: "Generic Provider" },
  ];

  for (const at of actorTypes) {
    await prisma.actorType.upsert({
      where: { code: at.code },
      update: { name: at.name, description: at.description },
      create: at,
    });
  }

  // Implementation Types
  const implTypes = [
    { code: "NETWORK_SIGNAL", name: "Network Signal", description: "Network signals ingestion" },
    { code: "PRICING_FEED", name: "Pricing Feed", description: "Pricing data ingestion" },
    { code: "ENERGY_LIMITS", name: "Energy Limits", description: "Set limits / flexibility actions" },
  ];

  for (const it of implTypes) {
    await prisma.implementationType.upsert({
      where: { code: it.code },
      update: { name: it.name, description: it.description },
      create: it,
    });
  }

  const networkType = await prisma.implementationType.findUniqueOrThrow({ where: { code: "NETWORK_SIGNAL" } });
  const pricingType = await prisma.implementationType.findUniqueOrThrow({ where: { code: "PRICING_FEED" } });
  const limitsType = await prisma.implementationType.findUniqueOrThrow({ where: { code: "ENERGY_LIMITS" } });

  // Implementations (plugins disponibles)
  const implementations = [
    {
      implementationTypeId: networkType.id,
      code: "edf-signal-v1",
      name: "EDF Signal V1",
      version: "1.0.0",
      handlerClass: "EdfSignalPlugin",
      defaultConfig: {},
      isActive: true,
    },
    {
      implementationTypeId: pricingType.id,
      code: "tariff-v1",
      name: "Tariff Feed V1",
      version: "1.0.0",
      handlerClass: "TariffPlugin",
      defaultConfig: {},
      isActive: true,
    },
    {
      implementationTypeId: limitsType.id,
      code: "wattzhub-limits-v1",
      name: "WattzHub Limits V1",
      version: "1.0.0",
      handlerClass: "WattzHubLimitsPlugin",
      defaultConfig: {},
      isActive: true,
    },
  ];

  for (const impl of implementations) {
    await prisma.implementation.upsert({
      where: { code: impl.code },
      update: {
        name: impl.name,
        version: impl.version,
        handlerClass: impl.handlerClass,
        defaultConfig: impl.defaultConfig,
        isActive: impl.isActive,
        implementationTypeId: impl.implementationTypeId,
      },
      create: impl,
    });
  }

  console.log("✅ Seed actors-service terminé");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });