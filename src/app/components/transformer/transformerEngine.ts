import type { ExecutionStep, TensorData } from './types';

// Mock Transformer execution engine
export function generateTransformerExecution(inputText: string, task: string): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  
  // Arabic text tokenization
  const arabicTokens = inputText.split(' ');
  const tokenIds = arabicTokens.map((_, i) => 435 + i * 100);
  
  // Step 1: Input
  steps.push({
    id: 'input',
    name: 'Input Text',
    category: 'input',
    status: 'complete',
    description: 'Raw Arabic text input',
    tensors: [],
    visualization: {
      type: 'tokens',
      data: { text: inputText, language: 'ar' }
    },
    metadata: {
      inputTokens: [inputText]
    }
  });

  // Step 2: Tokenization
  steps.push({
    id: 'tokenization',
    name: 'Tokenization',
    category: 'tokenization',
    status: 'complete',
    description: 'Split text into tokens using BPE tokenizer',
    tensors: [{
      name: 'token_ids',
      shape: [arabicTokens.length],
      data: tokenIds,
      dtype: 'int32',
      statistics: {
        mean: tokenIds.reduce((a, b) => a + b, 0) / tokenIds.length,
        variance: 0,
        min: Math.min(...tokenIds),
        max: Math.max(...tokenIds)
      }
    }],
    visualization: {
      type: 'tokens',
      data: { tokens: arabicTokens, ids: tokenIds }
    },
    metadata: {
      inputTokens: arabicTokens,
      tokenIds
    }
  });

  // Step 3: Embedding
  const dModel = 512;
  const embeddings = generateRandomMatrix(arabicTokens.length, dModel);
  
  steps.push({
    id: 'embedding',
    name: 'Token Embedding',
    category: 'embedding',
    status: 'complete',
    description: `Map token IDs to ${dModel}-dimensional vectors`,
    tensors: [{
      name: 'embeddings',
      shape: [arabicTokens.length, dModel],
      data: embeddings,
      dtype: 'float32',
      memory: arabicTokens.length * dModel * 4,
      statistics: calculateStatistics(embeddings.flat())
    }],
    visualization: {
      type: 'heatmap',
      data: { matrix: embeddings.slice(0, 10), labels: arabicTokens }
    },
    equations: [{
      id: 'embed',
      latex: 'E = W_e \\cdot X',
      description: 'Embedding lookup',
      variables: {
        'W_e': `[vocab_size=${50000}, d_model=${dModel}]`,
        'X': `[batch_size=1, seq_len=${arabicTokens.length}]`
      },
      result: `[${arabicTokens.length}, ${dModel}]`
    }],
    metadata: {
      embeddings
    }
  });

  // Step 4: Positional Encoding
  const posEncoding = generatePositionalEncoding(arabicTokens.length, dModel);
  const embeddedWithPos = embeddings.map((row, i) => 
    row.map((val, j) => val + posEncoding[i][j])
  );

  steps.push({
    id: 'positional',
    name: 'Positional Encoding',
    category: 'positional',
    status: 'complete',
    description: 'Add position information using sine/cosine functions',
    tensors: [
      {
        name: 'pos_encoding',
        shape: [arabicTokens.length, dModel],
        data: posEncoding,
        dtype: 'float32',
        statistics: calculateStatistics(posEncoding.flat())
      },
      {
        name: 'embedded_with_pos',
        shape: [arabicTokens.length, dModel],
        data: embeddedWithPos,
        dtype: 'float32',
        statistics: calculateStatistics(embeddedWithPos.flat())
      }
    ],
    visualization: {
      type: 'heatmap',
      data: { matrix: posEncoding, labels: arabicTokens }
    },
    equations: [
      {
        id: 'pos_even',
        latex: 'PE_{(pos,2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right)',
        description: 'Positional encoding for even dimensions',
        variables: {
          'pos': 'token position',
          'i': 'dimension index',
          'd_model': String(dModel)
        }
      },
      {
        id: 'pos_odd',
        latex: 'PE_{(pos,2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right)',
        description: 'Positional encoding for odd dimensions'
      }
    ]
  });

  // Encoder Layers
  const numLayers = 6;
  const numHeads = 8;
  let encoderOutput = embeddedWithPos;

  for (let layer = 0; layer < numLayers; layer++) {
    // Multi-head attention
    const attentionWeights = generateAttentionWeights(arabicTokens.length, numHeads);
    const attentionOutput = generateRandomMatrix(arabicTokens.length, dModel);

    steps.push({
      id: `encoder-attention-${layer}`,
      name: `Encoder Layer ${layer + 1}: Multi-Head Attention`,
      category: 'encoder',
      status: 'complete',
      description: `${numHeads} parallel attention mechanisms`,
      layerIndex: layer,
      tensors: [
        {
          name: 'Q (Queries)',
          shape: [arabicTokens.length, dModel],
          data: generateRandomMatrix(arabicTokens.length, dModel),
          dtype: 'float32',
          statistics: calculateStatistics(encoderOutput.flat())
        },
        {
          name: 'K (Keys)',
          shape: [arabicTokens.length, dModel],
          data: generateRandomMatrix(arabicTokens.length, dModel),
          dtype: 'float32',
          statistics: calculateStatistics(encoderOutput.flat())
        },
        {
          name: 'V (Values)',
          shape: [arabicTokens.length, dModel],
          data: generateRandomMatrix(arabicTokens.length, dModel),
          dtype: 'float32',
          statistics: calculateStatistics(encoderOutput.flat())
        },
        {
          name: 'attention_output',
          shape: [arabicTokens.length, dModel],
          data: attentionOutput,
          dtype: 'float32',
          statistics: calculateStatistics(attentionOutput.flat())
        }
      ],
      visualization: {
        type: 'attention',
        data: { 
          weights: attentionWeights, 
          tokens: arabicTokens,
          numHeads 
        }
      },
      equations: [
        {
          id: 'qkv',
          latex: 'Q = XW^Q, \\quad K = XW^K, \\quad V = XW^V',
          description: 'Linear projections for queries, keys, values'
        },
        {
          id: 'attention',
          latex: 'Attention(Q,K,V) = softmax\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
          description: 'Scaled dot-product attention',
          variables: {
            'd_k': String(dModel / numHeads)
          }
        }
      ],
      metadata: {
        attentionWeights
      }
    });

    // Add & Norm
    const residualOutput = encoderOutput.map((row, i) => 
      row.map((val, j) => val + attentionOutput[i][j])
    );
    const normalized = normalizeMatrix(residualOutput);

    steps.push({
      id: `encoder-norm1-${layer}`,
      name: `Encoder Layer ${layer + 1}: Add & Norm`,
      category: 'encoder',
      status: 'complete',
      description: 'Residual connection + Layer Normalization',
      layerIndex: layer,
      tensors: [
        {
          name: 'residual',
          shape: [arabicTokens.length, dModel],
          data: residualOutput,
          dtype: 'float32',
          statistics: calculateStatistics(residualOutput.flat())
        },
        {
          name: 'normalized',
          shape: [arabicTokens.length, dModel],
          data: normalized,
          dtype: 'float32',
          statistics: calculateStatistics(normalized.flat())
        }
      ],
      visualization: {
        type: 'matrix',
        data: { matrix: normalized.slice(0, 5) }
      },
      equations: [
        {
          id: 'residual',
          latex: 'x_{residual} = x + Attention(x)',
          description: 'Residual connection'
        },
        {
          id: 'layernorm',
          latex: 'LayerNorm(x) = \\gamma \\frac{x - \\mu}{\\sqrt{\\sigma^2 + \\epsilon}} + \\beta',
          description: 'Layer normalization'
        }
      ]
    });

    // Feed Forward
    const ffOutput = generateRandomMatrix(arabicTokens.length, dModel);
    
    steps.push({
      id: `encoder-ff-${layer}`,
      name: `Encoder Layer ${layer + 1}: Feed Forward`,
      category: 'encoder',
      status: 'complete',
      description: 'Position-wise fully connected network',
      layerIndex: layer,
      tensors: [
        {
          name: 'ff_output',
          shape: [arabicTokens.length, dModel],
          data: ffOutput,
          dtype: 'float32',
          statistics: calculateStatistics(ffOutput.flat())
        }
      ],
      visualization: {
        type: 'flow',
        data: { 
          input: dModel,
          hidden: 2048,
          output: dModel
        }
      },
      equations: [
        {
          id: 'ffn',
          latex: 'FFN(x) = max(0, xW_1 + b_1)W_2 + b_2',
          description: 'Two-layer feed-forward network with ReLU',
          variables: {
            'W_1': `[${dModel}, 2048]`,
            'W_2': `[2048, ${dModel}]`
          }
        }
      ]
    });

    encoderOutput = normalizeMatrix(ffOutput.map((row, i) => 
      row.map((val, j) => val + normalized[i][j])
    ));
  }

  // Decoder
  const englishTokens = ['I', 'love', 'learning', 'artificial', 'intelligence'];
  
  for (let layer = 0; layer < numLayers; layer++) {
    // Masked self-attention
    const maskedWeights = generateMaskedAttentionWeights(englishTokens.length, numHeads);
    
    steps.push({
      id: `decoder-masked-attention-${layer}`,
      name: `Decoder Layer ${layer + 1}: Masked Self-Attention`,
      category: 'decoder',
      status: 'complete',
      description: 'Prevent attending to future tokens',
      layerIndex: layer,
      tensors: [
        {
          name: 'masked_attention_output',
          shape: [englishTokens.length, dModel],
          data: generateRandomMatrix(englishTokens.length, dModel),
          dtype: 'float32',
          statistics: calculateStatistics(encoderOutput.flat())
        }
      ],
      visualization: {
        type: 'attention',
        data: { 
          weights: maskedWeights, 
          tokens: englishTokens,
          numHeads,
          masked: true 
        }
      },
      equations: [
        {
          id: 'mask',
          latex: 'mask_{ij} = \\begin{cases} 0 & \\text{if } i \\geq j \\\\ -\\infty & \\text{if } i < j \\end{cases}',
          description: 'Causal masking matrix'
        }
      ]
    });

    // Cross-attention
    const crossAttentionWeights = generateCrossAttentionWeights(
      englishTokens.length, 
      arabicTokens.length, 
      numHeads
    );

    steps.push({
      id: `decoder-cross-attention-${layer}`,
      name: `Decoder Layer ${layer + 1}: Cross-Attention`,
      category: 'decoder',
      status: 'complete',
      description: 'Decoder attends to encoder outputs',
      layerIndex: layer,
      tensors: [
        {
          name: 'cross_attention_output',
          shape: [englishTokens.length, dModel],
          data: generateRandomMatrix(englishTokens.length, dModel),
          dtype: 'float32',
          statistics: calculateStatistics(encoderOutput.flat())
        }
      ],
      visualization: {
        type: 'attention',
        data: { 
          weights: crossAttentionWeights, 
          sourceTokens: arabicTokens,
          targetTokens: englishTokens,
          numHeads,
          crossAttention: true 
        }
      },
      equations: [
        {
          id: 'cross_attn',
          latex: 'Attention(Q_{dec}, K_{enc}, V_{enc})',
          description: 'Cross-attention: Queries from decoder, Keys/Values from encoder'
        }
      ]
    });

    // Feed Forward
    steps.push({
      id: `decoder-ff-${layer}`,
      name: `Decoder Layer ${layer + 1}: Feed Forward`,
      category: 'decoder',
      status: 'complete',
      description: 'Position-wise fully connected network',
      layerIndex: layer,
      tensors: [
        {
          name: 'ff_output',
          shape: [englishTokens.length, dModel],
          data: generateRandomMatrix(englishTokens.length, dModel),
          dtype: 'float32',
          statistics: calculateStatistics(encoderOutput.flat())
        }
      ],
      visualization: {
        type: 'flow',
        data: { 
          input: dModel,
          hidden: 2048,
          output: dModel
        }
      }
    });
  }

  // Final Linear + Softmax
  const vocabSize = 50000;
  const logits = generateRandomMatrix(englishTokens.length, vocabSize);
  const probabilities = logits.map(row => softmax(row.slice(0, 10))); // Top 10 for display

  steps.push({
    id: 'output-linear',
    name: 'Linear Projection',
    category: 'output',
    status: 'complete',
    description: 'Project to vocabulary size',
    tensors: [
      {
        name: 'logits',
        shape: [englishTokens.length, vocabSize],
        data: logits.slice(0, 5).map(r => r.slice(0, 100)),
        dtype: 'float32',
        statistics: calculateStatistics(logits.flat().slice(0, 1000))
      }
    ],
    visualization: {
      type: 'matrix',
      data: { matrix: logits.slice(0, 5).map(r => r.slice(0, 20)) }
    },
    equations: [
      {
        id: 'linear',
        latex: 'logits = xW_{vocab} + b',
        description: 'Linear transformation to vocabulary space',
        variables: {
          'W_vocab': `[${dModel}, ${vocabSize}]`
        }
      }
    ]
  });

  steps.push({
    id: 'output-softmax',
    name: 'Softmax & Token Prediction',
    category: 'output',
    status: 'complete',
    description: 'Convert logits to probabilities',
    tensors: [
      {
        name: 'probabilities',
        shape: [englishTokens.length, 10],
        data: probabilities,
        dtype: 'float32',
        statistics: calculateStatistics(probabilities.flat())
      }
    ],
    visualization: {
      type: 'tokens',
      data: { 
        predictions: englishTokens.map((token, i) => ({
          token,
          probability: probabilities[i][0],
          topCandidates: [
            { token, prob: probabilities[i][0] },
            { token: token + '_alt1', prob: probabilities[i][1] },
            { token: token + '_alt2', prob: probabilities[i][2] }
          ]
        }))
      }
    },
    equations: [
      {
        id: 'softmax',
        latex: 'P(y_i) = \\frac{e^{z_i}}{\\sum_{j} e^{z_j}}',
        description: 'Softmax normalization',
        result: 'Probability distribution over vocabulary'
      }
    ],
    metadata: {
      outputTokens: englishTokens,
      predictions: englishTokens.map((token, i) => ({
        token,
        probability: probabilities[i][0]
      }))
    }
  });

  return steps;
}

// Helper functions
function generateRandomMatrix(rows: number, cols: number): number[][] {
  return Array(rows).fill(0).map(() => 
    Array(cols).fill(0).map(() => (Math.random() - 0.5) * 2)
  );
}

function generatePositionalEncoding(seqLen: number, dModel: number): number[][] {
  const encoding: number[][] = [];
  for (let pos = 0; pos < seqLen; pos++) {
    const row: number[] = [];
    for (let i = 0; i < dModel; i++) {
      const angle = pos / Math.pow(10000, (2 * Math.floor(i / 2)) / dModel);
      row.push(i % 2 === 0 ? Math.sin(angle) : Math.cos(angle));
    }
    encoding.push(row);
  }
  return encoding;
}

function generateAttentionWeights(seqLen: number, numHeads: number): number[][][] {
  return Array(numHeads).fill(0).map(() => {
    const weights = generateRandomMatrix(seqLen, seqLen);
    return weights.map(row => softmax(row));
  });
}

function generateMaskedAttentionWeights(seqLen: number, numHeads: number): number[][][] {
  return Array(numHeads).fill(0).map(() => {
    const weights = generateRandomMatrix(seqLen, seqLen);
    return weights.map((row, i) => {
      const masked = row.map((val, j) => j > i ? -Infinity : val);
      return softmax(masked);
    });
  });
}

function generateCrossAttentionWeights(targetLen: number, sourceLen: number, numHeads: number): number[][][] {
  return Array(numHeads).fill(0).map(() => {
    const weights = Array(targetLen).fill(0).map(() => 
      Array(sourceLen).fill(0).map(() => Math.random())
    );
    return weights.map(row => softmax(row));
  });
}

function softmax(arr: number[]): number[] {
  const validArr = arr.map(x => isFinite(x) ? x : -1e10);
  const max = Math.max(...validArr);
  const exps = validArr.map(x => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / sum);
}

function normalizeMatrix(matrix: number[][]): number[][] {
  return matrix.map(row => {
    const mean = row.reduce((a, b) => a + b, 0) / row.length;
    const variance = row.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / row.length;
    const std = Math.sqrt(variance + 1e-5);
    return row.map(val => (val - mean) / std);
  });
}

function calculateStatistics(arr: number[]) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  return {
    mean,
    variance,
    min: Math.min(...arr),
    max: Math.max(...arr),
    std: Math.sqrt(variance)
  };
}
