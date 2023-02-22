export interface Product {
    id: string,
    name: string,
    price: number,
    description: string,
    image_url: string,
    category: string,
}

export type ProductsList = Product[]