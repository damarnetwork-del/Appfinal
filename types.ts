// FIX: Define enums for transaction types and methods.
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionMethod {
  TRANSFER = 'TRANSFER',
  CASH = 'CASH',
}

// FIX: Define the Transaction interface.
export interface Transaction {
  id: string;
  date: string; // ISO string date
  description: string;
  amount: number;
  type: TransactionType;
  method: TransactionMethod;
}

// FIX: Define enums for subscription types.
export enum SubscriptionType {
  PPPOE = 'PPPOE',
  VOUCHER = 'VOUCHER',
  STATIK = 'STATIK',
  MITRA_VOUCHER = 'Mitra Voucher',
}

// FIX: Define the PaymentRecord interface for customer payment history.
export interface PaymentRecord {
    date: string; // ISO string date
    amount: number;
}
  
// FIX: Define the Customer interface.
export interface Customer {
    id: string;
    name: string;
    phone: string;
    subscriptionType: SubscriptionType;
    amount: number; // This is the monthly amount
    paymentHistory: PaymentRecord[];
    dueAmount: number; // Total outstanding amount
    lastBilledMonth: string; // Format "YYYY-MM"
}

// Added TelegramSettings interface for notification configuration
export interface TelegramSettings {
  enabled: boolean;
  botToken: string;
  chatId: string;
}
