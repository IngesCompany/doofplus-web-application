import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Subscription} from '../domain/model/subscription.entity';
import {Invoice} from '../domain/model/invoice.entity';
import {SubscriptionResource, SubscriptionsResponse} from './subscriptions-response';

/**
 * The platform says REJECTED; the views of the Web Application say declined.
 * @param status - Status sent by the platform.
 * @returns Status used by the views.
 */
const toViewState = (status: string): string => status === 'REJECTED' ? 'declined' : status.toLowerCase();

/**
 * Maps subscription entities to and from the resources of the DoofPlus Platform.
 */
export class SubscriptionAssembler implements BaseAssembler<Subscription, SubscriptionResource, SubscriptionsResponse> {
  /**
   * Converts a subscriptions response to entities.
   * @param response - The subscriptions response.
   * @returns The subscriptions.
   */
  toEntitiesFromResponse = (response: SubscriptionsResponse): Subscription[] =>
    response.subscriptions.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a subscription resource to an entity; its payments become its invoices.
   * @param resource - The subscription resource.
   * @returns The subscription.
   */
  toEntityFromResource = (resource: SubscriptionResource): Subscription => {
    const payments = resource.payments ?? [];
    const last = payments[payments.length - 1];
    return new Subscription({
      id: resource.id,
      organizationId: resource.organizationId,
      planId: resource.planId,
      planKey: '',
      billingCycle: resource.billingCycle.toLowerCase(),
      status: resource.status.toLowerCase(),
      paymentState: last ? toViewState(last.status) : 'pending',
      nextInvoiceDate: resource.currentPeriodEnd ?? '',
      autoRenew: resource.autoRenew,
      cardBrand: resource.cardBrand,
      cardLast4: resource.cardLast4,
      cardExpiry: resource.cardExpiry,
      billingEmail: resource.billingEmail,
      invoices: payments.map(payment => new Invoice({
        id: payment.id,
        subscriptionId: resource.id,
        number: payment.invoiceNumber,
        issuedAt: (payment.processedAt ?? '').slice(0, 10),
        amount: payment.amount,
        status: toViewState(payment.status)
      }))
    });
  };

  /**
   * Converts a subscription entity to a resource.
   * @param entity - The subscription.
   * @returns The subscription resource.
   */
  toResourceFromEntity = (entity: Subscription): SubscriptionResource =>
    ({
      id: entity.id,
      organizationId: entity.organizationId,
      planId: entity.planId,
      billingCycle: entity.billingCycle.toUpperCase(),
      status: entity.status.toUpperCase(),
      autoRenew: entity.autoRenew,
      cardBrand: entity.cardBrand,
      cardLast4: entity.cardLast4,
      cardExpiry: entity.cardExpiry,
      billingEmail: entity.billingEmail
    } as SubscriptionResource);
}
