// src/lib/profile-pipeline/types.ts
// Type definitions for the automated profile pipeline

export interface ValidationCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  checksPerformed: number;
  checksPassed: number;
  checksFailed: number;
  checks: ValidationCheck[];
  crossReference: {
    sourcesAgree: boolean;
    conflicts: { field: string; sources: { source: string; value: any }[] }[];
  };
  links: {
    total: number;
    valid: number;
    invalid: number;
    unchecked: number;
    details: { url: string; status: 'valid' | 'invalid' | 'unchecked' }[];
  };
}

export interface ProfileFlag {
  id: string;
  type: 'missing_data' | 'invalid_link' | 'low_confidence' | 'data_conflict' | 'stale_data';
  severity: 'high' | 'medium' | 'low';
  field?: string;
  message: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ProfileVersion {
  versionId: string;
  creatorId: string;
  version: number;
  trigger: 'initial_creation' | 'auto_refresh' | 'manual_update' | 'admin_edit';
  data: any;
  changes: { field: string; oldValue: any; newValue: any }[];
  confidence: number;
  dataSources: string[];
  flags: ProfileFlag[];
  createdAt: string;
  createdBy: string;
}

export interface RefreshSchedule {
  creatorId: string;
  lastRefreshed: string;
  nextRefresh: string;
  refreshCount: number;
  priority: 'high' | 'normal' | 'low';
}

export interface PipelineResult {
  success: boolean;
  creatorId: string | null;
  slug: string | null;
  action: 'created' | 'updated' | 'skipped' | 'failed';
  confidence: { score: number; level: string };
  flags: ProfileFlag[];
  dataSources: string[];
  processingTimeMs: number;
  error?: string;
}
