import { closeDb } from "./index";
import { seedDemoListings } from "./seed";

try {
  const count = await seedDemoListings();
  console.log(`Seeded ${count} demo listings (existing IDs were left untouched).`);
} finally {
  await closeDb();
}
