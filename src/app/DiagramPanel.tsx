import { useEffect, useMemo, useRef } from 'react';
import mermaid from 'mermaid';
import { analyzeC, findCRelationships, generateMermaid } from '../lib/cAnalysis';

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'base',
  themeVariables: {
    background: '#f7f8fb',
    primaryColor: '#e7f0ff',
    primaryTextColor: '#172033',
    primaryBorderColor: '#5472d3',
    lineColor: '#6f7787',
    secondaryColor: '#eef6ed',
    tertiaryColor: '#fff4d8',
    fontFamily: 'Inter, ui-sans-serif, system-ui',
  },
});

interface DiagramPanelProps {
  code: string;
}

export default function DiagramPanel({ code }: DiagramPanelProps) {
  const diagramRef = useRef<HTMLDivElement | null>(null);
  const mermaidText = useMemo(() => generateMermaid(code), [code]);
  const analysis = useMemo(() => analyzeC(code), [code]);
  const relationships = useMemo(() => findCRelationships(code), [code]);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!diagramRef.current) return;
      try {
        const id = `jojo-diagram-${Math.random().toString(36).slice(2)}`;
        const result = await mermaid.render(id, mermaidText);
        if (!cancelled && diagramRef.current) diagramRef.current.innerHTML = result.svg;
      } catch {
        if (!cancelled && diagramRef.current) {
          diagramRef.current.textContent = 'Diagram is waiting for complete C syntax.';
        }
      }
    }
    const timeout = window.setTimeout(render, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [mermaidText]);

  return (
    <section className="diagram-panel" aria-label="Live code diagram">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Live Code-to-Diagram</p>
          <h2>Control and calls</h2>
        </div>
        <div className="metric-row">
          <span>{analysis.metrics.functions} funcs</span>
          <span>CC {analysis.metrics.complexity}</span>
          <span>Depth {analysis.metrics.maxNestingDepth}</span>
        </div>
      </div>
      <div ref={diagramRef} className="mermaid-stage" />
      <div className="relationship-list">
        <div className="mini-heading">Visualizer</div>
        {relationships.length === 0 ? (
          <p className="muted">Define a variable or function, then use it later to see relationships.</p>
        ) : (
          relationships.slice(0, 8).map((relationship) => (
            <div className="relationship" key={relationship.id}>
              <strong>{relationship.name}</strong>
              <span>
                line {relationship.fromLine} to line {relationship.toLine}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
