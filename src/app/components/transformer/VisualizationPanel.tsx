import { ScrollArea } from '../ui/scroll-area';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AttentionHeatmap } from './visualizations/AttentionHeatmap';
import { MatrixVisualization } from './visualizations/MatrixVisualization';
import { TokenVisualization } from './visualizations/TokenVisualization';
import { FlowVisualization } from './visualizations/FlowVisualization';
import { motion } from 'motion/react';
import type { ExecutionStep } from './types';

interface VisualizationPanelProps {
  currentStep?: ExecutionStep;
  onTensorSelect: (tensor: any) => void;
}

export function VisualizationPanel({ currentStep, onTensorSelect }: VisualizationPanelProps) {
  if (!currentStep) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Ready to Debug</h3>
            <p className="text-sm text-gray-400">Click "Run" to start executing the Transformer</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        {/* Step Header */}
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">{currentStep.name}</h2>
              <p className="text-sm text-gray-400">{currentStep.description}</p>
            </div>
            <Badge 
              variant="outline" 
              className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs"
            >
              {currentStep.category.toUpperCase()}
            </Badge>
          </div>

          {/* Metadata */}
          {currentStep.layerIndex !== undefined && (
            <div className="flex gap-2 mb-4">
              <Badge variant="outline" className="bg-gray-800/50 border-gray-700/50">
                Layer {currentStep.layerIndex + 1}
              </Badge>
              {currentStep.headIndex !== undefined && (
                <Badge variant="outline" className="bg-gray-800/50 border-gray-700/50">
                  Head {currentStep.headIndex + 1}
                </Badge>
              )}
            </div>
          )}
        </motion.div>

        {/* Main Visualization */}
        <motion.div
          key={`${currentStep.id}-viz`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700/50 overflow-hidden">
            <div className="p-6">
              {currentStep.visualization?.type === 'attention' && (
                <AttentionHeatmap
                  data={currentStep.visualization.data}
                  onTensorSelect={onTensorSelect}
                />
              )}

              {currentStep.visualization?.type === 'matrix' && (
                <MatrixVisualization
                  data={currentStep.visualization.data}
                  onTensorSelect={onTensorSelect}
                />
              )}

              {currentStep.visualization?.type === 'heatmap' && (
                <MatrixVisualization
                  data={currentStep.visualization.data}
                  onTensorSelect={onTensorSelect}
                  showHeatmap
                />
              )}

              {currentStep.visualization?.type === 'tokens' && (
                <TokenVisualization
                  data={currentStep.visualization.data}
                  onTensorSelect={onTensorSelect}
                />
              )}

              {currentStep.visualization?.type === 'flow' && (
                <FlowVisualization
                  data={currentStep.visualization.data}
                  onTensorSelect={onTensorSelect}
                />
              )}

              {!currentStep.visualization && (
                <div className="text-center py-12 text-gray-500">
                  No visualization available for this step
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Tensors Grid */}
        {currentStep.tensors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Tensors ({currentStep.tensors.length})</h3>
            <div className="grid grid-cols-2 gap-4">
              {currentStep.tensors.map((tensor, idx) => (
                <Card
                  key={idx}
                  className="bg-gray-800/40 border-gray-700/50 hover:border-cyan-500/30 transition-all cursor-pointer group"
                  onClick={() => onTensorSelect(tensor)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-200 group-hover:text-cyan-400 transition-colors">
                          {tensor.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Shape: {tensor.shape.join(' × ')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs bg-gray-900/50 border-gray-700/50">
                        {tensor.dtype}
                      </Badge>
                    </div>

                    {tensor.statistics && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Mean:</span>
                          <span className="ml-2 text-gray-300 font-mono">
                            {tensor.statistics.mean.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Std:</span>
                          <span className="ml-2 text-gray-300 font-mono">
                            {tensor.statistics.std?.toFixed(4) ?? 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Min:</span>
                          <span className="ml-2 text-gray-300 font-mono">
                            {tensor.statistics.min.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Max:</span>
                          <span className="ml-2 text-gray-300 font-mono">
                            {tensor.statistics.max.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </ScrollArea>
  );
}
