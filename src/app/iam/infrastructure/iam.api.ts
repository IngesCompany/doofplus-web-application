import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, catchError, map, of, throwError} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {environment} from '../../../environments/environment';
import {User} from '../domain/model/user.entity';
import {RoleProfile} from '../domain/model/role-profile.entity';
import {Invitation} from '../domain/model/invitation.entity';
import {UsersApiEndpoint} from './users-api-endpoint';
import {RoleProfilesApiEndpoint} from './role-profiles-api-endpoint';
import {InvitationsApiEndpoint} from './invitations-api-endpoint';
import {AuthenticatedUserResource, UserResource} from './users-response';
import {UserAssembler} from './user-assembler';

/**
 * Outcome of a sign-in request to the DoofPlus Platform.
 * The platform answers 401 with the reason in the details of the problem: invalid-credentials,
 * two-factor-required (the password is right; send the code in a second request) or invalid-two-factor-code.
 */
export type SignInResult =
  | { status: 'signed-in'; user: User; token: string }
  | { status: 'two-factor-required' }
  | { status: 'invalid-credentials' }
  | { status: 'invalid-two-factor-code' };

/**
 * Infrastructure facade for the IAM endpoints: authentication, users, profiles and invitations.
 * Sign-in, sign-up and users use the DoofPlus Platform; profiles and invitations still use the fake API.
 */
@Injectable({providedIn: 'root'})
export class IamApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly usersEndpoint = new UsersApiEndpoint(this.http);
  private readonly roleProfilesEndpoint = new RoleProfilesApiEndpoint(this.http);
  private readonly invitationsEndpoint = new InvitationsApiEndpoint(this.http);
  private readonly signInUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderSignInEndpointPath}`;
  private readonly signUpUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderSignUpEndpointPath}`;
  private readonly userAssembler = new UserAssembler();

  /**
   * Signs in with the DoofPlus Platform.
   * @param email - Work email of the user.
   * @param password - Password of the user.
   * @param twoFactorCode - Six-digit code of the authenticator app; omitted in the first step.
   * @returns Stream with the outcome; the user and its JWT when the sign-in succeeds.
   */
  signIn = (email: string, password: string, twoFactorCode?: string): Observable<SignInResult> =>
    this.http.post<AuthenticatedUserResource>(this.signInUrl, {email, password, twoFactorCode: twoFactorCode ?? null}).pipe(
      map(resource => ({
        status: 'signed-in' as const,
        user: this.userAssembler.toEntityFromResource(resource),
        token: resource.token
      })),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          const reason = error.error?.details ?? error.error?.detail;
          if (reason === 'two-factor-required') return of({status: 'two-factor-required' as const});
          if (reason === 'invalid-two-factor-code') return of({status: 'invalid-two-factor-code' as const});
          return of({status: 'invalid-credentials' as const});
        }
        return throwError(() => new Error('Failed to sign in'));
      })
    );

  /**
   * Creates a user account with its password in the DoofPlus Platform, which stores it hashed.
   * @param user - The user to create.
   * @param password - Initial password chosen by the user.
   * @returns Stream with the created user.
   */
  createUser = (user: User, password: string): Observable<User> =>
    this.http.post<UserResource>(this.signUpUrl, {...this.userAssembler.toResourceFromEntity(user), id: undefined, password}).pipe(
      map(resource => this.userAssembler.toEntityFromResource(resource))
    );

  /**
   * Retrieves all users of the platform (only administrators receive them).
   * @returns Stream with the user collection.
   */
  getUsers = (): Observable<User[]> => this.usersEndpoint.getAll();

  /**
   * Retrieves the role profiles.
   * @returns Stream with the profile collection.
   */
  getRoleProfiles = (): Observable<RoleProfile[]> => this.roleProfilesEndpoint.getAll();

  /**
   * Retrieves the invitations.
   * @returns Stream with the invitation collection.
   */
  getInvitations = (): Observable<Invitation[]> => this.invitationsEndpoint.getAll();

  /**
   * Creates a new invitation.
   * @param invitation - The invitation to send.
   * @returns Stream with the created invitation.
   */
  createInvitation = (invitation: Invitation): Observable<Invitation> => this.invitationsEndpoint.create(invitation);
}
