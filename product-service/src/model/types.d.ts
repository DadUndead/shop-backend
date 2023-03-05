export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  image_url: string;
  count: number;
}

export type ProductsList = Product[]

export type CreateProductParams = Omit<Product, 'id'>