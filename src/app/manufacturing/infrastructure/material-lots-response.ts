import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Raw material lot as the DoofPlus Platform answers it.
 */
export interface MaterialLotResource extends BaseResource {
  id: number;
  code: string;
  receiptCode: string;
  material: string;
  category: string;
  supplier: string;
  supplierLot: string;
  quantity: string;
  expiryDate: string;
  storageLocation: string;
  certificate: string;
  status: string;
  packagingVerified: boolean;
  identityVerified: boolean;
  samplingStatus: string;
  allocatedBatch: string | null;
}

/**
 * Collection of raw material lots.
 */
export interface MaterialLotsResponse extends BaseResponse {
  materialLots: MaterialLotResource[];
}
