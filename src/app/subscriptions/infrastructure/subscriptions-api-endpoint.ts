import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Subscription} from '../domain/model/subscription.entity';
import {CreateSubscriptionRequest, SubscriptionResource, SubscriptionsResponse} from './subscriptions-response';
import {SubscriptionAssembler} from './subscription-assembler';

/**
 * Endpoint client for subscription CRUD operations.
 */
export class SubscriptionsApiEndpoint extends BaseApiEndpoint<Subscription, SubscriptionResource, SubscriptionsResponse, SubscriptionAssembler> {
  /**
   * Creates an instance of SubscriptionsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderSubscriptionsEndpointPath}`, new SubscriptionAssembler());
  }

  /**
   * Gets the subscriptions of an organization.
   * @param organizationId - Identifier of the organization.
   * @returns The subscriptions.
   */
  getByOrganization(organizationId: number): Observable<Subscription[]> {
    return this.http.get<SubscriptionResource[]>(this.endpointUrl, {params: {organizationId}}).pipe(
      map(resources => resources.map(resource => this.assembler.toEntityFromResource(resource))),
      catchError(this.handleError('Failed to fetch subscriptions'))
    );
  }

  /**
   * Creates a pending subscription.
   * @param request - Organization, plan, billing cycle and card.
   * @returns The created subscription.
   */
  createForOrganization(request: CreateSubscriptionRequest): Observable<Subscription> {
    return this.http.post<SubscriptionResource>(this.endpointUrl, request).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.problemDetail('Failed to create the subscription'))
    );
  }

  /**
   * Changes the plan and the billing cycle of a subscription.
   * @param id - Identifier of the subscription.
   * @param planId - Identifier of the new plan.
   * @param billingCycle - MONTHLY or ANNUAL.
   * @returns The updated subscription.
   */
  changePlan(id: number, planId: number, billingCycle: string): Observable<Subscription> {
    return this.http.put<SubscriptionResource>(`${this.endpointUrl}/${id}/plan`, {planId, billingCycle}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.problemDetail('Failed to change the plan'))
    );
  }

  /**
   * Pays the next billing period with Niubiz.
   * @param id - Identifier of the subscription.
   * @param cardToken - Token of the card.
   * @returns The subscription with the new payment.
   */
  pay(id: number, cardToken: string): Observable<Subscription> {
    return this.http.post<SubscriptionResource>(`${this.endpointUrl}/${id}/payments`, {cardToken}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.problemDetail('Failed to register the payment'))
    );
  }

  /**
   * Uses the detail of the ProblemDetail sent by the platform (400, 404, 409, 422, 503).
   * @param fallback - Message used when the platform sends no detail.
   * @returns The error handler.
   */
  private problemDetail(fallback: string) {
    return (error: HttpErrorResponse): Observable<never> =>
      throwError(() => new Error(error.error?.detail ?? `${fallback} (${error.status})`));
  }
}
