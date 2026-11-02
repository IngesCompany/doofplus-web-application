import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {ContactInquiry} from '../domain/model/contact-inquiry.entity';
import {ContactInquiryResource, ContactInquiriesResponse} from './contact-inquiries-response';
import {ContactInquiryAssembler} from './contact-inquiry-assembler';

/**
 * Endpoint client for contact inquiry operations.
 */
export class ContactInquiriesApiEndpoint extends BaseApiEndpoint<ContactInquiry, ContactInquiryResource, ContactInquiriesResponse, ContactInquiryAssembler> {
  /**
   * Creates an instance of ContactInquiriesApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderContactInquiriesEndpointPath}`, new ContactInquiryAssembler());
  }
}
