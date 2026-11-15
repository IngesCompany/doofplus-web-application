import {computed, inject, Injectable, signal} from '@angular/core';
import {Router} from '@angular/router';
import {map, Observable, of, retry} from 'rxjs';
import {IamApi, SignInResult} from '../infrastructure/iam.api';
import {TOKEN_KEY} from '../infrastructure/iam-token.interceptor';
import {UserAssembler} from '../infrastructure/user-assembler';
import {UserResource} from '../infrastructure/users-response';
import {User} from '../domain/model/user.entity';
import {RoleProfile} from '../domain/model/role-profile.entity';
import {Invitation} from '../domain/model/invitation.entity';
import {SignInCommand} from '../domain/model/sign-in.command';
import {WorkspaceEnvironment, workspaceEnvironments} from '../../shared/presentation/workspace-environments';

/**
 * Step of the sign-in flow shown by the sign-in form.
 */
export type SignInStep = 'credentials' | 'invalid-credentials' | 'two-factor' | 'invalid-code' | 'not-authorized';

const SESSION_KEY = 'doofplus-session';

/**
 * Holds the IAM state: the signed-in user, the sign-in flow and the users administered by the laboratory.
 */
@Injectable({providedIn: 'root'})
export class IamStore {
  private readonly iamApi = inject(IamApi);
  private readonly userAssembler = new UserAssembler();

  private readonly currentUserSignal = signal<User | null>(this.restoreSession());
  private readonly pendingUserSignal = signal<User | null>(null);
  private readonly requestedEnvironmentSignal = signal<WorkspaceEnvironment | null>(null);
  private readonly signInStepSignal = signal<SignInStep>('credentials');
  private readonly usersSignal = signal<User[]>([]);
  private readonly roleProfilesSignal = signal<RoleProfile[]>([]);
  private readonly invitationsSignal = signal<Invitation[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  /** Credentials kept in memory between the password step and the two-factor step. */
  private pendingCredentials: { email: string; password: string } | null = null;

  /**
   * User with an active session, or null.
   */
  readonly currentUser = this.currentUserSignal.asReadonly();

  /**
   * User whose credentials were accepted and who still has to enter the two-factor code.
   */
  readonly pendingUser = this.pendingUserSignal.asReadonly();

  /**
   * Current step of the sign-in flow.
   */
  readonly signInStep = this.signInStepSignal.asReadonly();

  /**
   * Whether a user is signed in.
   */
  readonly isSignedIn = computed(() => this.currentUser() !== null);

  /**
   * Users of the organization.
   */
  readonly users = this.usersSignal.asReadonly();

  /**
   * Least-privilege profiles of the organization.
   */
  readonly roleProfiles = this.roleProfilesSignal.asReadonly();

  /**
   * Invitations sent by the administrator.
   */
  readonly invitations = this.invitationsSignal.asReadonly();

  /**
   * Invitations that have not been accepted yet.
   */
  readonly pendingInvitations = computed(() => this.invitations().filter(invitation => invitation.status === 'pending'));

  /**
   * Whether data is loading.
   */
  readonly loading = this.loadingSignal.asReadonly();

  /**
   * Current error message, if any.
   */
  readonly error = this.errorSignal.asReadonly();

  /**
   * Sends the credentials to the DoofPlus Platform. A user with two-factor authentication continues to the
   * code step; a user without it signs in at once.
   * @param command - Credentials and requested environment.
   * @param router - Router used to open the workspace when no code is needed.
   */
  signIn = (command: SignInCommand, router?: Router): void => {
    this.loadingSignal.set(true);
    this.iamApi.signIn(command.email, command.password).subscribe({
      next: result => {
        this.loadingSignal.set(false);
        this.requestedEnvironmentSignal.set(command.environment);
        if (result.status === 'two-factor-required') {
          this.pendingCredentials = {email: command.email, password: command.password};
          this.pendingUserSignal.set(this.pendingUserFromEmail(command.email));
          return this.signInStepSignal.set('two-factor');
        }
        this.completeSignIn(result, router);
      },
      error: err => {
        this.loadingSignal.set(false);
        this.errorSignal.set(this.formatError(err, 'Failed to sign in'));
      }
    });
  };

  /**
   * Sends the two-factor code with the credentials of the first step. The DoofPlus Platform answers the user
   * and its JWT only when the code is right.
   * @param code - Six-digit code from the authenticator app.
   * @param router - Router used to open the workspace of the user.
   */
  verifyTwoFactorCode = (code: string, router: Router): void => {
    const credentials = this.pendingCredentials;
    if (!credentials) return this.signInStepSignal.set('credentials');
    this.iamApi.signIn(credentials.email, credentials.password, code).subscribe({
      next: result => this.completeSignIn(result, router),
      error: err => this.errorSignal.set(this.formatError(err, 'Failed to verify the code'))
    });
  };

  /**
   * Opens the session when the platform signed the user in, or moves the form to the step of the failure.
   * @param result - Outcome of the sign-in request.
   * @param router - Router used to open the workspace of the user.
   */
  private completeSignIn(result: SignInResult, router?: Router): void {
    if (result.status === 'invalid-two-factor-code') return this.signInStepSignal.set('invalid-code');
    if (result.status !== 'signed-in') {
      this.pendingCredentials = null;
      return this.signInStepSignal.set('invalid-credentials');
    }
    const user = result.user;
    if (user.environment !== this.requestedEnvironmentSignal()) {
      this.pendingCredentials = null;
      this.pendingUserSignal.set(user);
      return this.signInStepSignal.set('not-authorized');
    }
    this.currentUserSignal.set(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(this.userAssembler.toResourceFromEntity(user)));
    localStorage.setItem(TOKEN_KEY, result.token);
    this.resetSignIn();
    router?.navigate([workspaceEnvironments[user.environment as WorkspaceEnvironment].navigation[0].link]).then();
  }

  /**
   * Builds the user shown in the two-factor step: the platform reveals the account only after the code.
   * @param email - Work email entered by the user.
   * @returns A user with the email and a name taken from it (maria.mexico becomes Maria Mexico).
   */
  private pendingUserFromEmail(email: string): User {
    const fullName = email.split('@')[0].split(/[._-]+/).filter(Boolean)
      .map(part => part[0].toUpperCase() + part.slice(1)).join(' ');
    return new User({
      id: 0, fullName, initials: '', email, role: '', environment: '', facility: '', status: '',
      organizationId: 0, organizationName: '', plant: '', privilege: ''
    });
  }

  /**
   * Returns the sign-in flow to the credentials step.
   */
  resetSignIn = (): void => {
    this.pendingCredentials = null;
    this.pendingUserSignal.set(null);
    this.requestedEnvironmentSignal.set(null);
    this.signInStepSignal.set('credentials');
  };

  /**
   * Closes the session and returns to the environment selection.
   * @param router - Router used to leave the workspace.
   */
  signOut = (router: Router): void => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.currentUserSignal.set(null);
    this.resetSignIn();
    router.navigate(['/sign-in']).then();
  };

  /**
   * Loads users, profiles and invitations for the administration pages.
   */
  loadDirectory = (): void => {
    this.loadingSignal.set(true);
    this.iamApi.getUsers().subscribe({
      next: users => { this.usersSignal.set(users); this.loadingSignal.set(false); },
      error: err => { this.errorSignal.set(this.formatError(err, 'Failed to load users')); this.loadingSignal.set(false); }
    });
    this.iamApi.getRoleProfiles().subscribe({
      next: profiles => this.roleProfilesSignal.set(profiles),
      error: err => this.errorSignal.set(this.formatError(err, 'Failed to load profiles'))
    });
    this.iamApi.getInvitations().subscribe({
      next: invitations => this.invitationsSignal.set(invitations),
      error: err => this.errorSignal.set(this.formatError(err, 'Failed to load invitations'))
    });
  };

  /**
   * Sends an invitation and adds it to the list.
   * @param invitation - The invitation to send.
   * @param router - Router used to return to the user directory.
   */
  addInvitation = (invitation: Invitation, router: Router): void => {
    this.loadingSignal.set(true);
    this.iamApi.createInvitation(invitation).pipe(retry(2)).subscribe({
      next: created => {
        this.invitationsSignal.update(invitations => [...invitations, created]);
        this.loadingSignal.set(false);
        router.navigate(['/administration/users'], {queryParams: {tab: 'invitations', sent: created.email}}).then();
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to send the invitation'));
        this.loadingSignal.set(false);
      }
    });
  };

  /**
   * Re-authenticates the signed-in user, as required before an electronic signature.
   * @param password - Password entered by the user.
   * @returns Stream that emits true when the password is correct.
   */
  verifyPassword = (password: string): Observable<boolean> => {
    const user = this.currentUser();
    if (!user) return of(false);
    // The platform answers two-factor-required only after it checked the password.
    return this.iamApi.signIn(user.email, password).pipe(
      map(result => result.status === 'signed-in' || result.status === 'two-factor-required')
    );
  };

  /**
   * Creates the first administrator of a newly registered organization. The account stays invited
   * until the administrator verifies the email and enrolls two-factor authentication.
   * @param administrator - Organization and personal data of the administrator.
   */
  registerAdministrator = (administrator: {
    organizationId: number; organizationName: string; plant: string; fullName: string; email: string; password: string;
  }): void => {
    const initials = administrator.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
    this.iamApi.createUser(new User({
      id: 0, fullName: administrator.fullName, initials, email: administrator.email, role: 'administrator',
      environment: 'administration', facility: 'All facilities', status: 'invited', organizationId: administrator.organizationId,
      organizationName: administrator.organizationName, plant: administrator.plant, privilege: 'administrator'
    }), administrator.password).subscribe({
      next: user => this.usersSignal.update(users => [...users, user]),
      error: err => this.errorSignal.set(this.formatError(err, 'Failed to create the administrator'))
    });
  };

  /**
   * Checks whether an email already belongs to a user or an invitation of the organization.
   * @param email - Email to check.
   * @returns True when the email is already used.
   */
  isEmailTaken = (email: string): boolean => {
    const normalized = email.trim().toLowerCase();
    return this.users().some(user => user.email.toLowerCase() === normalized)
      || this.invitations().some(invitation => invitation.email.toLowerCase() === normalized);
  };

  /**
   * Restores the session saved in local storage.
   * @returns The saved user, or null.
   */
  private restoreSession(): User | null {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    try {
      return this.userAssembler.toEntityFromResource(JSON.parse(saved) as UserResource);
    } catch {
      return null;
    }
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
