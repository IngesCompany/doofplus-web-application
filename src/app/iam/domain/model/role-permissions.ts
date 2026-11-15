/**
 * Permission matrix of the role-based access control: what each role can create or edit, approve or sign, and its
 * restriction. The DoofPlus Platform lists the roles (GET /roles); the matrix explains each one in the Web Application.
 */
export const ROLE_PERMISSIONS: Record<string, {name: string; createEdit: string[]; approveSign: string; restriction: string; tone: string}> = {
  'qa-specialist': {
    name: 'QA Specialist', createEdit: ['Documents', 'CAPA'], approveSign: 'Release if authorized',
    restriction: 'No billing access', tone: 'teal'
  },
  'production-supervisor': {
    name: 'Production Supervisor', createEdit: ['Orders', 'Incidents'], approveSign: 'Production records',
    restriction: 'Cannot release batch', tone: 'purple'
  },
  'quality-manager': {
    name: 'Quality Manager', createEdit: ['Documents'], approveSign: 'Approve documents and CAPA',
    restriction: 'Cannot approve own records', tone: 'pink'
  },
  'internal-auditor': {
    name: 'Internal Auditor', createEdit: [], approveSign: 'None', restriction: 'Read-only evidence', tone: 'neutral'
  },
  'administrator': {
    name: 'Administrator', createEdit: ['Users', 'Plans'], approveSign: 'None', restriction: 'No QA release or signing',
    tone: 'neutral'
  }
};
