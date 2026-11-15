import {Operation} from '../domain/model/operation.entity';
import {OperationResource} from './operations-response';
import {fromPlatformEnum} from './platform-enum';

/**
 * Maps the operations of a production order of the DoofPlus Platform to operation entities.
 */
export class OperationAssembler {
  /**
   * Converts an operation of an order to an Operation entity.
   * Its identifier is orderId * 1000 + sequence, because the platform identifies it by the order and the sequence.
   * @param resource - The operation answered inside the order.
   * @param orderId - Identifier of the order that holds the operation.
   * @returns The converted Operation entity.
   */
  toEntityFromResource = (resource: OperationResource, orderId: number): Operation =>
    new Operation({
      id: orderId * 1000 + resource.sequence,
      orderId,
      sequence: resource.sequence,
      name: resource.name,
      equipment: resource.equipment ?? '',
      progress: resource.progress,
      status: fromPlatformEnum(resource.status),
      reference: resource.reference ?? ''
    });
}
