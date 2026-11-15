/**
 * Operation of a production order, answered inside the order by the DoofPlus Platform.
 */
export interface OperationResource {
  id: number;
  sequence: number;
  name: string;
  equipment: string;
  progress: number;
  status: string;
  reference: string | null;
}
