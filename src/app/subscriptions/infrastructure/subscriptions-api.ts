import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Plan} from '../domain/model/plan.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {PlansApiEndpoint} from './plans-api-endpoint';
import {SubscriptionsApiEndpoint} from './subscriptions-api-endpoint';
import {CreateSubscriptionRequest} from './subscriptions-response';

/**
 * Facade of the Subscriptions bounded context over the DoofPlus Platform.
 */
@Injectable({providedIn: 'root'})
export class SubscriptionsApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly plansEndpoint = new PlansApiEndpoint(this.http);
  private readonly subscriptionsEndpoint = new SubscriptionsApiEndpoint(this.http);

  /** Gets the plans. */
  getPlans = (): Observable<Plan[]> => this.plansEndpoint.getAll();

  /** Gets the subscriptions of an organization. */
  getSubscriptionsByOrganization = (organizationId: number): Observable<Subscription[]> =>
    this.subscriptionsEndpoint.getByOrganization(organizationId);

  /** Creates a pending subscription. */
  createSubscription = (request: CreateSubscriptionRequest): Observable<Subscription> =>
    this.subscriptionsEndpoint.createForOrganization(request);

  /** Changes the plan and the billing cycle of a subscription. */
  changePlan = (id: number, planId: number, billingCycle: string): Observable<Subscription> =>
    this.subscriptionsEndpoint.changePlan(id, planId, billingCycle);

  /** Pays the next billing period with Niubiz. */
  paySubscription = (id: number, cardToken: string): Observable<Subscription> =>
    this.subscriptionsEndpoint.pay(id, cardToken);
}
