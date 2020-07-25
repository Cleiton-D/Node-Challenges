import { getCustomRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(transaction_id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const transaction = await transactionRepository.findOne(transaction_id);
    if (!transaction) {
      throw new AppError('Transaction not exist.');
    }

    await transactionRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
