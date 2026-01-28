export interface BOMItem {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
  level: number;
  materialSpec?: string;
  notes?: string;
  children?: string[];
}

export interface MBOMItem extends BOMItem {
  workCenter?: string;
  tooling?: string[];
  processSteps?: string[];
  changeType: 'added' | 'modified' | 'unchanged' | 'grouped';
  confidence: number;
  reasoning: string;
  alternatives?: {
    description: string;
    confidence: number;
  }[];
}

export interface ConversionStatus {
  conversionId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  currentStage?: 'parsing' | 'analysis' | 'generation' | 'validation' | 'complete';
  stages: {
    parsing: 'pending' | 'in_progress' | 'completed' | 'failed';
    analysis: 'pending' | 'in_progress' | 'completed' | 'failed';
    generation: 'pending' | 'in_progress' | 'completed' | 'failed';
    validation: 'pending' | 'in_progress' | 'completed' | 'failed';
  };
  estimatedTimeRemaining?: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface ConversionHistory {
  conversionId: string;
  fileName: string;
  status: string;
  ebomPartCount: number;
  mbomPartCount: number;
  confidenceScore: number;
  timeTaken: number;
  createdAt: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
