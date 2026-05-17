import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import type { ExecutionStep, TensorData } from './types';

interface TensorInspectorProps {
  tensor?: TensorData | null;
  currentStep?: ExecutionStep;
}

export function TensorInspector({ tensor, currentStep }: TensorInspectorProps) {
  if (!tensor && !currentStep?.tensors.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-lg bg-gray-800/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm">No tensor selected</p>
          <p className="text-xs text-gray-600">Click on a tensor to inspect</p>
        </div>
      </div>
    );
  }

  const displayTensor = tensor || currentStep?.tensors[0];

  if (!displayTensor) return null;

  const isMatrix = Array.isArray(displayTensor.data[0]);
  const previewData = isMatrix 
    ? (displayTensor.data as number[][]).slice(0, 10)
    : (displayTensor.data as number[]).slice(0, 50);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="font-bold text-lg text-gray-100 mb-1">{displayTensor.name}</h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-gray-800/50 border-gray-700/50 text-xs">
            {displayTensor.dtype}
          </Badge>
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs">
            {displayTensor.shape.join(' × ')}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card className="bg-gray-800/30 border-gray-700/50 p-4">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500">Shape</span>
                <div className="text-sm text-gray-200 font-mono mt-1">
                  [{displayTensor.shape.join(', ')}]
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500">Data Type</span>
                <div className="text-sm text-gray-200 font-mono mt-1">
                  {displayTensor.dtype}
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500">Total Elements</span>
                <div className="text-sm text-gray-200 font-mono mt-1">
                  {displayTensor.shape.reduce((a, b) => a * b, 1).toLocaleString()}
                </div>
              </div>

              {displayTensor.memory && (
                <div>
                  <span className="text-xs text-gray-500">Memory Usage</span>
                  <div className="text-sm text-gray-200 font-mono mt-1">
                    {(displayTensor.memory / 1024).toFixed(2)} KB
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          <Card className="bg-gray-800/30 border-gray-700/50">
            <ScrollArea className="h-96">
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-2">
                  {isMatrix ? 'Matrix Preview (first 10 rows)' : 'Vector Preview (first 50 elements)'}
                </div>
                
                {isMatrix ? (
                  <div className="font-mono text-xs space-y-1">
                    {(previewData as number[][]).map((row, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-gray-600 w-6">{i}:</span>
                        <div className="flex-1 overflow-x-auto">
                          [{row.slice(0, 8).map(v => v.toFixed(4)).join(', ')}
                          {row.length > 8 && ', ...'}]
                        </div>
                      </div>
                    ))}
                    {(displayTensor.data as number[][]).length > 10 && (
                      <div className="text-gray-600">
                        ... {(displayTensor.data as number[][]).length - 10} more rows
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="font-mono text-xs">
                    <div className="grid grid-cols-4 gap-2">
                      {(previewData as number[]).map((val, i) => (
                        <div key={i} className="text-gray-300">
                          <span className="text-gray-600">[{i}]</span> {val.toFixed(4)}
                        </div>
                      ))}
                    </div>
                    {(displayTensor.data as number[]).length > 50 && (
                      <div className="text-gray-600 mt-2">
                        ... {(displayTensor.data as number[]).length - 50} more elements
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          {displayTensor.statistics ? (
            <div className="space-y-3">
              <Card className="bg-gray-800/30 border-gray-700/50 p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Mean</span>
                    <span className="text-sm text-gray-100 font-mono">
                      {displayTensor.statistics.mean.toFixed(6)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Variance</span>
                    <span className="text-sm text-gray-100 font-mono">
                      {displayTensor.statistics.variance.toFixed(6)}
                    </span>
                  </div>

                  {displayTensor.statistics.std !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Std Deviation</span>
                      <span className="text-sm text-gray-100 font-mono">
                        {displayTensor.statistics.std.toFixed(6)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Minimum</span>
                    <span className="text-sm text-gray-100 font-mono">
                      {displayTensor.statistics.min.toFixed(6)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Maximum</span>
                    <span className="text-sm text-gray-100 font-mono">
                      {displayTensor.statistics.max.toFixed(6)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Range</span>
                    <span className="text-sm text-gray-100 font-mono">
                      {(displayTensor.statistics.max - displayTensor.statistics.min).toFixed(6)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Distribution Visualization */}
              <Card className="bg-gray-800/30 border-gray-700/50 p-4">
                <div className="text-xs text-gray-500 mb-3">Value Distribution</div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Min</span>
                      <span>Mean</span>
                      <span>Max</span>
                    </div>
                    <div className="relative h-2 bg-gray-900 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-500" />
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-white"
                        style={{
                          left: `${
                            ((displayTensor.statistics.mean - displayTensor.statistics.min) / 
                            (displayTensor.statistics.max - displayTensor.statistics.min)) * 100
                          }%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No statistics available
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
