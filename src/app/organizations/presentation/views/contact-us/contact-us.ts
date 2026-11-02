import {Component, inject, OnInit, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {OrganizationsStore} from '../../../application/organizations.store';

/**
 * Public contact us page of the Web Application: a visitor sends a question about DoofPlus and its plans,
 * which is registered as a contact inquiry with the received status (US04).
 */
@Component({
  selector: 'app-contact-us',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, MatButton, MatIcon, MatFormField, MatError, MatInput],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css'
})
export class ContactUs extends BaseForm implements OnInit {
  protected readonly store = inject(OrganizationsStore);

  /**
   * Topics the team can help with, shown in the side panel.
   */
  protected readonly topics = [
    {key: 'plans', icon: 'payments'},
    {key: 'environments', icon: 'dashboard'},
    {key: 'compliance', icon: 'verified'},
    {key: 'support', icon: 'support_agent'}
  ];

  /**
   * Channels to reach the DoofPlus team.
   */
  protected readonly channels = [
    {key: 'email', icon: 'mail', value: 'doofplus.inges@gmail.com', href: 'mailto:doofplus.inges@gmail.com'},
    {key: 'phone', icon: 'call', value: '+51 (1) 234-5678', href: 'tel:+5112345678'},
    {key: 'location', icon: 'location_on', value: 'Lima, Peru', href: null}
  ];

  /**
   * Contact form.
   */
  protected readonly form = new FormGroup({
    fullName: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)]}),
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
    message: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)]})
  });

  /**
   * Email shown in the confirmation.
   */
  protected readonly sentTo = signal('');

  /**
   * Starts the page at the form.
   */
  ngOnInit(): void {
    this.store.resetContact();
  }

  /**
   * Sends the inquiry when the form is valid; otherwise shows the reason on each field.
   */
  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.sentTo.set(value.email.trim());
    this.store.sendContactInquiry(value);
  }

  /**
   * Clears the form to send another inquiry.
   */
  protected sendAnother(): void {
    this.form.reset();
    this.store.resetContact();
  }

  /**
   * Whether a control is invalid and touched.
   * @param controlName - Name of the control.
   */
  protected isInvalid(controlName: keyof typeof this.form.controls): boolean {
    return this.isInvalidControl(this.form, controlName);
  }
}
