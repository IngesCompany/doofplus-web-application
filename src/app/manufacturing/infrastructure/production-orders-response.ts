import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {OperationResource} from './operations-response';

/**
 * Production order as the DoofPlus Platform answers it, with its operations.
 */
export interface ProductionOrderResource extends BaseResource {
  id: number;
  code: string;
  productCode: string;
  formulaId: number;
  batchCode: string;
  plannedQuantity: number;
  line: string;
  status: string;
  plannedStart: string;
  plannedEnd: string;
  operations: OperationResource[];
}

/**
 * Collection of production orders.
 */
export interface ProductionOrdersResponse extends BaseResponse {
  productionOrders: ProductionOrderResource[];
}
