import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {RegulatoryReport} from '../domain/model/regulatory-report.entity';
import {RegulatoryReportResource, RegulatoryReportsResponse} from './regulatory-reports-response';
import {fromPlatform} from './platform-resource';

/**
 * Names shown for the report types of the DoofPlus Platform. The platform accepts these names back.
 */
const REPORT_TYPES: Record<string, string> = {
  BATCH_DOSSIER: 'Batch dossier',
  QUALITY_REVIEW: 'Quality review',
  CAPA_SUMMARY: 'CAPA summary',
  AUDIT_EVIDENCE: 'Audit evidence'
};

/**
 * Maps regulatory report entities to and from API resources.
 */
export class RegulatoryReportAssembler implements BaseAssembler<RegulatoryReport, RegulatoryReportResource, RegulatoryReportsResponse> {
  /**
   * Converts a RegulatoryReportsResponse to an array of RegulatoryReport entities.
   * @param response - The API response containing regulatory report resources.
   * @returns An array of RegulatoryReport entities.
   */
  toEntitiesFromResponse = (response: RegulatoryReportsResponse): RegulatoryReport[] =>
    response.regulatoryReports.map(resource => this.toEntityFromResource(resource));

  /**
   * Converts a RegulatoryReportResource to a RegulatoryReport entity.
   * @param resource - The resource to convert.
   * @returns The converted RegulatoryReport entity.
   */
  toEntityFromResource = (platformResource: RegulatoryReportResource): RegulatoryReport => {
    const resource = fromPlatform(platformResource, ['status']);
    return new RegulatoryReport({
      id: resource.id,
      code: resource.code,
      type: REPORT_TYPES[platformResource.type] ?? platformResource.type,
      scope: resource.scope,
      owner: resource.owner,
      status: resource.status,
      template: resource.template,
      format: resource.format,
      createdAt: resource.createdAt
    });
  };

  /**
   * Converts a RegulatoryReport entity to a RegulatoryReportResource.
   * @param entity - The entity to convert.
   * @returns The converted RegulatoryReportResource.
   */
  toResourceFromEntity = (entity: RegulatoryReport): RegulatoryReportResource =>
    ({
      id: entity.id,
      code: entity.code,
      type: entity.type,
      scope: entity.scope,
      owner: entity.owner,
      status: entity.status,
      template: entity.template,
      format: entity.format,
      createdAt: entity.createdAt
    } as RegulatoryReportResource);
}
