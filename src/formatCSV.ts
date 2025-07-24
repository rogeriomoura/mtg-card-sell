import { CSVFormatter } from './utils/csvFormatter.js';

async function main() {
  console.log('MTG CSV Formatter - Starting...');

  const inputFile = process.argv[2];
  const outputFile = process.argv[3];

  if (!inputFile || !outputFile) {
    console.error('Please provide input and output CSV file paths as arguments');
    console.log('Usage: pnpm run format-csv <input-csv> <output-csv>');
    console.log('Example: pnpm run format-csv sample-collection.csv formatted-collection.csv');
    process.exit(1);
  }

  try {
    const formatter = new CSVFormatter();
    await formatter.formatCSV(inputFile, outputFile);
    console.log('CSV formatting completed successfully!');
  } catch (error) {
    console.error('Error formatting CSV:', error);
    process.exit(1);
  }
}

main();
