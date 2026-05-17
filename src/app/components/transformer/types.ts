export type ExecutionState = 'idle' | 'running' | 'paused' | 'complete' | 'error';
export type DebugMode = 'step' | 'auto' | 'breakpoint';
export type StepStatus = 'waiting' | 'running' | 'complete' | 'error' | 'breakpoint';

export interface TensorData {
  name: string;
  shape: number[];
  data: number[] | number[][];
  dtype: string;
  memory?: number;
  statistics?: {
    mean: number;
    variance: number;
    min: number;
    max: number;
    std?: number;
  };
}

export interface AttentionHead {
  headIndex: number;
  queries: number[][];
  keys: number[][];
  values: number[][];
  scores: number[][];
  weights: number[][];
  output: number[][];
}

export interface Equation {
  id: string;
  latex: string;
  description: string;
  variables?: Record<string, string>;
  result?: string;
}

export interface ExecutionStep {
  id: string;
  name: string;
  category: 'input' | 'tokenization' | 'embedding' | 'positional' | 'encoder' | 'decoder' | 'output';
  status: StepStatus;
  description: string;
  tensors: TensorData[];
  visualization?: {
    type: 'matrix' | 'heatmap' | 'graph' | 'attention' | 'tokens' | 'equation' | 'flow';
    data: any;
  };
  equations?: Equation[];
  layerIndex?: number;
  headIndex?: number;
  metadata?: {
    inputTokens?: string[];
    outputTokens?: string[];
    tokenIds?: number[];
    embeddings?: number[][];
    attentionWeights?: number[][][];
    predictions?: Array<{ token: string; probability: number }>;
  };
  children?: ExecutionStep[];
}

export interface TransformerConfig {
  vocabSize: number;
  dModel: number;
  numLayers: number;
  numHeads: number;
  dff: number;
  maxSeqLength: number;
  dropoutRate: number;
}
