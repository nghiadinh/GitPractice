import { Category, Item } from "../types/models";

const CATEGORY_KEY = "storage-management-categories";
const ITEM_KEY = "storage-management-items";

const delay = async (ms = 250) =>
  await new Promise((resolve) => setTimeout(resolve, ms));

const seedCategories: Category[] = [
  {
    id: crypto.randomUUID(),
    name: "Electronics",
    description: "Devices and accessories",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Office",
    description: "Daily office supplies",
    createdAt: new Date().toISOString(),
  },
];

const seedItems = (categories: Category[]): Item[] => [
  {
    id: crypto.randomUUID(),
    name: "Wireless Mouse",
    sku: "MS-001",
    quantity: 35,
    categoryId: categories[0]?.id ?? "",
    location: "Aisle A-2",
    note: "Rechargeable model",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "A4 Paper",
    sku: "OF-101",
    quantity: 120,
    categoryId: categories[1]?.id ?? "",
    location: "Aisle B-1",
    note: "80gsm",
    createdAt: new Date().toISOString(),
  },
];

const parseJson = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const loadCategories = (): Category[] => {
  const current = parseJson<Category[]>(localStorage.getItem(CATEGORY_KEY), []);
  if (current.length > 0) return current;

  localStorage.setItem(CATEGORY_KEY, JSON.stringify(seedCategories));
  return seedCategories;
};

const loadItems = (categories: Category[]): Item[] => {
  const current = parseJson<Item[]>(localStorage.getItem(ITEM_KEY), []);
  if (current.length > 0) return current;

  const seeded = seedItems(categories);
  localStorage.setItem(ITEM_KEY, JSON.stringify(seeded));
  return seeded;
};

const saveCategories = (categories: Category[]) => {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
};

const saveItems = (items: Item[]) => {
  localStorage.setItem(ITEM_KEY, JSON.stringify(items));
};

export const storageService = {
  async getCategories(): Promise<Category[]> {
    await delay();
    return loadCategories();
  },

  async createCategory(payload: Pick<Category, "name" | "description">): Promise<Category> {
    await delay();
    const categories = loadCategories();
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      description: payload.description.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [newCategory, ...categories];
    saveCategories(next);
    return newCategory;
  },

  async updateCategory(id: string, payload: Pick<Category, "name" | "description">): Promise<Category> {
    await delay();
    const categories = loadCategories();
    const target = categories.find((c) => c.id === id);
    if (!target) {
      throw new Error("Category not found");
    }

    const updated: Category = {
      ...target,
      name: payload.name.trim(),
      description: payload.description.trim(),
    };

    const next = categories.map((category) =>
      category.id === id ? updated : category
    );
    saveCategories(next);
    return updated;
  },

  async deleteCategory(id: string): Promise<void> {
    await delay();
    const categories = loadCategories().filter((category) => category.id !== id);
    saveCategories(categories);

    const items = loadItems(categories).filter((item) => item.categoryId !== id);
    saveItems(items);
  },

  async getItems(): Promise<Item[]> {
    await delay();
    const categories = loadCategories();
    return loadItems(categories);
  },

  async createItem(
    payload: Pick<Item, "name" | "sku" | "quantity" | "categoryId" | "location" | "note">
  ): Promise<Item> {
    await delay();
    const items = loadItems(loadCategories());
    const newItem: Item = {
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      sku: payload.sku.trim(),
      quantity: payload.quantity,
      categoryId: payload.categoryId,
      location: payload.location.trim(),
      note: payload.note.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [newItem, ...items];
    saveItems(next);
    return newItem;
  },

  async updateItem(
    id: string,
    payload: Pick<Item, "name" | "sku" | "quantity" | "categoryId" | "location" | "note">
  ): Promise<Item> {
    await delay();
    const items = loadItems(loadCategories());
    const target = items.find((item) => item.id === id);

    if (!target) {
      throw new Error("Item not found");
    }

    const updated: Item = {
      ...target,
      name: payload.name.trim(),
      sku: payload.sku.trim(),
      quantity: payload.quantity,
      categoryId: payload.categoryId,
      location: payload.location.trim(),
      note: payload.note.trim(),
    };

    const next = items.map((item) => (item.id === id ? updated : item));
    saveItems(next);
    return updated;
  },

  async deleteItem(id: string): Promise<void> {
    await delay();
    const items = loadItems(loadCategories()).filter((item) => item.id !== id);
    saveItems(items);
  },
};
