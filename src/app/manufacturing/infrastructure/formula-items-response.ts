/**
 * Item of a master formula, answered inside the formula by the DoofPlus Platform.
 */
export interface FormulaItemResource {
  id: number;
  kind: string;
  name: string;
  role: string;
  target: string;
  tolerance: string;
  control: string;
}
