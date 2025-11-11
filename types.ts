// existing content
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

// new content
export enum SubscriptionType {
  PPPOE = 'PPPoE',
  STATIC = 'Static',
  HOTSPOT = 'Hotspot',
  VOUCHER = 'Mitra Voucher',
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  subscriptionType: SubscriptionType;
  amount: number;
}
