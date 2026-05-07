declare module "midtrans-client" {
  export interface SnapConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  export interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface ItemDetail {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }

  export interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }

  export interface CreditCard {
    secure?: boolean;
  }

  export interface CreateTransactionParameter {
    transaction_details: TransactionDetails;
    item_details?: ItemDetail[];
    customer_details?: CustomerDetails;
    credit_card?: CreditCard;
    callbacks?: {
      finish?: string;
    };
  }

  export interface TransactionResponse {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(config: SnapConfig);
    createTransaction(
      parameter: CreateTransactionParameter,
    ): Promise<TransactionResponse>;
  }

  export class CoreApi {
    constructor(config: SnapConfig);
  }
}
