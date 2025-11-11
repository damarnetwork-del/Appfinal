
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionMethod {
  TRANSFER = 'TRANSFER',
  CASH = 'CASH',
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  method: TransactionMethod;
  date: string;
}
