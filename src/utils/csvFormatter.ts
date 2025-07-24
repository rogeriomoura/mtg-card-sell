import { createReadStream, createWriteStream } from 'fs';
import csv from 'csv-parser';

interface RawCardData {
  [key: string]: string;
}

interface FormattedCard {
  cardName: string;
  edition: string;
  foil: string;
  quantity: string;
}

export class CSVFormatter {
  private normalizeBoolean(value: string): string {
    const normalized = value.toLowerCase().trim();
    if (
      normalized === '1' ||
      normalized === 'true' ||
      normalized === 'yes' ||
      normalized === 'foil'
    ) {
      return 'true';
    }
    return 'false';
  }

  private findColumnValue(row: RawCardData, possibleNames: string[]): string {
    for (const name of possibleNames) {
      const lowerName = name.toLowerCase();
      for (const [key, value] of Object.entries(row)) {
        if (key.toLowerCase() === lowerName) {
          return value.trim();
        }
      }
    }
    return '';
  }

  private isBasicLand(cardName: string): boolean {
    const basicLands = ['swamp', 'mountain', 'plains', 'island', 'forest'];
    return basicLands.includes(cardName.toLowerCase().trim());
  }

  private isTokenSet(setName: string): boolean {
    return setName.toLowerCase().includes('tokens');
  }

  private normalizeSpecialCharacters(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private formatCardName(cardName: string, setName: string, collectorNumber: string): string {
    // Handle double-faced cards - only use the first name
    let name = cardName.includes(' // ') ? cardName.split(' // ')[0] : cardName;

    // Normalize special characters
    name = this.normalizeSpecialCharacters(name);

    if (setName.toLowerCase().trim() === 'breaking news') {
      const paddedNumber = collectorNumber.padStart(4, '0');
      return `${name} (${paddedNumber} - Showcase)`;
    }

    if (setName.toLowerCase().trim() === 'wilds of eldraine: enchanting tales') {
      const paddedNumber = collectorNumber.padStart(4, '0');
      return `${name} (${paddedNumber})`;
    }

    return name;
  }

  private normalizeSetName(setName: string): string {
    const normalized = setName.toLowerCase().trim();
    if (normalized === 'fallout') {
      return 'Universes Beyond: Fallout';
    }
    if (normalized === "assassin's creed") {
      return "Universes Beyond: Assassin's Creed";
    }
    if (normalized === 'breaking news') {
      return 'Outlaws of Thunder Junction Breaking News';
    }
    if (normalized === 'commander 2011') {
      return 'Commander';
    }
    if (normalized === 'wilds of eldraine: enchanting tales') {
      return 'Wilds of Eldraine Enchanting Tales';
    }
    if (normalized === 'midnight hunt commander') {
      return 'Innistrad: Midnight Hunt Commander Decks';
    }
    if (normalized.endsWith('commander') && !normalized.endsWith('commander decks')) {
      return setName + ' Decks';
    }
    return setName;
  }

  private formatCard(row: RawCardData): FormattedCard | null {
    const cardName = this.findColumnValue(row, ['Card Name', 'card name', 'name', 'Name']);

    if (this.isBasicLand(cardName)) {
      return null;
    }

    const edition = this.findColumnValue(row, [
      'Set Name',
      'Edition',
      'Set',
      'set name',
      'edition',
      'set',
    ]);

    if (this.isTokenSet(edition)) {
      return null;
    }

    const collectorNumber = this.findColumnValue(row, [
      'Collector number',
      'collector number',
      'collector_number',
      'number',
    ]);
    const foilValue = this.findColumnValue(row, ['Foil', 'foil', 'is_foil']);
    const quantityValue = this.findColumnValue(row, ['Quantity', 'quantity', 'qty', 'Qty']);

    const formattedCardName = this.formatCardName(cardName, edition, collectorNumber);

    return {
      cardName: formattedCardName,
      edition: this.normalizeSetName(edition),
      foil: this.normalizeBoolean(foilValue),
      quantity: quantityValue || '1',
    };
  }

  async formatCSV(inputPath: string, outputPath: string): Promise<void> {
    const cards: FormattedCard[] = [];

    return new Promise((resolve, reject) => {
      createReadStream(inputPath)
        .pipe(csv())
        .on('data', (row: RawCardData) => {
          const formattedCard = this.formatCard(row);
          if (formattedCard && formattedCard.cardName) {
            cards.push(formattedCard);
          }
        })
        .on('end', () => {
          this.writeFormattedCSV(cards, outputPath)
            .then(() => {
              console.log(`Formatted ${cards.length} cards and saved to ${outputPath}`);
              resolve();
            })
            .catch(reject);
        })
        .on('error', reject);
    });
  }

  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  private async writeFormattedCSV(cards: FormattedCard[], outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(outputPath);

      writeStream.write('card name,edition,foil,quantity\n');

      for (const card of cards) {
        const escapedCardName = this.escapeCsvField(card.cardName);
        const escapedEdition = this.escapeCsvField(card.edition);
        const line = `${escapedCardName},${escapedEdition},${card.foil},${card.quantity}\n`;
        writeStream.write(line);
      }

      writeStream.end();
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }
}
