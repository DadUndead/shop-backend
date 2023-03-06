export interface CreateProductParams {
  title: string;
  price: number;
  description: string;
  image_url: string;
  count: number;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  image_url: string;
  count: number;
}

export type ProductsList = Product[]
