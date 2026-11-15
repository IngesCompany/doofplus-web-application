import {FormulaItem} from '../domain/model/formula-item.entity';
import {FormulaItemResource} from './formula-items-response';
import {fromPlatformEnum} from './platform-enum';

/**
 * Maps the items of a master formula of the DoofPlus Platform to formula item entities.
 */
export class FormulaItemAssembler {
  /**
   * Converts an item of a formula to a FormulaItem entity.
   * @param resource - The item answered inside the formula.
   * @param formulaId - Identifier of the formula that holds the item.
   * @returns The converted FormulaItem entity.
   */
  toEntityFromResource = (resource: FormulaItemResource, formulaId: number): FormulaItem =>
    new FormulaItem({
      id: resource.id,
      formulaId,
      kind: fromPlatformEnum(resource.kind),
      name: resource.name,
      role: resource.role ?? '',
      target: resource.target ?? '',
      tolerance: resource.tolerance ?? '',
      control: resource.control ?? ''
    });
}
