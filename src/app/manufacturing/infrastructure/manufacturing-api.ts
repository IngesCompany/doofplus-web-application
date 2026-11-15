import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, map} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {environment} from '../../../environments/environment';
import {Product} from '../domain/model/product.entity';
import {MasterFormula} from '../domain/model/master-formula.entity';
import {FormulaItem} from '../domain/model/formula-item.entity';
import {ProductionOrder} from '../domain/model/production-order.entity';
import {Operation} from '../domain/model/operation.entity';
import {Batch} from '../domain/model/batch.entity';
import {BatchEvent} from '../domain/model/batch-event.entity';
import {MaterialLot} from '../domain/model/material-lot.entity';
import {ProductsApiEndpoint} from './products-api-endpoint';
import {MaterialLotsApiEndpoint} from './material-lots-api-endpoint';
import {MasterFormulaResource} from './master-formulas-response';
import {ProductionOrderResource} from './production-orders-response';
import {ProductionBatchResource} from './production-batches-response';
import {MaterialLotResource} from './material-lots-response';
import {MasterFormulaAssembler} from './master-formula-assembler';
import {FormulaItemAssembler} from './formula-item-assembler';
import {ProductionOrderAssembler} from './production-order-assembler';
import {OperationAssembler} from './operation-assembler';
import {BatchAssembler} from './batch-assembler';
import {BatchEventAssembler} from './batch-event-assembler';
import {MaterialLotAssembler} from './material-lot-assembler';

/**
 * Master formulas with their items, flattened for the store.
 */
export interface FormulasWithItems {
  formulas: MasterFormula[];
  items: FormulaItem[];
}

/**
 * Production order with its operations, flattened for the store.
 */
export interface OrderWithOperations {
  order: ProductionOrder;
  operations: Operation[];
}

/**
 * Production batch with its history, flattened for the store.
 */
export interface BatchWithEvents {
  batch: Batch;
  events: BatchEvent[];
}

/**
 * Infrastructure facade for the Manufacturing endpoints of the DoofPlus Platform:
 * products, master formulas, production orders, production batches and raw material lots.
 * The platform answers the items inside the formula, the operations inside the order and the events inside the batch.
 */
@Injectable({providedIn: 'root'})
export class ManufacturingApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.platformProviderApiBaseUrl;
  private readonly ordersUrl = `${this.baseUrl}${environment.platformProviderProductionOrdersEndpointPath}`;
  private readonly batchesUrl = `${this.baseUrl}${environment.platformProviderProductionBatchesEndpointPath}`;
  private readonly formulasUrl = `${this.baseUrl}${environment.platformProviderMasterFormulasEndpointPath}`;
  private readonly lotsUrl = `${this.baseUrl}${environment.platformProviderMaterialLotsEndpointPath}`;
  private readonly productsEndpoint = new ProductsApiEndpoint(this.http);
  private readonly materialLotsEndpoint = new MaterialLotsApiEndpoint(this.http);
  private readonly formulaAssembler = new MasterFormulaAssembler();
  private readonly formulaItemAssembler = new FormulaItemAssembler();
  private readonly orderAssembler = new ProductionOrderAssembler();
  private readonly operationAssembler = new OperationAssembler();
  private readonly batchAssembler = new BatchAssembler();
  private readonly batchEventAssembler = new BatchEventAssembler();
  private readonly lotAssembler = new MaterialLotAssembler();

  /**
   * Retrieves the products; the store completes their formula.
   * @returns Stream with the product collection.
   */
  getProducts = (): Observable<Product[]> => this.productsEndpoint.getAll();

  /**
   * Registers a product with its code, name and dosage form.
   * @param product - The product to register.
   * @returns Stream with the registered product.
   */
  createProduct = (product: Product): Observable<Product> => this.productsEndpoint.create(product);

  /**
   * Retrieves the master formulas with their items.
   * @returns Stream with the formulas and all their items.
   */
  getMasterFormulas = (): Observable<FormulasWithItems> =>
    this.http.get<MasterFormulaResource[]>(this.formulasUrl).pipe(map(resources => ({
      formulas: resources.map(resource => this.formulaAssembler.toEntityFromResource(resource)),
      items: resources.flatMap(resource => (resource.items ?? [])
        .map(item => this.formulaItemAssembler.toEntityFromResource(item, resource.id)))
    })));

  /**
   * Retrieves the production orders with their operations.
   * @returns Stream with each order and its operations.
   */
  getProductionOrders = (): Observable<OrderWithOperations[]> =>
    this.http.get<ProductionOrderResource[]>(this.ordersUrl).pipe(
      map(resources => resources.map(resource => this.toOrderWithOperations(resource))));

  /**
   * Creates a production order without operations.
   * @param order - The order to create.
   * @returns Stream with the created order and its operations.
   */
  createProductionOrder = (order: ProductionOrder): Observable<OrderWithOperations> =>
    this.http.post<ProductionOrderResource>(this.ordersUrl, {
      code: order.code, formulaId: order.formulaId, batchCode: order.batchCode, plannedQuantity: order.plannedQuantity,
      line: order.line, plannedStart: order.plannedStart, plannedEnd: order.plannedEnd, operations: []
    }).pipe(map(resource => this.toOrderWithOperations(resource)));

  /**
   * Completes an operation of a production order.
   * @param operation - The operation to complete.
   * @param reference - Reference of the record of the operation.
   * @returns Stream with the order and its operations after the change.
   */
  completeOperation = (operation: Operation, reference: string): Observable<OrderWithOperations> =>
    this.http.put<ProductionOrderResource>(`${this.ordersUrl}/${operation.orderId}/operations/${operation.sequence}`,
      {progress: 100, status: 'complete', reference}).pipe(map(resource => this.toOrderWithOperations(resource)));

  /**
   * Retrieves the production batches with their history.
   * @param orders - Production orders already loaded, which give the codes of the order and the product.
   * @returns Stream with each batch and its events.
   */
  getBatches = (orders: ProductionOrder[]): Observable<BatchWithEvents[]> =>
    this.http.get<ProductionBatchResource[]>(this.batchesUrl).pipe(
      map(resources => resources.map(resource => this.toBatchWithEvents(resource, orders))));

  /**
   * Creates a production batch for a production order.
   * @param batch - The batch to create.
   * @param orderId - Identifier of its production order.
   * @param orders - Production orders already loaded, including the order of the batch.
   * @returns Stream with the created batch and its events.
   */
  createBatch = (batch: Batch, orderId: number, orders: ProductionOrder[]): Observable<BatchWithEvents> =>
    this.http.post<ProductionBatchResource>(this.batchesUrl, {
      batchNumber: batch.code, productionOrderId: orderId, plannedQuantityValue: batch.quantity,
      plannedQuantityUnit: 'units', line: batch.line, owner: batch.owner
    }).pipe(map(resource => this.toBatchWithEvents(resource, orders)));

  /**
   * Releases a production batch for distribution.
   * @param batch - The batch to release.
   * @param releasedBy - Who signs the release.
   * @param orders - Production orders already loaded.
   * @returns Stream with the released batch and its events.
   */
  releaseBatch = (batch: Batch, releasedBy: string, orders: ProductionOrder[]): Observable<BatchWithEvents> =>
    this.http.post<ProductionBatchResource>(`${this.batchesUrl}/${batch.id}/release`, {releasedBy})
      .pipe(map(resource => this.toBatchWithEvents(resource, orders)));

  /**
   * Retrieves the raw material lots.
   * @returns Stream with the lot collection.
   */
  getMaterialLots = (): Observable<MaterialLot[]> => this.materialLotsEndpoint.getAll();

  /**
   * Records the receipt of a raw material lot.
   * @param lot - The lot received.
   * @returns Stream with the recorded lot.
   */
  createMaterialLot = (lot: MaterialLot): Observable<MaterialLot> => this.materialLotsEndpoint.create(lot);

  /**
   * Records the inspection of a raw material lot and requests its sampling.
   * @param lot - The lot inspected.
   * @returns Stream with the lot after the inspection.
   */
  requestInspection = (lot: MaterialLot): Observable<MaterialLot> =>
    this.http.put<MaterialLotResource>(`${this.lotsUrl}/${lot.id}/inspection`, {
      packagingVerified: lot.packagingVerified, identityVerified: lot.identityVerified,
      samplingStatus: 'requested', storageLocation: lot.storageLocation
    }).pipe(map(resource => this.lotAssembler.toEntityFromResource(resource)));

  private toOrderWithOperations = (resource: ProductionOrderResource): OrderWithOperations => ({
    order: this.orderAssembler.toEntityFromResource(resource),
    operations: (resource.operations ?? []).map(operation => this.operationAssembler.toEntityFromResource(operation, resource.id))
  });

  private toBatchWithEvents = (resource: ProductionBatchResource, orders: ProductionOrder[]): BatchWithEvents => ({
    batch: this.batchAssembler.toEntityFromResource(resource, orders),
    events: (resource.events ?? []).map(event => this.batchEventAssembler.toEntityFromResource(event, resource.batchNumber))
  });
}
