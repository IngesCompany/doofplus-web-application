import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Product} from '../domain/model/product.entity';
import {ProductResource, ProductsResponse} from './products-response';
import {fromPlatformEnum} from './platform-enum';

/**
 * Maps product entities to and from the resources of the DoofPlus Platform.
 * The platform does not answer the formula of the product; the store completes it from the master formulas.
 */
export class ProductAssembler implements BaseAssembler<Product, ProductResource, ProductsResponse> {
  /**
   * Converts a ProductsResponse to an array of Product entities.
   * @param response - The API response containing product resources.
   * @returns An array of Product entities.
   */
  toEntitiesFromResponse = (response: ProductsResponse): Product[] =>
    response.products.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a ProductResource to a Product entity without formula.
   * @param resource - The resource to convert.
   * @returns The converted Product entity.
   */
  toEntityFromResource = (resource: ProductResource): Product =>
    new Product({
      id: resource.id,
      code: resource.code,
      name: resource.name,
      dosageForm: fromPlatformEnum(resource.dosageForm),
      formulaVersion: 'none',
      formulaStatus: 'none'
    });

  /**
   * Converts a Product entity to the body that registers it.
   * @param entity - The entity to convert.
   * @returns The resource with the code, the name and the dosage form.
   */
  toResourceFromEntity = (entity: Product): ProductResource =>
    ({id: entity.id, code: entity.code, name: entity.name, dosageForm: entity.dosageForm} as ProductResource);
}
