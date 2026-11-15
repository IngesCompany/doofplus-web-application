import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Product as the DoofPlus Platform answers it.
 */
export interface ProductResource extends BaseResource {
  id: number;
  code: string;
  name: string;
  dosageForm: string;
}

/**
 * Collection of products.
 */
export interface ProductsResponse extends BaseResponse {
  products: ProductResource[];
}
