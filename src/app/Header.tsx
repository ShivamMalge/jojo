import atriaLogo from '../assets/logos/aitlogo.png';
import iseLogoLight from '../assets/logos/new_ise.png';
import iseLogoDark from '../assets/logos/ise-untitled.png';
import { Sun, Moon, Lightbulb, LogIn, LogOut, Users } from 'lucide-react';
import type { RoomInfo } from './api';

interface HeaderProps {
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  senseiOpen?: boolean;
  onSenseiToggle?: () => void;
  activeRoom?: RoomInfo | null;
  onJoinRoom?: () => void;
  onLeaveRoom?: () => void;
}

export default function Header({
  theme = 'light',
  onThemeToggle,
  senseiOpen = true,
  onSenseiToggle,
  activeRoom,
  onJoinRoom,
  onLeaveRoom,
}: HeaderProps) {
  return (
    <header className="global-header">
      <div className="logos">
        <img src={atriaLogo} alt="ATRIA Logo" className="logo" />
        <img src={theme === 'dark' ? iseLogoDark : iseLogoLight} alt="ISE Logo" className="logo" />
      </div>
      <span className="header-title">Jojo</span>

      <div style={{ flex: 1 }} />

      {activeRoom ? (
        <div className="header-room-info">
          <div className="header-room-badge" title={`Joined Room: ${activeRoom.name} (${activeRoom.roomCode})`}>
            <Users size={15} />
            <span className="header-room-name">{activeRoom.name}</span>
            <span className="header-room-code">{activeRoom.roomCode}</span>
          </div>
          {onLeaveRoom && (
            <button
              className="header-room-btn leave"
              onClick={onLeaveRoom}
              aria-label="Leave room"
              title="Leave Room"
            >
              <LogOut size={15} />
              <span>Leave Room</span>
            </button>
          )}
        </div>
      ) : (
        onJoinRoom && (
          <button
            className="header-room-btn join"
            onClick={onJoinRoom}
            aria-label="Join room"
            title="Join Classroom Room"
          >
            <LogIn size={15} />
            <span>Join Room</span>
          </button>
        )
      )}

      {onThemeToggle && (
        <button className="icon-button" onClick={onThemeToggle} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      )}
      {onSenseiToggle && (
        <button
          className="icon-button"
          onClick={onSenseiToggle}
          aria-label="Toggle Sensei Panel"
          title="Toggle Sensei Panel (Ctrl+/)"
          style={{ marginLeft: 4, border: 'none', background: 'transparent' }}
        >
          <Lightbulb size={20} color={senseiOpen ? 'var(--accent)' : 'var(--text-muted)'} />
        </button>
      )}
    </header>
  );
}

