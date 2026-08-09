import atriaLogo from '../assets/logos/atria.webp';
import iseLogo from '../assets/logos/ise.jpg';
import iseDarkLogo from '../assets/logos/ise-dark.png';
import { Sun, Moon, Lightbulb } from 'lucide-react';

interface HeaderProps {
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  senseiOpen?: boolean;
  onSenseiToggle?: () => void;
}

export default function Header({ 
  theme = 'light', onThemeToggle,
  senseiOpen = true, onSenseiToggle
}: HeaderProps) {
  return (
    <header className="global-header">
      <div className="logos">
        <img src={atriaLogo} alt="ATRIA Logo" className="logo" />
        <img src={theme === 'dark' ? iseDarkLogo : iseLogo} alt="ISE Logo" className="logo" />
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
          <Lightbulb size={20} color={senseiOpen ? "var(--accent)" : "var(--text-muted)"} />
        </button>
      )}
    </header>
  );
}
