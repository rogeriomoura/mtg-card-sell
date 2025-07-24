import { readCSV } from './utils/csvReader';
import { CardComparer } from './services/cardComparer';

async function main() {
  console.log('MTG Card Sell Helper - Starting...');

  // TODO: Add command line argument parsing for CSV file path
  const csvFilePath = process.argv[2];

  if (!csvFilePath) {
    console.error('Please provide a CSV file path as an argument');
    console.log('Usage: pnpm run dev <path-to-csv>');
    process.exit(1);
  }

  try {
    console.log(`Reading CSV file: ${csvFilePath}`);
    const cards = await readCSV(csvFilePath);
    console.log(`Found ${cards.length} cards in collection`);

    const comparer = new CardComparer();
    await comparer.findSellableCards(cards);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
