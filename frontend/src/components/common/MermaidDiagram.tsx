import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
});

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const cleanChart = chart.trim();

    if (!cleanChart) {
      setSvgContent('');
      setError(null);
      return;
    }

    const renderChart = async () => {
      try {
        setError(null);
        const uniqueId = `mermaid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const { svg } = await mermaid.render(uniqueId, cleanChart);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('[Mermaid Render Warning]', err.message || err);
          setError('Could not render diagram format. Displaying raw diagram definition.');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className={`p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-xs text-amber-800 ${className}`}>
        <p className="font-semibold mb-1">Visual Diagram Preview</p>
        <pre className="font-mono bg-white/80 p-2.5 rounded-lg border border-amber-200/60 overflow-x-auto text-[11px]">
          {chart}
        </pre>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className={`flex items-center justify-center p-6 text-xs text-slate-400 ${className}`}>
        Rendering visualization...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-x-auto flex justify-center py-2 ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

export default MermaidDiagram;
