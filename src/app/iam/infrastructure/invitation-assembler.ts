import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Invitation} from '../domain/model/invitation.entity';
import {InvitationResource, InvitationsResponse} from './invitations-response';
import {fromPlatformEnum} from '../../manufacturing/infrastructure/platform-enum';

/**
 * Maps invitation entities to and from API resources.
 */
export class InvitationAssembler implements BaseAssembler<Invitation, InvitationResource, InvitationsResponse> {
  /**
   * Converts a InvitationsResponse to an array of Invitation entities.
   * @param response - The API response containing invitation resources.
   * @returns An array of Invitation entities.
   */
  toEntitiesFromResponse = (response: InvitationsResponse): Invitation[] =>
    response.invitations.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a InvitationResource to a Invitation entity.
   * @param resource - The resource to convert.
   * @returns The converted Invitation entity.
   */
  toEntityFromResource = (resource: InvitationResource): Invitation =>
    new Invitation({
      id: resource.id,
      organizationId: resource.organizationId,
      fullName: resource.fullName,
      email: resource.email,
      role: resource.role,
      facility: resource.facility,
      note: resource.note ?? '',
      status: fromPlatformEnum(resource.status),
      sentAt: resource.sentAt
    });

  /**
   * Converts a Invitation entity to a InvitationResource.
   * @param entity - The entity to convert.
   * @returns The converted InvitationResource.
   */
  toResourceFromEntity = (entity: Invitation): InvitationResource =>
    ({
      id: entity.id,
      organizationId: entity.organizationId,
      fullName: entity.fullName,
      email: entity.email,
      role: entity.role,
      facility: entity.facility,
      note: entity.note,
      status: entity.status,
      sentAt: entity.sentAt
    } as InvitationResource);
}
