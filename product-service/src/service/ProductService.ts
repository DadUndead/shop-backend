import productsListMock from '../mocks/productsList.mock.json'
import {Product} from "../model/types";
import asyncAction from "../mocks/mockAsyncAction";

export default class ProductService {
  constructor() {
  }

  async getProductsList(): Promise<Product[]> {
    return asyncAction(productsListMock)
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return asyncAction(productsListMock.find(item => item.id===id))
  }
}