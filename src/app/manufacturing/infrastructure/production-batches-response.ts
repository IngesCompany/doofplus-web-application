import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {BatchEventResource} from './batch-events-response';

/**
 * Incident of a production batch.
 */
export interface IncidentResource {
  id: number;
  description: string;
  severity: string;
  status: string;
  recordedAt: string;
}

/**
 * Production batch as the DoofPlus Platform answers it, with its incidents, consumptions and events.
 */
export interface ProductionBatchResource extends BaseResource {
  id: number;
  batchNumber: string;
  productionOrderId: number;
  status: string;
  plannedQuantityValue: number;
  plannedQuantityUnit: string;
  line: string;
  owner: string;
  progress: number;
  incidents: IncidentResource[];
  events: BatchEventResource[];
}

/**
 * Collection of production batches.
 */
export interface ProductionBatchesResponse extends BaseResponse {
  productionBatches: ProductionBatchResource[];
}
