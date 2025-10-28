import { Node } from "@xyflow/react";

export interface CloudConfig {
  provider: 'google-cloud';
  storage: {
    autoGenerate: boolean;
    bucketName: string;
    region: string;
    storageClass: 'standard' | 'nearline' | 'coldline';
  };
  database: {
    enabled: boolean;
    type: 'firestore' | 'bigtable' | 'none';
    autoScale: boolean;
  };
  scaling: {
    minInstances: number;
    maxInstances: number;
    autoScaling: boolean;
  };
  monitoring: {
    enabled: boolean;
    retentionDays: number;
  };
}

export interface CloudInfrastructureNeeds {
  requiresCloud: boolean;
  storage: boolean;
  database: boolean;
  api: boolean;
  monitoring: boolean;
}

export const CLOUD_INFRA_NODE_TYPES = [
  'store_records',
  'fetch_external_data', 
  'process_data',
  'file_upload',
  'data_transformation',
  'api_call',
  'database_query',
  'webhook_trigger',
  'bigquery',
  'firestore',
  'Store Records',
  'Fetch External Data',
  'Process Data'
];

export function detectCloudNeeds(
  nodes: Node[], 
  template?: string
): CloudInfrastructureNeeds {
  const needs = {
    requiresCloud: false,
    storage: false,
    database: false,
    api: false,
    monitoring: false
  };

  // Template-based detection
  if (template === 'broiler-data-infra' || template === 'broiler-cloud-infra') {
    needs.requiresCloud = true;
    needs.storage = true;
    needs.database = true;
    needs.api = true;
    needs.monitoring = true;
  }

  // Node-based detection
  nodes.forEach(node => {
    const nodeType = node.data?.label || node.type;
    const nodeTypeLower = nodeType.toLowerCase();
    
    if (CLOUD_INFRA_NODE_TYPES.some(type => nodeTypeLower.includes(type.toLowerCase()))) {
      needs.requiresCloud = true;
      
      if (nodeTypeLower.includes('store') || nodeTypeLower.includes('record')) {
        needs.storage = true;
        needs.database = true;
      }
      
      if (nodeTypeLower.includes('fetch') || nodeTypeLower.includes('external') || nodeTypeLower.includes('api')) {
        needs.api = true;
      }
      
      if (nodeTypeLower.includes('process') || nodeTypeLower.includes('data')) {
        needs.storage = true;
      }
    }
  });

  // Enable monitoring for complex workflows
  if (nodes.length > 8) {
    needs.monitoring = true;
  }

  return needs;
}

export function generateBucketName(agentName: string, environment: string): string {
  const sanitized = agentName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  return `${sanitized}-${environment}-storage`;
}

export const defaultCloudConfig: CloudConfig = {
  provider: 'google-cloud',
  storage: {
    autoGenerate: true,
    bucketName: '',
    region: 'us-central1',
    storageClass: 'standard'
  },
  database: {
    enabled: true,
    type: 'firestore',
    autoScale: true
  },
  scaling: {
    minInstances: 1,
    maxInstances: 10,
    autoScaling: true
  },
  monitoring: {
    enabled: true,
    retentionDays: 30
  }
};

