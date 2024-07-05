// types.ts

export type Table = {
  table_name: string;
  title: string;
};

export type Product = {
  id: number;
  product_name: string;
  buy: boolean;
  note?: string | null;
};
