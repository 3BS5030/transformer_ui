import { useState } from 'react';
import { ChevronRight, ChevronDown, Circle, AlertCircle, CheckCircle2, Loader2, Dot } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { motion } from 'motion/react';
import type { ExecutionStep } from './types';

interface PipelineNavigatorProps {
  steps: ExecutionStep[];
  currentStepId?: string;
  breakpoints: Set<string>;
  onStepClick: (stepId: string) => void;
  onToggleBreakpoint: (stepId: string) => void;
}

export function PipelineNavigator({
  steps,
  currentStepId,
  breakpoints,
  onStepClick,
  onToggleBreakpoint
}: PipelineNavigatorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['input', 'tokenization', 'embedding', 'positional', 'encoder', 'decoder', 'output'])
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const groupedSteps = steps.reduce((acc, step) => {
    if (!acc[step.category]) {
      acc[step.category] = [];
    }
    acc[step.category].push(step);
    return acc;
  }, {} as Record<string, ExecutionStep[]>);

  const categories = [
    { id: 'input', name: 'Input', icon: '📥' },
    { id: 'tokenization', name: 'Tokenization', icon: '🔤' },
    { id: 'embedding', name: 'Embedding', icon: '🔢' },
    { id: 'positional', name: 'Positional Encoding', icon: '📍' },
    { id: 'encoder', name: 'Encoder Layers', icon: '🔵' },
    { id: 'decoder', name: 'Decoder Layers', icon: '🟣' },
    { id: 'output', name: 'Output', icon: '📤' }
  ];

  const getStepIcon = (step: ExecutionStep) => {
    if (breakpoints.has(step.id)) {
      return <Circle className="w-3 h-3 fill-red-500 text-red-500" />;
    }
    
    switch (step.status) {
      case 'running':
        return <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="w-3 h-3 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      case 'waiting':
        return <Circle className="w-3 h-3 text-gray-600" />;
      default:
        return <Dot className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="p-4 space-y-1">
        {categories.map(category => {
          const categorySteps = groupedSteps[category.id] || [];
          if (categorySteps.length === 0) return null;

          const isExpanded = expandedCategories.has(category.id);
          const hasCurrentStep = categorySteps.some(s => s.id === currentStepId);

          return (
            <div key={category.id} className="space-y-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  hasCurrentStep
                    ? 'bg-cyan-500/10 text-cyan-300'
                    : 'hover:bg-gray-800/50 text-gray-300'
                }`}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span className="mr-1">{category.icon}</span>
                <span className="flex-1 text-left font-medium">{category.name}</span>
                <Badge variant="outline" className="text-xs bg-gray-800/50 border-gray-700/50">
                  {categorySteps.length}
                </Badge>
              </button>

              {/* Category Steps */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-2 space-y-0.5 border-l-2 border-gray-800/50 pl-2"
                >
                  {categorySteps.map(step => {
                    const isActive = step.id === currentStepId;
                    const hasBreakpoint = breakpoints.has(step.id);

                    return (
                      <Tooltip key={step.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onStepClick(step.id)}
                            onDoubleClick={() => onToggleBreakpoint(step.id)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-100'
                                : hasBreakpoint
                                ? 'bg-red-500/10 border border-red-500/20 text-gray-300 hover:bg-red-500/20'
                                : 'hover:bg-gray-800/50 text-gray-400 hover:text-gray-300'
                            }`}
                          >
                            {getStepIcon(step)}
                            <span className="flex-1 text-left truncate">{step.name}</span>
                            
                            {step.tensors.length > 0 && (
                              <Badge 
                                variant="outline" 
                                className="text-[10px] px-1 py-0 bg-gray-900/50 border-gray-700/50"
                              >
                                {step.tensors[0].shape.join('×')}
                              </Badge>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-semibold">{step.name}</p>
                            <p className="text-xs text-gray-400">{step.description}</p>
                            {step.tensors.length > 0 && (
                              <div className="text-xs text-gray-500 mt-2">
                                <div>Shape: {step.tensors[0].shape.join(' × ')}</div>
                                <div>Type: {step.tensors[0].dtype}</div>
                              </div>
                            )}
                            <p className="text-xs text-gray-600 mt-2">
                              Double-click to toggle breakpoint
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
