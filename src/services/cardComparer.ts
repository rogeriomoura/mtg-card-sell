import axios from 'axios';
import { Card, BuyListEntry, SellableCard } from '../types/card';

export class CardComparer {
  private buyListCache: Map<string, BuyListEntry[]> = new Map();

  async findSellableCards(cards: Card[]): Promise<SellableCard[]> {
    console.log('Fetching buy list data...');

    const sellableCards: SellableCard[] = [];

    for (const card of cards) {
      try {
        const buyListEntries = await this.getBuyListForCard(card);

        if (buyListEntries.length > 0) {
          const bestBuyPrice = Math.max(...buyListEntries.map(entry => entry.buyPrice));
          const bestEntry = buyListEntries.find(entry => entry.buyPrice === bestBuyPrice);

          if (bestEntry && bestEntry.buyPrice > 0) {
            const sellableCard: SellableCard = {
              ...card,
              buyPrice: bestEntry.buyPrice,
              estimatedValue: bestEntry.buyPrice * (card.quantity || 1),
              source: 'Scryfall', // TODO: Make this dynamic based on actual source
            };

            sellableCards.push(sellableCard);
            console.log(`📈 ${card.name} (${card.set}) - Buy price: $${bestEntry.buyPrice}`);
          }
        }
      } catch (error) {
        console.error(`Error checking ${card.name}:`, error);
      }

      // Add delay to avoid rate limiting
      await this.delay(100);
    }

    console.log(
      `\n🎯 Found ${sellableCards.length} sellable cards with total estimated value: $${sellableCards.reduce((sum, card) => sum + card.estimatedValue, 0).toFixed(2)}`
    );

    // Sort by estimated value descending
    sellableCards.sort((a, b) => b.estimatedValue - a.estimatedValue);

    return sellableCards;
  }

  private async getBuyListForCard(card: Card): Promise<BuyListEntry[]> {
    const cacheKey = `${card.name}-${card.set}`;

    if (this.buyListCache.has(cacheKey)) {
      return this.buyListCache.get(cacheKey)!;
    }

    try {
      // Using Scryfall API as a starting point - you may want to integrate with actual buy list APIs
      const response = await axios.get(`https://api.scryfall.com/cards/search`, {
        params: {
          q: `!"${card.name}" set:${card.setCode || card.set}`,
          unique: 'prints',
        },
      });

      const buyListEntries: BuyListEntry[] = [];

      if (response.data && response.data.data) {
        for (const scryfallCard of response.data.data) {
          // This is a placeholder - you'll need to integrate with actual buy list APIs
          // For now, using USD price as a rough estimate
          const price = scryfallCard.prices?.usd || scryfallCard.prices?.usd_foil;

          if (price && parseFloat(price) > 0) {
            const entry: BuyListEntry = {
              name: scryfallCard.name,
              set: scryfallCard.set_name,
              setCode: scryfallCard.set,
              buyPrice: parseFloat(price) * 0.6, // Rough estimate: buy lists typically pay 60% of market value
              foil: scryfallCard.foil || false,
            };

            buyListEntries.push(entry);
          }
        }
      }

      this.buyListCache.set(cacheKey, buyListEntries);
      return buyListEntries;
    } catch (error) {
      console.error(`Failed to fetch data for ${card.name}:`, error);
      return [];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
