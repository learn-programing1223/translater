import Dexie, { Table } from 'dexie';
import { Product } from '@/types';

export class CatalogDatabase extends Dexie {
  products!: Table<Product>;

  constructor() {
    super('ScanSpeakCatalog');
    this.version(1).stores({
      products: '++id, barcode, name, category, brand, [category+brand]',
    });
  }
}

export const db = new CatalogDatabase();