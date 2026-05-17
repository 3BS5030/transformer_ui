import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { motion } from 'motion/react';

interface TokenVisualizationProps {
  data: {
    text?: string;
    tokens?: string[];
    ids?: number[];
    language?: string;
    predictions?: Array<{
      token: string;
      probability: number;
      topCandidates?: Array<{ token: string; prob: number }>;
    }>;
  };
  onTensorSelect: (tensor: any) => void;
}

export function TokenVisualization({ data, onTensorSelect }: TokenVisualizationProps) {
  const { text, tokens, ids, language, predictions } = data;

  if (text) {
    return (
      <Card className="bg-gray-900/60 border-gray-700/50 p-8">
        <div className="space-y-4">
          <div className="text-sm text-gray-500">Input Text</div>
          <div 
            className="text-3xl font-semibold text-gray-100 leading-relaxed"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {text}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-800/50 border-gray-700/50">
              {language === 'ar' ? 'Arabic (RTL)' : 'Text'}
            </Badge>
            <Badge variant="outline" className="bg-gray-800/50 border-gray-700/50">
              {text.length} characters
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  if (tokens && ids) {
    return (
      <div className="space-y-4">
        <Card className="bg-gray-900/60 border-gray-700/50 p-6">
          <div className="space-y-4">
            <div className="text-sm text-gray-500 mb-3">Tokenization Result</div>
            
            {/* Tokens */}
            <div className="flex flex-wrap gap-2" dir={tokens[0]?.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr'}>
              {tokens.map((token, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer group">
                    <div className="px-4 py-3">
                      <div className="text-lg font-semibold text-gray-100 mb-1 group-hover:text-cyan-400 transition-colors">
                        {token}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: <span className="font-mono text-cyan-400">{ids[i]}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Position: {i}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>

        {/* Token IDs Array */}
        <Card className="bg-gray-800/30 border-gray-700/50 p-4">
          <div className="text-xs text-gray-500 mb-2">Token ID Sequence</div>
          <div className="font-mono text-sm text-gray-300 break-all">
            [{ids.join(', ')}]
          </div>
        </Card>
      </div>
    );
  }

  if (predictions) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-400 mb-4">
          Token-by-token prediction with probability distributions
        </div>

        {predictions.map((pred, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border-gray-700/50 p-5">
              <div className="space-y-4">
                {/* Main Prediction */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-cyan-500 text-white">
                      Position {i + 1}
                    </Badge>
                    <span className="text-2xl font-bold text-gray-100">
                      {pred.token}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Confidence</div>
                    <div className="text-xl font-bold text-green-400 font-mono">
                      {(pred.probability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-2">
                  <Progress 
                    value={pred.probability * 100} 
                    className="h-2 bg-gray-900"
                  />
                </div>

                {/* Top Candidates */}
                {pred.topCandidates && (
                  <div className="space-y-2 pt-2 border-t border-gray-700/50">
                    <div className="text-xs text-gray-500">Alternative Candidates</div>
                    {pred.topCandidates.slice(0, 3).map((candidate, j) => (
                      <div 
                        key={j}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="w-32 flex-shrink-0">
                          <span className={j === 0 ? 'text-cyan-400 font-semibold' : 'text-gray-400'}>
                            {candidate.token}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                j === 0 
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                                  : 'bg-gray-600'
                              }`}
                              style={{ width: `${candidate.prob * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-16 text-right">
                          <span className="text-xs font-mono text-gray-500">
                            {(candidate.prob * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-gray-500 text-center py-8">
      No token data available
    </div>
  );
}
