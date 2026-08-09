import atriaLogo from '../assets/logos/atria.webp';
import iseLogo from '../assets/logos/ise.jpg';
import { Sun, Moon, PanelLeft, PanelRight } from 'lucide-react';

interface HeaderProps {
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  learningOpen?: boolean;
  onLearningToggle?: () => void;
  senseiOpen?: boolean;
  onSenseiToggle?: () => void;
}

export default function Header({ 
  theme = 'light', onThemeToggle,
  learningOpen = true, onLearningToggle,
  senseiOpen = true, onSenseiToggle
}: HeaderProps) {
  return (
    <header className="global-header">
      {onLearningToggle && (
        <button className="icon-button" onClick={onLearningToggle} aria-label="Toggle Learning Panel" title="Toggle Learning Panel (Ctrl+.)" style={{ marginRight: 8, border: 'none', background: 'transparent' }}>
          <PanelLeft size={20} color={learningOpen ? "var(--accent)" : "var(--text-muted)"} />
        </button>
      )}
      <div className="logos">
        <img src={atriaLogo} alt="ATRIA Logo" className="logo" />
        <img src={iseLogo} alt="ISE Logo" className="logo" />
      </div>
      <span className="header-title">Jojo</span>
      <div style={{ flex: 1 }} />
      {onThemeToggle && (
        <button className="icon-button" onClick={onThemeToggle} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      )}
      {onSenseiToggle && (
        <button className="icon-button" onClick={onSenseiToggle} aria-label="Toggle Sensei Panel" title="Toggle Sensei Panel (Ctrl+/)" style={{ marginLeft: 8, border: 'none', background: 'transparent' }}>
          <PanelRight size={20} color={senseiOpen ? "var(--accent)" : "var(--text-muted)"} />
        </button>
      )}
    </header>
  );
}
