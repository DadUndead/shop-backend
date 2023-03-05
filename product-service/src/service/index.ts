import db from 'pg';
import ProductService from "./ProductService";
import {logger} from "../utils/logger";

const dbClient = new db.Client();
dbClient.connect()
    .then(() => {
      logger.logRequest('Database connected')
    })
    .catch(() => {
      logger.logRequest('Database connection failed!')
    });

const productsService = new ProductService(dbClient);
export default productsService