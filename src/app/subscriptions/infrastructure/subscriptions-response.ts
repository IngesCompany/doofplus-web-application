import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Resource representation of a payment of a subscription, shown as an invoice.
 */
export interface PaymentResource {
  /** Unique identifier of the payment. */
  id: number;
  /** Invoice number, for example INV-1-1. */
  invoiceNumber: string;
  /** Amount charged. */
  amount: number;
  /** ISO 4217 currency. */
  currency: string;
  /** Transaction identifier returned by Niubiz. */
  gatewayTransactionId: string | null;
  /** PENDING, APPROVED or REJECTED. */
  status: string;
  /** Date and time when the gateway processed the payment. */
  processedAt: string | null;
}

/**
 * Resource representation of a subscription, as the DoofPlus Platform sends it.
 */
export interface SubscriptionResource extends BaseResource {
  /** Unique identifier of the subscription. */
  id: number;
  /** Identifier of the subscribed organization. */
  organizationId: number;
  /** Identifier of the plan. */
  planId: number;
  /** MONTHLY or ANNUAL. */
  billingCycle: string;
  /** PENDING, ACTIVE or CANCELLED. */
  status: string;
  /** Whether the subscription renews automatically. */
  autoRenew: boolean;
  /** Card brand. */
  cardBrand: string;
  /** Last four digits of the card. */
  cardLast4: string;
  /** Card expiry (MM/YYYY). */
  cardExpiry: string;
  /** Email that receives the invoices. */
  billingEmail: string;
  /** Start of the paid period, or null while pending. */
  currentPeriodStart: string | null;
  /** End of the paid period, or null while pending. */
  currentPeriodEnd: string | null;
  /** Payments of the subscription. */
  payments: PaymentResource[];
}

/**
 * Request sent to create a subscription.
 */
export interface CreateSubscriptionRequest {
  organizationId: number;
  planId: number;
  billingCycle: string;
  cardBrand: string;
  cardLast4: string;
  cardExpiry: string;
  billingEmail: string;
}

/**
 * Response wrapper for a subscriptions collection.
 */
export interface SubscriptionsResponse extends BaseResponse {
  /** Subscription records returned by the API. */
  subscriptions: SubscriptionResource[];
}
