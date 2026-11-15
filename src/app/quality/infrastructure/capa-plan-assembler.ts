import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {CapaPlan} from '../domain/model/capa-plan.entity';
import {CapaPlanResource, CapaPlansResponse} from './capa-plans-response';
import {fromPlatform} from './platform-resource';

/**
 * Maps CAPA plan entities to and from API resources.
 */
export class CapaPlanAssembler implements BaseAssembler<CapaPlan, CapaPlanResource, CapaPlansResponse> {
  /**
   * Converts a CapaPlansResponse to an array of CapaPlan entities.
   * @param response - The API response containing CAPA plan resources.
   * @returns An array of CapaPlan entities.
   */
  toEntitiesFromResponse = (response: CapaPlansResponse): CapaPlan[] =>
    response.capaPlans.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a CapaPlanResource to a CapaPlan entity.
   * @param resource - The resource to convert.
   * @returns The converted CapaPlan entity.
   */
  toEntityFromResource = (platformResource: CapaPlanResource): CapaPlan => {
    const resource = fromPlatform(platformResource, ['status']);
    return new CapaPlan({
      id: resource.id,
      code: resource.code,
      title: resource.title,
      sourceDeviation: resource.sourceDeviation,
      owner: resource.owner,
      reviewer: resource.reviewer,
      rootCause: resource.rootCause,
      acceptanceCriterion: resource.acceptanceCriterion,
      effectivenessCheckAt: resource.effectivenessCheckAt,
      status: resource.status
    });
  };

  /**
   * Converts a CapaPlan entity to a CapaPlanResource.
   * @param entity - The entity to convert.
   * @returns The converted CapaPlanResource.
   */
  toResourceFromEntity = (entity: CapaPlan): CapaPlanResource =>
    ({
      id: entity.id,
      code: entity.code,
      title: entity.title,
      sourceDeviation: entity.sourceDeviation,
      owner: entity.owner,
      reviewer: entity.reviewer,
      rootCause: entity.rootCause,
      acceptanceCriterion: entity.acceptanceCriterion,
      effectivenessCheckAt: entity.effectivenessCheckAt,
      status: entity.status
    } as CapaPlanResource);
}
