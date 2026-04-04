import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowUp, ArrowDown, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { transposeText } from '@/lib/chordUtils.js';

const TransposePage = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [steps, setSteps] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOutput(transposeText(input, steps));
  }, [input, steps]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setSteps(0);
  };

  return (
    <>
      <Helmet>
        <title>Chord Transposer Tool - Chord Tempo</title>
        <meta name="description" content="Instantly transpose chord progressions to any key." />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Chord Transposer</h1>
          <p className="text-lg text-muted-foreground">
            Paste your chords or lyrics below and instantly change the key.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 bg-card p-4 rounded-2xl border border-border shadow-lg">
          <Button 
            variant="outline" 
            onClick={() => setSteps(s => s - 1)}
            className="h-12 px-6 border-border hover:bg-secondary"
          >
            <ArrowDown className="w-4 h-4 mr-2" />
            Half Step Down
          </Button>
          
          <div className="flex flex-col items-center justify-center w-32 h-12 bg-background rounded-xl border border-border">
            <span className="text-sm text-muted-foreground font-medium">Transpose</span>
            <span className="font-bold text-primary leading-none">
              {steps > 0 ? `+${steps}` : steps}
            </span>
          </div>

          <Button 
            variant="outline" 
            onClick={() => setSteps(s => s + 1)}
            className="h-12 px-6 border-border hover:bg-secondary"
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            Half Step Up
          </Button>

          <Button 
            variant="ghost" 
            onClick={reset}
            disabled={steps === 0}
            className="h-12 px-4 text-muted-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input */}
          <Card className="bg-card border-border shadow-xl">
            <CardContent className="p-0">
              <div className="p-4 border-b border-border bg-secondary/30">
                <h3 className="font-semibold">Original Text</h3>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste chords here... e.g.&#10;[C] Amazing [G] grace&#10;[Am] How sweet the [F] sound"
                className="min-h-[400px] border-0 focus-visible:ring-0 rounded-none bg-transparent font-mono text-base p-6 resize-none"
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="bg-card border-border shadow-xl relative overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-4 border-b border-border bg-secondary/30 flex justify-between items-center">
                <h3 className="font-semibold">Transposed Result</h3>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleCopy}
                  disabled={!output}
                  className="h-8"
                >
                  {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex-1 p-6 bg-background/50 overflow-auto min-h-[400px]">
                {output ? (
                  <pre className="font-mono text-base whitespace-pre-wrap text-accent font-bold">
                    {output}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Transposed output will appear here
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TransposePage;