import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {IamStore} from '../../../../iam/application/iam.store';
import {WorkspaceEnvironment, workspaceEnvironments} from '../../workspace-environments';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton} from '@angular/material/button';
import {MatCard} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';

@Component({
  imports: [TranslatePipe, MatButton, MatCard, MatIcon],
  selector: 'app-page-not-found',
  styleUrl: './page-not-found.css',
  templateUrl: './page-not-found.html',
})
/**
 * Displays fallback content for unknown routes.
 */
export class PageNotFound implements OnInit {
  protected invalidPath = '';
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private iamStore = inject(IamStore);

  ngOnInit(): void {
    this.invalidPath = this.route.snapshot.url.map((url) => url.path).join('/');
  }

  /**
   * Navigates to the home page: the first page of the user's workspace, or the sign-in when there is no session.
   */
  protected navigateToHome() {
    const user = this.iamStore.currentUser();
    const home = user ? workspaceEnvironments[user.environment as WorkspaceEnvironment].navigation[0].link : '/sign-in';
    this.router.navigate([home]).then();
  }
}
