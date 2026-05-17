import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Play, Pause, SkipForward, SkipBack, Square, Zap, 
  Circle, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';
import { PipelineNavigator } from './transformer/PipelineNavigator';
import { VisualizationPanel } from './transformer/VisualizationPanel';
import { TensorInspector } from './transformer/TensorInspector';
import { EquationViewer } from './transformer/EquationViewer';
import { DebugToolbar } from './transformer/DebugToolbar';
import { generateTransformerExecution } from './transformer/transformerEngine';
import type { ExecutionStep, ExecutionState, DebugMode } from './transformer/types';

export function TransformerDebugger() {
  const [inputText, setInputText] = useState('أنا أحب تعلم الذكاء الاصطناعي');
  const [task, setTask] = useState('translation-ar-en');
  const [debugMode, setDebugMode] = useState<DebugMode>('step');
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [breakpoints, setBreakpoints] = useState<Set<string>>(new Set());
  const [selectedTensor, setSelectedTensor] = useState<any>(null);
  const [autoRunSpeed, setAutoRunSpeed] = useState(1000);

  const currentStep = steps[currentStepIndex];

  const handleRun = () => {
    if (executionState === 'idle') {
      const generatedSteps = generateTransformerExecution(inputText, task);
      setSteps(generatedSteps);
      setCurrentStepIndex(0);
      setExecutionState('running');
    } else if (executionState === 'paused') {
      setExecutionState('running');
    }
  };

  const handlePause = () => {
    setExecutionState('paused');
  };

  const handleStop = () => {
    setExecutionState('idle');
    setCurrentStepIndex(0);
    setSelectedTensor(null);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setExecutionState('complete');
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      if (executionState === 'complete') {
        setExecutionState('paused');
      }
    }
  };

  const handleStepClick = (stepId: string) => {
    const index = steps.findIndex(s => s.id === stepId);
    if (index !== -1) {
      setCurrentStepIndex(index);
      if (executionState === 'idle') {
        setExecutionState('paused');
      }
    }
  };

  const toggleBreakpoint = (stepId: string) => {
    setBreakpoints(prev => {
      const newBreakpoints = new Set(prev);
      if (newBreakpoints.has(stepId)) {
        newBreakpoints.delete(stepId);
      } else {
        newBreakpoints.add(stepId);
      }
      return newBreakpoints;
    });
  };

  // Auto-run logic
  useEffect(() => {
    if (executionState === 'running' && debugMode === 'auto') {
      const timer = setTimeout(() => {
        handleNext();
      }, autoRunSpeed);
      return () => clearTimeout(timer);
    }
  }, [executionState, currentStepIndex, debugMode, autoRunSpeed]);

  // Breakpoint logic
  useEffect(() => {
    if (executionState === 'running' && currentStep && breakpoints.has(currentStep.id)) {
      setExecutionState('paused');
    }
  }, [currentStepIndex, executionState]);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  TransformerViz
                </h1>
                <p className="text-xs text-gray-400">Research-Grade Neural Network Debugger</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-gray-800/50 text-cyan-400 border-cyan-500/30">
              {task === 'translation-ar-en' ? 'Arabic → English' : 'Translation'}
            </Badge>
            <Badge variant="outline" className={`
              ${executionState === 'running' ? 'bg-green-500/10 text-green-400 border-green-500/30' : ''}
              ${executionState === 'paused' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : ''}
              ${executionState === 'complete' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : ''}
              ${executionState === 'idle' ? 'bg-gray-800/50 text-gray-400 border-gray-500/30' : ''}
            `}>
              {executionState === 'running' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              {executionState.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Input Section */}
        <div className="mt-4 flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text in Arabic..."
              className="bg-gray-800/50 border-gray-700/50 text-gray-100 placeholder:text-gray-500 h-11 text-right"
              dir="rtl"
            />
          </div>
          <Select value={task} onValueChange={setTask}>
            <SelectTrigger className="w-[200px] bg-gray-800/50 border-gray-700/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="translation-ar-en">Arabic → English</SelectItem>
              <SelectItem value="translation-en-ar">English → Arabic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Debug Toolbar */}
      <DebugToolbar
        executionState={executionState}
        debugMode={debugMode}
        onRun={handleRun}
        onPause={handlePause}
        onStop={handleStop}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onDebugModeChange={setDebugMode}
        currentStep={currentStepIndex + 1}
        totalSteps={steps.length}
        autoRunSpeed={autoRunSpeed}
        onAutoRunSpeedChange={setAutoRunSpeed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Pipeline Navigator */}
        <div className="w-80 bg-gray-900/40 backdrop-blur-sm border-r border-gray-800/50 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800/50">
            <h2 className="font-semibold text-sm text-gray-300">Pipeline Navigator</h2>
          </div>
          <ScrollArea className="flex-1">
            <PipelineNavigator
              steps={steps}
              currentStepId={currentStep?.id}
              breakpoints={breakpoints}
              onStepClick={handleStepClick}
              onToggleBreakpoint={toggleBreakpoint}
            />
          </ScrollArea>
        </div>

        {/* Center Panel - Main Visualization */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <VisualizationPanel
            currentStep={currentStep}
            onTensorSelect={setSelectedTensor}
          />
        </div>

        {/* Right Sidebar - Tensor Inspector */}
        <div className="w-96 bg-gray-900/40 backdrop-blur-sm border-l border-gray-800/50 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800/50">
            <h2 className="font-semibold text-sm text-gray-300">Tensor Inspector</h2>
          </div>
          <ScrollArea className="flex-1">
            <TensorInspector
              tensor={selectedTensor}
              currentStep={currentStep}
            />
          </ScrollArea>
        </div>
      </div>

      {/* Bottom Panel - Equation Viewer */}
      <div className="h-64 bg-gray-900/60 backdrop-blur-sm border-t border-gray-800/50 overflow-hidden">
        <EquationViewer currentStep={currentStep} />
      </div>
    </div>
  );
}
