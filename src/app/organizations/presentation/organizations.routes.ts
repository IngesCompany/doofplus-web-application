import {Routes} from '@angular/router';
import {unsavedChangesGuard} from '../../shared/presentation/guards/unsaved-changes.guard';

const organizationRegistration = () =>
  import('./views/organization-registration/organization-registration').then(m => m.OrganizationRegistration);
const contactUs = () =>
  import('./views/contact-us/contact-us').then(m => m.ContactUs);
const administrationOverview = () =>
  import('./views/administration-overview/administration-overview').then(m => m.AdministrationOverview);
const profilePreferences = () =>
  import('./views/profile-preferences/profile-preferences').then(m => m.ProfilePreferences);

/**
 * Public route of the organization registration.
 */
export const organizationsPublicRoutes: Routes = [
  {
    path: '', loadComponent: organizationRegistration, canDeactivate: [unsavedChangesGuard],
    title: 'DoofPlus - Organization registration'
  }
];

/**
 * Public contact us route, shown with the public toolbar and footer.
 */
export const organizationsContactRoutes: Routes = [
  { path: '', loadComponent: contactUs, title: 'DoofPlus - Contact us' }
];

/**
 * Administration routes of the Organizations & Profiles bounded context.
 */
export const organizationsAdministrationRoutes: Routes = [
  { path: 'overview', loadComponent: administrationOverview, title: 'DoofPlus - Administration overview' }
];

/**
 * Profile route available in every environment.
 */
export const profileRoutes: Routes = [
  { path: 'profile', loadComponent: profilePreferences, title: 'DoofPlus - Profile & preferences' }
];
