import { EdfClient, EDF_REGIONS } from './src/edf/edf.client';

async function main() {
  const client = new EdfClient();

  for (const region of Object.keys(EDF_REGIONS)) {
    console.log(`\n--- ${region} ---`);
    const result = await client.fetchSignal(region);
    console.log(result);
  }
}

main().catch(console.error);
