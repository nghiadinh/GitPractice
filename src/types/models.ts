export type AppUser = {
  username: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
};

export type Item = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  categoryId: string;
  location: string;
  note: string;
  createdAt: string;
};
