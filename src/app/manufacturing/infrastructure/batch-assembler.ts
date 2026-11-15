import {Batch} from '../domain/model/batch.entity';
import {ProductionOrder} from '../domain/model/production-order.entity';
import {ProductionBatchResource} from './production-batches-response';
import {BatchEventAssembler} from './batch-event-assembler';
import {fromPlatformEnum} from './platform-enum';

/**
 * Maps the production batches of the DoofPlus Platform to batch entities.
 * The codes of the order and the product come from the production order of the batch.
 */
export class BatchAssembler {
  private readonly eventAssembler = new BatchEventAssembler();

  /**
   * Converts a production batch to a Batch entity.
   * The incident is the last one not resolved; the last activity is the last event of the batch.
   * @param resource - The batch answered by the platform.
   * @param orders - Production orders already loaded.
   * @returns The converted Batch entity.
   */
  toEntityFromResource = (resource: ProductionBatchResource, orders: ProductionOrder[]): Batch => {
    const order = orders.find(item => item.id === resource.productionOrderId);
    const openIncidents = (resource.incidents ?? []).filter(incident => incident.status !== 'RESOLVED');
    const events = resource.events ?? [];
    const lastEvent = events[events.length - 1];
    return new Batch({
      id: resource.id,
      code: resource.batchNumber,
      productCode: order?.productCode ?? '',
      orderCode: order?.code ?? '',
      quantity: Number(resource.plannedQuantityValue),
      line: resource.line ?? '',
      owner: resource.owner ?? '',
      status: fromPlatformEnum(resource.status),
      progress: resource.progress,
      incident: openIncidents.length ? openIncidents[openIncidents.length - 1].description : '',
      lastActivity: lastEvent ? this.eventAssembler.titleOf(lastEvent.type) : '',
      lastActivityAt: lastEvent?.occurredAt ?? ''
    });
  };
}
