/**
 * Event of the history of a production batch, answered inside the batch by the DoofPlus Platform.
 */
export interface BatchEventResource {
  id: number;
  type: string;
  description: string;
  tone: string;
  performedBy: number | null;
  occurredAt: string;
}
