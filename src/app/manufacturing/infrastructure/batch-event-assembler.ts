import {BatchEvent} from '../domain/model/batch-event.entity';
import {BatchEventResource} from './batch-events-response';
import {fromPlatformEnum} from './platform-enum';

/**
 * Title shown for each type of event of the platform.
 */
const EVENT_TITLES: Record<string, string> = {
  BATCH_CREATED: 'Created',
  BATCH_STARTED: 'Production started',
  BATCH_RESUMED: 'Production resumed',
  INCIDENT_REGISTERED: 'Incident registered',
  MATERIAL_CONSUMED: 'Material consumed',
  RELEASE_REQUESTED: 'Release requested',
  BATCH_RELEASED: 'Released for distribution'
};

/**
 * Maps the events of a production batch of the DoofPlus Platform to batch event entities.
 */
export class BatchEventAssembler {
  /**
   * Gives the title of a type of event.
   * @param type - Type of the event answered by the platform.
   * @returns The title shown in the history of the batch.
   */
  titleOf = (type: string): string => EVENT_TITLES[type] ?? fromPlatformEnum(type);

  /**
   * Converts an event of a batch to a BatchEvent entity.
   * @param resource - The event answered inside the batch.
   * @param batchCode - Number of the batch that holds the event.
   * @returns The converted BatchEvent entity.
   */
  toEntityFromResource = (resource: BatchEventResource, batchCode: string): BatchEvent =>
    new BatchEvent({
      id: resource.id,
      batchCode,
      title: this.titleOf(resource.type),
      detail: resource.description ?? '',
      occurredAt: resource.occurredAt,
      tone: fromPlatformEnum(resource.tone)
    });
}
