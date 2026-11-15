import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Role of the DoofPlus Platform (GET /roles), for example ROLE_QA_SPECIALIST.
 */
export interface RoleProfileResource extends BaseResource {
  /**
   * Unique identifier of the role.
   */
  id: number;
  /**
   * Name of the role, for example ROLE_QA_SPECIALIST.
   */
  name: string;
}

/**
 * Response envelope for role collection queries.
 */
export interface RoleProfilesResponse extends BaseResponse {
  /**
   * Array of role resources included in the response.
   */
  roles: RoleProfileResource[];
}
