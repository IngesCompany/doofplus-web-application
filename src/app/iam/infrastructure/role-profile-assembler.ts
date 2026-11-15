import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {RoleProfile} from '../domain/model/role-profile.entity';
import {ROLE_PERMISSIONS} from '../domain/model/role-permissions';
import {RoleProfileResource, RoleProfilesResponse} from './role-profiles-response';

/**
 * Maps the roles of the DoofPlus Platform (ROLE_QA_SPECIALIST) to role profiles with the permission matrix of each role.
 */
export class RoleProfileAssembler implements BaseAssembler<RoleProfile, RoleProfileResource, RoleProfilesResponse> {
  /**
   * Converts a RoleProfilesResponse to role profiles in the order of the matrix.
   * @param response - The API response containing role resources.
   * @returns An array of RoleProfile entities.
   */
  toEntitiesFromResponse = (response: RoleProfilesResponse): RoleProfile[] =>
    RoleProfileAssembler.sort(response.roles.map(resource => this.toEntityFromResource(resource)));

  /**
   * Converts a role of the platform to a role profile.
   * @param resource - The role resource.
   * @returns The role profile with its permissions.
   */
  toEntityFromResource = (resource: RoleProfileResource): RoleProfile => {
    const key = resource.name.replace(/^ROLE_/, '').toLowerCase().replace(/_/g, '-');
    const permissions = ROLE_PERMISSIONS[key] ?? {name: key, createEdit: [], approveSign: 'None', restriction: '', tone: 'neutral'};
    return new RoleProfile({id: resource.id, key, ...permissions});
  };

  /**
   * Converts a role profile back to the role of the platform.
   * @param entity - The role profile.
   * @returns The role resource.
   */
  toResourceFromEntity = (entity: RoleProfile): RoleProfileResource =>
    ({id: entity.id, name: `ROLE_${entity.key.toUpperCase().replace(/-/g, '_')}`} as RoleProfileResource);

  /**
   * Orders the role profiles as the permission matrix.
   * @param profiles - The role profiles.
   * @returns The ordered role profiles.
   */
  static sort = (profiles: RoleProfile[]): RoleProfile[] => {
    const order = Object.keys(ROLE_PERMISSIONS);
    return [...profiles].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  };
}
