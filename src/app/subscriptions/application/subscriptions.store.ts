import {computed, inject, Injectable, signal} from '@angular/core';
import {SubscriptionsApi} from '../infrastructure/subscriptions-api';
import {Plan} from '../domain/model/plan.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {Invoice} from '../domain/model/invoice.entity';

/**
 * Holds the plans, the subscription of the current organization and its invoices.
 */
@Injectable({providedIn: 'root'})
export class SubscriptionsStore {
  private readonly subscriptionsApi = inject(SubscriptionsApi);

  private readonly plansSignal = signal<Plan[]>([]);
  private readonly subscriptionSignal = signal<Subscription | null>(null);
  private readonly invoicesSignal = signal<Invoice[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  /**
   * Plans offered by DoofPlus.
   */
  readonly plans = this.plansSignal.asReadonly();

  /**
   * Subscription of the current organization.
   */
  readonly subscription = this.subscriptionSignal.asReadonly();

  /**
   * Invoices of the subscription, newest first.
   */
  readonly invoices = computed(() => [...this.invoicesSignal()].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)));

  /**
   * Plan of the subscription.
   */
  readonly currentPlan = computed(() => this.plans().find(plan => plan.id === this.subscription()?.planId));

  /**
   * Amount charged per billing cycle.
   */
  readonly currentAmount = computed(() => {
    const plan = this.currentPlan();
    if (!plan) return 0;
    return this.subscription()?.billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  });

  /**
   * Whether data is loading.
   */
  readonly loading = this.loadingSignal.asReadonly();

  /**
   * Current error message, if any.
   */
  readonly error = this.errorSignal.asReadonly();

  /**
   * Creates the store and loads the plans, which are public.
   */
  constructor() {
    this.subscriptionsApi.getPlans().subscribe({
      next: plans => {
        this.plansSignal.set(plans);
        const subscription = this.subscriptionSignal();
        if (subscription) this.setSubscription(subscription);
      },
      error: err => this.errorSignal.set(this.formatError(err, 'Failed to load plans'))
    });
  }

  /**
   * Loads the subscription of an organization; its invoices come with it.
   * @param organizationId - Identifier of the organization.
   */
  loadForOrganization = (organizationId: number): void => {
    this.loadingSignal.set(true);
    this.subscriptionsApi.getSubscriptionsByOrganization(organizationId).subscribe({
      next: subscriptions => {
        const current = subscriptions.find(item => item.status === 'pending' || item.status === 'active')
          ?? subscriptions[0] ?? null;
        this.setSubscription(current);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load the subscription'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Creates the pending subscription of a newly registered organization.
   * @param organizationId - Identifier of the new organization.
   * @param planKey - Key of the selected plan.
   * @param billingCycle - Selected billing cycle.
   * @param billingEmail - Email of the administrator.
   */
  subscribe = (organizationId: number, planKey: string, billingCycle: string, billingEmail: string): void => {
    const plan = this.plans().find(item => item.key === planKey);
    if (!plan) {
      this.errorSignal.set('Plan not found');
      return;
    }
    // The registration does not ask for the card yet: test card of the Niubiz sandbox
    this.subscriptionsApi.createSubscription({
      organizationId, planId: plan.id, billingCycle: billingCycle.toUpperCase(),
      cardBrand: 'Visa', cardLast4: '4242', cardExpiry: '08/2028', billingEmail
    }).subscribe({
      next: subscription => this.setSubscription(subscription),
      error: err => this.errorSignal.set(this.formatError(err, 'Failed to create the subscription'))
    });
  };

  /**
   * Changes the plan or billing cycle of the subscription. Only administrators reach this action.
   * @param planKey - Key of the new plan.
   * @param billingCycle - New billing cycle.
   */
  changePlan = (planKey: string, billingCycle: string): void => {
    const subscription = this.subscription();
    const plan = this.plans().find(item => item.key === planKey);
    if (!subscription || !plan) return;
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.subscriptionsApi.changePlan(subscription.id, plan.id, billingCycle.toUpperCase()).subscribe({
      next: updated => {
        this.setSubscription(updated);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to change the plan'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Retries a declined charge with Niubiz: an approved payment activates or renews the subscription
   * and becomes a new invoice; a rejected or failed payment shows the reason sent by the platform.
   * @param cardToken - Token of the card returned by the Niubiz checkout.
   */
  retryPayment = (cardToken = 'sandbox-card-token'): void => {
    const subscription = this.subscription();
    if (!subscription) return;
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.subscriptionsApi.paySubscription(subscription.id, cardToken).subscribe({
      next: updated => {
        this.setSubscription(updated);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to register the payment'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Shows a subscription with the key of its plan and its invoices.
   * @param subscription - Subscription sent by the platform, or null when the organization has none.
   */
  private setSubscription(subscription: Subscription | null): void {
    if (subscription) subscription.planKey = this.plans().find(plan => plan.id === subscription.planId)?.key ?? '';
    this.subscriptionSignal.set(subscription);
    this.invoicesSignal.set(subscription?.invoices ?? []);
  }

  /**
   * Normalizes unknown errors into a display-friendly message.
   * @param error - Source error.
   * @param fallback - Default message when details are unavailable.
   * @returns Normalized message.
   */
  private formatError = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;
}
