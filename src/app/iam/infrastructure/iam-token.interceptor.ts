import {HttpInterceptorFn} from '@angular/common/http';
import {environment} from '../../../environments/environment';

/**
 * Key of the local storage entry that keeps the JWT issued by the DoofPlus Platform at sign-in.
 */
export const TOKEN_KEY = 'doofplus-token';

/**
 * Adds the JWT of the signed-in user as a Bearer token to the requests sent to the DoofPlus Platform.
 * Requests to the fake API and to other hosts are sent without it.
 */
export const iamTokenInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.platformProviderApiBaseUrl)) return next(request);
  let token: string | null = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {
    token = null;
  }
  return next(token ? request.clone({setHeaders: {Authorization: `Bearer ${token}`}}) : request);
};
