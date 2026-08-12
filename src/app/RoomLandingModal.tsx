import React, { useState } from 'react';
import { Users, ArrowRight, X, LogIn } from 'lucide-react';
import { joinRoom, RoomInfo } from './api';

interface RoomLandingModalProps {
  onJoinSuccess: (room: RoomInfo) => void;
  onDirectAccess: () => void;
  onClose?: () => void;
  activeRoom?: RoomInfo | null;
  onLeaveRoom?: () => void;
}

export default function RoomLandingModal({
  onJoinSuccess,
  onDirectAccess,
  onClose,
  activeRoom,
  onLeaveRoom,
}: RoomLandingModalProps) {
  const [mode, setMode] = useState<'select' | 'join'>('select');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError('Please enter a room code.');
      return;
    }
    setError(null);
    setJoining(true);
    try {
      const res = await joinRoom(roomCode);
      onJoinSuccess(res.room);
    } catch (err: any) {
      setError(err.message || 'Failed to join room.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="modal-backdrop" style={backdropStyle}>
      <div className="modal-card" style={cardStyle}>
        {onClose && (
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close modal">
            <X size={18} />
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={iconBadgeStyle}>
            <Users size={28} color="#6366f1" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-color, #1e293b)' }}>
            Welcome to Jojo Classroom
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
            Choose how you would like to start your C programming session.
          </p>
        </div>

        {activeRoom && (
          <div style={activeRoomBoxStyle}>
            <p style={{ margin: 0, fontWeight: 500, color: '#4338ca' }}>
              Currently in Room: <strong>{activeRoom.name}</strong> ({activeRoom.roomCode})
            </p>
            {onLeaveRoom && (
              <button onClick={onLeaveRoom} style={leaveButtonStyle}>
                Leave Room
              </button>
            )}
          </div>
        )}

        {mode === 'select' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={() => setMode('join')}
              style={primaryChoiceStyle}
              type="button"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <LogIn size={20} color="#6366f1" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>Join Classroom Room</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Enter room code provided by your faculty / manager (max 100 students)
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="#6366f1" />
            </button>

            <button
              onClick={onDirectAccess}
              style={secondaryChoiceStyle}
              type="button"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={20} color="#059669" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>Access App Directly</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Practice C programming independently on your own learning path
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="#059669" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div style={errorStyle}>{error}</div>}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. ROOM12"
                maxLength={10}
                style={inputStyle}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setMode('select')}
                style={cancelButtonStyle}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={joining}
                style={submitButtonStyle}
              >
                {joining ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
  padding: '2rem',
  maxWidth: '480px',
  width: '100%',
  position: 'relative',
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#64748b',
};

const iconBadgeStyle: React.CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  backgroundColor: '#e0e7ff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '0.75rem',
};

const activeRoomBoxStyle: React.CSSProperties = {
  backgroundColor: '#eef2ff',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  marginBottom: '1.25rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const leaveButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#dc2626',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'underline',
};

const primaryChoiceStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 1.25rem',
  borderRadius: '12px',
  border: '2px solid #6366f1',
  backgroundColor: '#eef2ff',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const secondaryChoiceStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 1.25rem',
  borderRadius: '12px',
  border: '2px solid #059669',
  backgroundColor: '#ecfdf5',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '1.1rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  fontWeight: 600,
  boxSizing: 'border-box',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  color: '#991b1b',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  fontSize: '0.85rem',
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '0.6rem 1.2rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#f8fafc',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

const submitButtonStyle: React.CSSProperties = {
  padding: '0.6rem 1.2rem',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 600,
};
