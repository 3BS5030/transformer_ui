import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { motion } from 'motion/react';

interface FlowVisualizationProps {
  data: {
    input: number;
    hidden: number;
    output: number;
  };
  onTensorSelect: (tensor: any) => void;
}

export function FlowVisualization({ data, onTensorSelect }: FlowVisualizationProps) {
  const { input, hidden, output } = data;

  return (
    <div className="py-8">
      <div className="flex items-center justify-center gap-8">
        {/* Input Layer */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 p-6 min-w-[120px]">
            <div className="text-center space-y-2">
              <div className="text-xs text-gray-400">Input Layer</div>
              <div className="text-3xl font-bold text-blue-400 font-mono">
                {input}
              </div>
              <div className="text-xs text-gray-500">dimensions</div>
            </div>
          </Card>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
            d_model
          </Badge>
        </motion.div>

        {/* Arrow 1 */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex flex-col items-center gap-2"
        >
          <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <div className="text-xs text-gray-500">W₁, b₁</div>
        </motion.div>

        {/* Hidden Layer */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center gap-3"
        >
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 p-6 min-w-[120px]">
            <div className="text-center space-y-2">
              <div className="text-xs text-gray-400">Hidden Layer</div>
              <div className="text-3xl font-bold text-purple-400 font-mono">
                {hidden}
              </div>
              <div className="text-xs text-gray-500">dimensions</div>
            </div>
          </Card>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
            d_ff
          </Badge>
        </motion.div>

        {/* Arrow 2 */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <div className="text-xs text-gray-500">W₂, b₂</div>
        </motion.div>

        {/* Output Layer */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 p-6 min-w-[120px]">
            <div className="text-center space-y-2">
              <div className="text-xs text-gray-400">Output Layer</div>
              <div className="text-3xl font-bold text-green-400 font-mono">
                {output}
              </div>
              <div className="text-xs text-gray-500">dimensions</div>
            </div>
          </Card>
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
            d_model
          </Badge>
        </motion.div>
      </div>

      {/* Equation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-8"
      >
        <Card className="bg-gray-800/30 border-gray-700/50 p-5">
          <div className="text-center space-y-3">
            <div className="text-xs text-gray-500">Feed-Forward Network</div>
            <div className="text-lg text-gray-100 font-mono">
              FFN(x) = max(0, xW₁ + b₁)W₂ + b₂
            </div>
            <div className="text-xs text-gray-400">
              Two-layer network with ReLU activation
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Activation Visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="mt-6 grid grid-cols-3 gap-4"
      >
        <Card className="bg-gray-800/30 border-gray-700/50 p-4">
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Activation</div>
            <div className="text-sm text-purple-400 font-semibold">ReLU</div>
            <div className="text-xs text-gray-600">max(0, x)</div>
          </div>
        </Card>
        
        <Card className="bg-gray-800/30 border-gray-700/50 p-4">
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Expansion Ratio</div>
            <div className="text-sm text-cyan-400 font-semibold font-mono">
              {(hidden / input).toFixed(1)}x
            </div>
            <div className="text-xs text-gray-600">d_ff / d_model</div>
          </div>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/50 p-4">
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Parameters</div>
            <div className="text-sm text-green-400 font-semibold font-mono">
              {((input * hidden + hidden + hidden * output + output) / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-gray-600">Total params</div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
