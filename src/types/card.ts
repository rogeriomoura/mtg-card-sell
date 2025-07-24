export interface Card {
  name: string;
  set: string;
  setCode?: string;
  rarity?: string;
  condition?: string;
  foil?: boolean;
  quantity?: number;
  collectorNumber?: string;
}

export interface BuyListEntry {
  name: string;
  set: string;
  setCode?: string;
  buyPrice: number;
  condition?: string;
  foil?: boolean;
  stock?: number;
  url?: string;
}

export interface SellableCard extends Card {
  buyPrice: number;
  estimatedValue: number;
  source: string;
}
