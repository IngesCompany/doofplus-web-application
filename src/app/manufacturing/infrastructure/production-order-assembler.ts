import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {ProductionOrder} from '../domain/model/production-order.entity';
import {ProductionOrderResource, ProductionOrdersResponse} from './production-orders-response';
import {fromPlatformEnum} from './platform-enum';

/**
 * Maps production order entities to and from the resources of the DoofPlus Platform.
 */
export class ProductionOrderAssembler implements BaseAssembler<ProductionOrder, ProductionOrderResource, ProductionOrdersResponse> {
  /**
   * Converts a ProductionOrdersResponse to an array of ProductionOrder entities.
   * @param response - The API response containing production order resources.
   * @returns An array of ProductionOrder entities.
   */
  toEntitiesFromResponse = (response: ProductionOrdersResponse): ProductionOrder[] =>
    response.productionOrders.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a ProductionOrderResource to a ProductionOrder entity.
   * @param resource - The resource to convert.
   * @returns The converted ProductionOrder entity.
   */
  toEntityFromResource = (resource: ProductionOrderResource): ProductionOrder =>
    new ProductionOrder({
      id: resource.id,
      code: resource.code,
      productCode: resource.productCode,
      formulaId: resource.formulaId,
      batchCode: resource.batchCode,
      plannedQuantity: Number(resource.plannedQuantity),
      line: resource.line,
      status: fromPlatformEnum(resource.status),
      plannedStart: resource.plannedStart ?? '',
      plannedEnd: resource.plannedEnd ?? ''
    });

  /**
   * Converts a ProductionOrder entity to the body that creates it, without operations.
   * @param entity - The entity to convert.
   * @returns The converted resource.
   */
  toResourceFromEntity = (entity: ProductionOrder): ProductionOrderResource =>
    ({
      id: entity.id,
      code: entity.code,
      productCode: entity.productCode,
      formulaId: entity.formulaId,
      batchCode: entity.batchCode,
      plannedQuantity: entity.plannedQuantity,
      line: entity.line,
      status: entity.status,
      plannedStart: entity.plannedStart,
      plannedEnd: entity.plannedEnd,
      operations: []
    } as ProductionOrderResource);
}
