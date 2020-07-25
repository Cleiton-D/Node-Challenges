import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository') private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({
    customer_id,
    products: requestProducts,
  }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('User does not exists.');
    }

    const productsForGetPrices = await this.productsRepository.findAllById(
      requestProducts,
    );

    const products = requestProducts.map(requestProduct => {
      const product = productsForGetPrices.find(
        prod => prod.id === requestProduct.id,
      );
      if (!product) {
        throw new AppError('Invalid Product.');
      }

      product.quantity -= requestProduct.quantity;
      if (product.quantity < 0) {
        throw new AppError('Insufficient quantity');
      }

      return {
        product_id: requestProduct.id,
        quantity: requestProduct.quantity,
        price: product.price,
        product,
      };
    });

    const order = await this.ordersRepository.create({ customer, products });
    return order;
  }
}

export default CreateOrderService;
