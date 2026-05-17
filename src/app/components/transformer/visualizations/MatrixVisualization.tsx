import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

interface MatrixVisualizationProps {
  data: {
    matrix: number[][];
    labels?: string[];
  };
  onTensorSelect: (tensor: any) => void;
  showHeatmap?: boolean;
}

export function MatrixVisualization({ data, onTensorSelect, showHeatmap = false }: MatrixVisualizationProps) {
  const { matrix, labels } = data;

  if (!matrix || matrix.length === 0) {
    return <div className="text-gray-500">No matrix data available</div>;
  }

  const getColorForValue = (value: number, min: number, max: number) => {
    const normalized = (value - min) / (max - min);
    
    if (normalized > 0.5) {
      const intensity = (normalized - 0.5) * 2;
      return `rgba(34, 197, 94, ${0.2 + intensity * 0.6})`; // Green for positive
    } else {
      const intensity = (0.5 - normalized) * 2;
      return `rgba(59, 130, 246, ${0.2 + intensity * 0.6})`; // Blue for negative
    }
  };

  const flatValues = matrix.flat();
  const min = Math.min(...flatValues);
  const max = Math.max(...flatValues);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Matrix Display */}
        <Card className="bg-gray-900/60 border-gray-700/50 p-4 overflow-x-auto">
          <div className="inline-block">
            <div className="flex flex-col gap-0.5">
              {matrix.map((row, i) => (
                <div key={i} className="flex gap-0.5">
                  {/* Row Label */}
                  {labels && (
                    <div className="w-20 flex items-center justify-end pr-2 text-xs text-gray-400 font-mono">
                      <span className="truncate" dir={labels[i]?.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr'}>
                        {labels[i]}
                      </span>
                    </div>
                  )}

                  {/* Matrix Cells */}
                  {row.slice(0, 20).map((value, j) => (
                    <Tooltip key={j}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex items-center justify-center text-[10px] font-mono cursor-pointer border border-gray-800/50 transition-transform hover:scale-110 hover:z-10"
                          style={{
                            width: showHeatmap ? '40px' : '60px',
                            height: '30px',
                            backgroundColor: showHeatmap ? getColorForValue(value, min, max) : 'rgba(17, 24, 39, 0.5)',
                            color: showHeatmap 
                              ? Math.abs(value - min) / (max - min) > 0.5 ? 'white' : 'rgb(156, 163, 175)'
                              : 'rgb(209, 213, 219)'
                          }}
                        >
                          {value.toFixed(2)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="text-xs">
                            Position: [{i}, {j}]
                          </div>
                          <div className="text-xs">
                            Value: <span className="font-mono text-cyan-400">{value.toFixed(6)}</span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}

                  {row.length > 20 && (
                    <div className="flex items-center px-2 text-xs text-gray-600">
                      ... +{row.length - 20} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Stats */}
        {showHeatmap && (
          <div className="grid grid-cols-4 gap-3">
            <Card className="bg-gray-800/30 border-gray-700/50 p-3">
              <div className="text-xs text-gray-500 mb-1">Min Value</div>
              <div className="text-sm font-bold text-blue-400 font-mono">
                {min.toFixed(4)}
              </div>
            </Card>
            <Card className="bg-gray-800/30 border-gray-700/50 p-3">
              <div className="text-xs text-gray-500 mb-1">Max Value</div>
              <div className="text-sm font-bold text-green-400 font-mono">
                {max.toFixed(4)}
              </div>
            </Card>
            <Card className="bg-gray-800/30 border-gray-700/50 p-3">
              <div className="text-xs text-gray-500 mb-1">Mean</div>
              <div className="text-sm font-bold text-cyan-400 font-mono">
                {(flatValues.reduce((a, b) => a + b, 0) / flatValues.length).toFixed(4)}
              </div>
            </Card>
            <Card className="bg-gray-800/30 border-gray-700/50 p-3">
              <div className="text-xs text-gray-500 mb-1">Range</div>
              <div className="text-sm font-bold text-purple-400 font-mono">
                {(max - min).toFixed(4)}
              </div>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
