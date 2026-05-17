import { ScrollArea } from '../ui/scroll-area';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { motion } from 'motion/react';
import type { ExecutionStep } from './types';

interface EquationViewerProps {
  currentStep?: ExecutionStep;
}

export function EquationViewer({ currentStep }: EquationViewerProps) {
  if (!currentStep?.equations?.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-800/50 flex items-center justify-center">
            <span className="text-2xl">∑</span>
          </div>
          <p className="text-sm">No equations for this step</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-3 border-b border-gray-800/50">
        <h2 className="font-semibold text-sm text-gray-300">Mathematical Operations</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-6">
          <Tabs defaultValue="equations" className="w-full">
            <TabsList className="bg-gray-800/50 mb-4">
              <TabsTrigger value="equations">Equations</TabsTrigger>
              <TabsTrigger value="timeline">Computation Flow</TabsTrigger>
            </TabsList>

            <TabsContent value="equations" className="space-y-4">
              {currentStep.equations.map((equation, idx) => (
                <motion.div
                  key={equation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/50 p-5 hover:border-cyan-500/30 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs">
                          Equation {idx + 1}
                        </Badge>
                      </div>

                      {/* LaTeX Display (Rendered as Unicode/HTML) */}
                      <div className="bg-gray-900/60 rounded-lg p-4 overflow-x-auto">
                        <div className="text-lg text-gray-100 font-serif whitespace-nowrap">
                          {renderLatexToUnicode(equation.latex)}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-400">{equation.description}</p>

                      {/* Variables */}
                      {equation.variables && Object.keys(equation.variables).length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-gray-500">Where:</div>
                          <div className="space-y-1">
                            {Object.entries(equation.variables).map(([key, value]) => (
                              <div key={key} className="flex items-start gap-3 text-xs">
                                <code className="text-cyan-400 font-mono bg-gray-900/60 px-2 py-0.5 rounded">
                                  {key}
                                </code>
                                <span className="text-gray-400">=</span>
                                <span className="text-gray-300 font-mono">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Result */}
                      {equation.result && (
                        <div className="pt-2 border-t border-gray-700/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">Result:</span>
                            <code className="text-sm text-green-400 font-mono bg-gray-900/60 px-2 py-1 rounded">
                              {equation.result}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-3">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-600" />

                {currentStep.equations.map((equation, idx) => (
                  <motion.div
                    key={equation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="relative pl-14 pb-6"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-4 top-2 w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-4 border-gray-900 shadow-lg shadow-cyan-500/50" />

                    <Card className="bg-gray-800/30 border-gray-700/50 p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-gray-900/50 border-gray-700/50">
                            Step {idx + 1}
                          </Badge>
                          <span className="text-xs text-gray-500">→</span>
                          <span className="text-xs text-gray-400">{equation.description}</span>
                        </div>
                        <div className="text-sm text-gray-200 font-mono bg-gray-900/60 px-3 py-2 rounded">
                          {renderLatexToUnicode(equation.latex)}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}

// Helper function to render LaTeX-like notation to Unicode/HTML
function renderLatexToUnicode(latex: string): string {
  return latex
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\sqrt/g, '√')
    .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1)/($2)')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\\{/g, '{')
    .replace(/\\right\\}/g, '}')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    .replace(/\\quad/g, '  ')
    .replace(/\\,/g, ' ')
    .replace(/\^{([^}]+)}/g, '^$1')
    .replace(/_{([^}]+)}/g, '_$1')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\sum/g, '∑')
    .replace(/\\prod/g, '∏')
    .replace(/\\infty/g, '∞')
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\mu/g, 'μ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\beta/g, 'β')
    .replace(/\\alpha/g, 'α')
    .replace(/\\theta/g, 'θ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\max/g, 'max')
    .replace(/\\text{([^}]+)}/g, '$1')
    .replace(/\\begin{cases}/g, '')
    .replace(/\\end{cases}/g, '')
    .replace(/\\\\/g, ' | ')
    .replace(/&/g, '')
    .replace(/{/g, '')
    .replace(/}/g, '');
}
