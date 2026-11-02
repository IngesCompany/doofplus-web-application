import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Resource representation of a contact inquiry.
 */
export interface ContactInquiryResource extends BaseResource {
  /**
   * Unique identifier of the inquiry.
   */
  id: number;
  /**
   * Full name of the visitor.
   */
  fullName: string;
  /**
   * Email the team uses to answer the inquiry.
   */
  email: string;
  /**
   * Question written by the visitor.
   */
  message: string;
  /**
   * Status of the inquiry (received or answered).
   */
  status: string;
  /**
   * Date and time the inquiry was received (ISO 8601).
   */
  receivedAt: string;
}

/**
 * Response envelope for contact inquiry collection queries.
 */
export interface ContactInquiriesResponse extends BaseResponse {
  /**
   * Array of contact inquiry resources included in the response.
   */
  contactInquiries: ContactInquiryResource[];
}
