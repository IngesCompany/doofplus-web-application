import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {FormulaItemResource} from './formula-items-response';

/**
 * Master formula as the DoofPlus Platform answers it, with its items.
 */
export interface MasterFormulaResource extends BaseResource {
  id: number;
  productCode: string;
  version: string;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  batchSize: number;
  items: FormulaItemResource[];
}

/**
 * Collection of master formulas.
 */
export interface MasterFormulasResponse extends BaseResponse {
  masterFormulas: MasterFormulaResource[];
}
