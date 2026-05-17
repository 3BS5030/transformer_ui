import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { 
  Play, Pause, SkipForward, SkipBack, Square, Zap, Circle 
} from 'lucide-react';
import type { ExecutionState, DebugMode } from './types';

interface DebugToolbarProps {
  executionState: ExecutionState;
  debugMode: DebugMode;
  onRun: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onDebugModeChange: (mode: DebugMode) => void;
  currentStep: number;
  totalSteps: number;
  autoRunSpeed: number;
  onAutoRunSpeedChange: (speed: number) => void;
}

export function DebugToolbar({
  executionState,
  debugMode,
  onRun,
  onPause,
  onStop,
  onNext,
  onPrevious,
  onDebugModeChange,
  currentStep,
  totalSteps,
  autoRunSpeed,
  onAutoRunSpeedChange
}: DebugToolbarProps) {
  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border-b border-gray-800/50 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Control Buttons */}
          {executionState === 'idle' || executionState === 'paused' || executionState === 'complete' ? (
            <Button
              size="sm"
              onClick={onRun}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-4 h-4 mr-1" />
              {executionState === 'idle' ? 'Run' : 'Resume'}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onPause}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={onPrevious}
            disabled={currentStep <= 1}
            className="border-gray-700 hover:bg-gray-800"
          >
            <SkipBack className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onNext}
            disabled={executionState === 'idle' || currentStep >= totalSteps}
            className="border-gray-700 hover:bg-gray-800"
          >
            <SkipForward className="w-4 h-4 mr-1" />
            Next
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onStop}
            disabled={executionState === 'idle'}
            className="border-gray-700 hover:bg-gray-800 text-red-400 hover:text-red-300"
          >
            <Square className="w-4 h-4 mr-1" />
            Stop
          </Button>

          <Separator orientation="vertical" className="h-8 mx-2" />

          {/* Debug Mode */}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-400">Mode:</Label>
            <Select value={debugMode} onValueChange={(v) => onDebugModeChange(v as DebugMode)}>
              <SelectTrigger className="w-[140px] h-8 bg-gray-800/50 border-gray-700/50 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="step">Step-by-Step</SelectItem>
                <SelectItem value="auto">Auto-Run</SelectItem>
                <SelectItem value="breakpoint">Breakpoints</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {debugMode === 'auto' && (
            <>
              <Separator orientation="vertical" className="h-8 mx-2" />
              <div className="flex items-center gap-3 w-48">
                <Label className="text-xs text-gray-400">Speed:</Label>
                <Slider
                  value={[autoRunSpeed]}
                  onValueChange={([value]) => onAutoRunSpeedChange(value)}
                  min={100}
                  max={3000}
                  step={100}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-12">{autoRunSpeed}ms</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Progress */}
          <div className="text-sm text-gray-400">
            Step <span className="text-cyan-400 font-mono">{currentStep}</span> of{' '}
            <span className="text-gray-300 font-mono">{totalSteps}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
              style={{ width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
