import { useState } from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { motion } from 'motion/react';

interface AttentionHeatmapProps {
  data: {
    weights: number[][][]; // [numHeads, seqLen, seqLen]
    tokens?: string[];
    sourceTokens?: string[];
    targetTokens?: string[];
    numHeads: number;
    masked?: boolean;
    crossAttention?: boolean;
  };
  onTensorSelect: (tensor: any) => void;
}

export function AttentionHeatmap({ data, onTensorSelect }: AttentionHeatmapProps) {
  const [selectedHead, setSelectedHead] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);

  const { weights, tokens, sourceTokens, targetTokens, numHeads, masked, crossAttention } = data;
  
  const displaySourceTokens = crossAttention ? sourceTokens : tokens;
  const displayTargetTokens = crossAttention ? targetTokens : tokens;

  if (!displaySourceTokens || !displayTargetTokens || !weights[selectedHead]) {
    return <div className="text-gray-500">No attention data available</div>;
  }

  const attentionMatrix = weights[selectedHead];

  const getColorForWeight = (weight: number) => {
    const intensity = Math.min(weight * 255, 255);
    return `rgba(6, 182, 212, ${weight})`; // Cyan color with varying opacity
  };

  return (
    <div className="space-y-4">
      {/* Head Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-400">Attention Head:</span>
        {Array.from({ length: numHeads }, (_, i) => (
          <Badge
            key={i}
            variant={selectedHead === i ? 'default' : 'outline'}
            className={`cursor-pointer transition-all ${
              selectedHead === i
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-800/50 border-gray-700/50 hover:border-cyan-500/50'
            }`}
            onClick={() => setSelectedHead(i)}
          >
            Head {i + 1}
          </Badge>
        ))}
      </div>

      {masked && (
        <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Causal Masking Applied (future tokens hidden)
        </div>
      )}

      {crossAttention && (
        <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Cross-Attention: Decoder → Encoder
        </div>
      )}

      {/* Heatmap */}
      <Card className="bg-gray-900/60 border-gray-700/50 p-6 overflow-x-auto">
        <TooltipProvider>
          <div className="inline-block min-w-full">
            {/* Column Headers (Keys/Source) */}
            <div className="flex mb-1">
              <div className="w-24" />
              <div className="flex gap-0.5">
                {displaySourceTokens.map((token, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-center text-xs text-gray-400 font-mono"
                    style={{ 
                      width: '60px',
                      writingMode: displaySourceTokens[0]?.match(/[\u0600-\u06FF]/) ? 'horizontal-tb' : 'vertical-lr',
                      transform: displaySourceTokens[0]?.match(/[\u0600-\u06FF]/) ? 'none' : 'rotate(180deg)'
                    }}
                  >
                    <span className="truncate">{token}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rows with labels and cells */}
            {displayTargetTokens.map((rowToken, i) => (
              <div key={i} className="flex gap-0.5 mb-0.5">
                {/* Row Header (Queries/Target) */}
                <div className="w-24 flex items-center justify-end pr-2 text-xs text-gray-400 font-mono">
                  <span className="truncate" dir={rowToken.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr'}>
                    {rowToken}
                  </span>
                </div>

                {/* Attention Cells */}
                {attentionMatrix[i]?.map((weight, j) => (
                  <Tooltip key={j}>
                    <TooltipTrigger asChild>
                      <motion.div
                        className="relative cursor-pointer border border-gray-800/50"
                        style={{
                          width: '60px',
                          height: '40px',
                          backgroundColor: getColorForWeight(weight)
                        }}
                        onMouseEnter={() => setHoveredCell({ i, j })}
                        onMouseLeave={() => setHoveredCell(null)}
                        whileHover={{ scale: 1.1, zIndex: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {weight > 0.5 && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                            {weight.toFixed(2)}
                          </div>
                        )}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <div className="font-semibold">
                          {crossAttention 
                            ? `"${displayTargetTokens[i]}" ← "${displaySourceTokens[j]}"`
                            : `"${displayTargetTokens[i]}" → "${displaySourceTokens[j]}"`
                          }
                        </div>
                        <div className="text-xs">
                          Attention Weight: <span className="font-mono text-cyan-400">{weight.toFixed(4)}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Position [{i}, {j}]
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}

            {/* Legend */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-xs text-gray-500">Attention Weight:</span>
              <div className="flex items-center gap-2">
                <div className="flex h-4 rounded overflow-hidden" style={{ width: '200px' }}>
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-1"
                      style={{ backgroundColor: getColorForWeight(i / 19) }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">0.0</span>
                <span className="text-xs text-gray-500">→</span>
                <span className="text-xs text-gray-500">1.0</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gray-800/30 border-gray-700/50 p-3">
          <div className="text-xs text-gray-500 mb-1">Avg Attention</div>
          <div className="text-lg font-bold text-cyan-400 font-mono">
            {(attentionMatrix.flat().reduce((a, b) => a + b, 0) / attentionMatrix.flat().length).toFixed(3)}
          </div>
        </Card>
        <Card className="bg-gray-800/30 border-gray-700/50 p-3">
          <div className="text-xs text-gray-500 mb-1">Max Weight</div>
          <div className="text-lg font-bold text-green-400 font-mono">
            {Math.max(...attentionMatrix.flat()).toFixed(3)}
          </div>
        </Card>
        <Card className="bg-gray-800/30 border-gray-700/50 p-3">
          <div className="text-xs text-gray-500 mb-1">Min Weight</div>
          <div className="text-lg font-bold text-blue-400 font-mono">
            {Math.min(...attentionMatrix.flat().filter(x => isFinite(x))).toFixed(3)}
          </div>
        </Card>
      </div>
    </div>
  );
}
