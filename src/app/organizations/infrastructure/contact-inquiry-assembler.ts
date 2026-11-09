import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {ContactInquiry} from '../domain/model/contact-inquiry.entity';
import {ContactInquiryResource, ContactInquiriesResponse} from './contact-inquiries-response';

/**
 * Maps contact inquiry entities to and from API resources.
 */
export class ContactInquiryAssembler implements BaseAssembler<ContactInquiry, ContactInquiryResource, ContactInquiriesResponse> {
  /**
   * Converts a ContactInquiriesResponse to an array of ContactInquiry entities.
   * @param response - The API response containing contact inquiry resources.
   * @returns An array of ContactInquiry entities.
   */
  toEntitiesFromResponse = (response: ContactInquiriesResponse): ContactInquiry[] =>
    response.contactInquiries.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a ContactInquiryResource to a ContactInquiry entity.
   * @param resource - The resource to convert.
   * @returns The converted ContactInquiry entity.
   */
  toEntityFromResource = (resource: ContactInquiryResource): ContactInquiry =>
    new ContactInquiry({
      id: resource.id,
      fullName: resource.fullName,
      email: resource.email,
      message: resource.message,
      status: resource.status,
      receivedAt: resource.receivedAt
    });

  /**
   * Converts a ContactInquiry entity to a ContactInquiryResource.
   * @param entity - The entity to convert.
   * @returns The converted ContactInquiryResource.
   */
  toResourceFromEntity = (entity: ContactInquiry): ContactInquiryResource =>
    ({
      id: entity.id,
      fullName: entity.fullName,
      email: entity.email,
      message: entity.message,
      status: entity.status,
      receivedAt: entity.receivedAt
    } as ContactInquiryResource);
}
