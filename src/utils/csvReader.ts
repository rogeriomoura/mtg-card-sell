import fs from 'fs';
import csv from 'csv-parser';
import { Card } from '../types/card';

export function readCSV(filePath: string): Promise<Card[]> {
  return new Promise((resolve, reject) => {
    const cards: Card[] = [];

    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`));
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => {
        const card: Card = {
          name: row['Card Name'] || row['name'] || row['Name'],
          set: row['Set Name'] || row['set'] || row['Set'],
          setCode: row['Set Code'] || row['setCode'] || row['Code'],
          rarity: row['Rarity'] || row['rarity'],
          condition: row['Condition'] || row['condition'],
          foil: parseBooleanField(row['Foil'] || row['foil']),
          quantity: parseInt(row['Quantity'] || row['quantity'] || '1'),
          collectorNumber: row['Collector Number'] || row['collectorNumber'] || row['Number'],
        };

        if (card.name) {
          cards.push(card);
        }
      })
      .on('end', () => {
        console.log(`Successfully parsed ${cards.length} cards from CSV`);
        resolve(cards);
      })
      .on('error', error => {
        reject(error);
      });
  });
}

function parseBooleanField(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1';
  }
  return false;
}
