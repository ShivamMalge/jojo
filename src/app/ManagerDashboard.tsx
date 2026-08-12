import React, { useEffect, useState } from 'react';
import {
  Users,
  PlusCircle,
  Activity,
  CheckCircle2,
  Clock,
  Code,
  RefreshCw,
  LogOut,
  ShieldAlert,
  Search,
  X,
} from 'lucide-react';
import {
  createRoom,
  getMyRooms,
  getRoomDashboard,
  RoomInfo,
  RoomStudent,
  ExecutionRecord,
} from './api';

interface ManagerDashboardProps {
  username: string;
  onLogout: () => void;
}

export default function ManagerDashboard({ username, onLogout }: ManagerDashboardProps) {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [students, setStudents] = useState<RoomStudent[]>([]);
  const [executionRecords, setExecutionRecords] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCode, setNewRoomCode] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'records'>('students');
  const [selectedCodeRecord, setSelectedCodeRecord] = useState<ExecutionRecord | null>(null);
  const [roomSearchQueries, setRoomSearchQueries] = useState<Record<string, string>>({});

  const currentSearchQuery = selectedRoomId ? (roomSearchQueries[selectedRoomId] || '') : '';

  const handleSearchChange = (query: string) => {
    if (!selectedRoomId) return;
    setRoomSearchQueries((prev) => ({
      ...prev,
      [selectedRoomId]: query,
    }));
  };

  const filteredStudents = students.filter((student) => {
    if (!currentSearchQuery.trim()) return true;
    const q = currentSearchQuery.toLowerCase().trim();
    return (
      student.username.toLowerCase().includes(q) ||
      student.email.toLowerCase().includes(q)
    );
  });

  const filteredExecutionRecords = executionRecords.filter((record) => {
    if (!currentSearchQuery.trim()) return true;
    const q = currentSearchQuery.toLowerCase().trim();
    const matchedStudent = students.find((s) => s.id === record.userId || s.username === record.username);
    const emailMatch = matchedStudent ? matchedStudent.email.toLowerCase().includes(q) : false;
    return record.username.toLowerCase().includes(q) || emailMatch;
  });

  const fetchRooms = async () => {
    try {
      const res = await getMyRooms();
      setRooms(res.rooms || []);
      if (!selectedRoomId && res.rooms.length > 0) {
        setSelectedRoomId(res.rooms[0].id);
      }
    } catch (err: any) {
      console.error('Failed to fetch rooms', err);
    }
  };

  const fetchRoomDetails = async (roomId: string) => {
    setLoading(true);
    try {
      const res = await getRoomDashboard(roomId);
      setSelectedRoom(res.room);
      setStudents(res.students || []);
      setExecutionRecords(res.executionRecords || []);
    } catch (err: any) {
      console.error('Failed to fetch room dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      fetchRoomDetails(selectedRoomId);
      const interval = setInterval(() => {
        fetchRoomDetails(selectedRoomId);
      }, 10000); // auto-refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [selectedRoomId]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      setCreateError('Room name is required.');
      return;
    }
    setCreateError(null);
    setCreating(true);
    try {
      const res = await createRoom(newRoomName, newRoomCode || undefined);
      setCreateModalOpen(false);
      setNewRoomName('');
      setNewRoomCode('');
      await fetchRooms();
      setSelectedRoomId(res.room.id);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create room.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={logoBadgeStyle}>
            <Activity size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Faculty Classroom Dashboard
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Logged in as <strong>{username}</strong> (Manager)
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setCreateModalOpen(true)}
            style={createRoomButtonStyle}
          >
            <PlusCircle size={18} /> Create Room
          </button>
          <button onClick={onLogout} style={logoutButtonStyle}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div style={layoutStyle}>
        {/* Sidebar: Room Selector */}
        <aside style={sidebarStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', margin: 0 }}>
              Your Rooms
            </h3>
            <button onClick={fetchRooms} style={iconRefreshStyle} title="Refresh rooms">
              <RefreshCw size={14} />
            </button>
          </div>

          {rooms.length === 0 ? (
            <div style={emptySidebarStyle}>
              <p>No rooms created yet.</p>
              <button onClick={() => setCreateModalOpen(true)} style={inlineCreateStyle}>
                + Create first room
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {rooms.map((room) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    style={roomCardStyle(isSelected)}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: isSelected ? '#4338ca' : '#1e293b' }}>
                      {room.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                      <span>Code: <strong style={{ color: '#4f46e5' }}>{room.roomCode}</strong></span>
                      <span>{room.onlineStudents || 0} / {room.totalStudents || 0} online (Max 100)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main style={mainContentStyle}>
          {selectedRoom ? (
            <>
              {/* Room Meta Banner */}
              <div style={roomBannerStyle}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>{selectedRoom.name}</h2>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    Room Code: <strong style={{ color: '#4f46e5', letterSpacing: '1px' }}>{selectedRoom.roomCode}</strong> | Capped at 100 students max
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={statBoxStyle}>
                    <Users size={20} color="#4f46e5" />
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                        {students.filter((s) => s.isOnline).length} / {students.length}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Online / Total</div>
                    </div>
                  </div>
                  <div style={statBoxStyle}>
                    <CheckCircle2 size={20} color="#10b981" />
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                        {students.reduce((acc, s) => acc + (s.finishedCount || 0), 0)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Submissions</div>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchRoomDetails(selectedRoom.id)}
                    style={refreshButtonStyle}
                    title="Refresh data"
                  >
                    <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
                  </button>
                </div>
              </div>

              {/* Room-specific Search Toolbar */}
              <div style={searchBarWrapperStyle}>
                <div style={searchInputContainerStyle}>
                  <Search size={18} color="#64748b" />
                  <input
                    type="text"
                    value={currentSearchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={`Search students by name or email in ${selectedRoom.name}...`}
                    style={searchInputStyle}
                  />
                  {currentSearchQuery && (
                    <button
                      onClick={() => handleSearchChange('')}
                      style={clearSearchButtonStyle}
                      title="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {currentSearchQuery && (
                  <div style={searchResultBadgeStyle}>
                    {activeTab === 'students'
                      ? `Showing ${filteredStudents.length} of ${students.length} students`
                      : `Showing ${filteredExecutionRecords.length} of ${executionRecords.length} logs`}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div style={tabContainerStyle}>
                <button
                  onClick={() => setActiveTab('students')}
                  style={tabButtonStyle(activeTab === 'students')}
                >
                  <Users size={16} /> Students ({filteredStudents.length}/{students.length})
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  style={tabButtonStyle(activeTab === 'records')}
                >
                  <Code size={16} /> Execution & Compile Logs ({filteredExecutionRecords.length}/{executionRecords.length})
                </button>
              </div>

              {/* Tab 1: Students Table */}
              {activeTab === 'students' && (
                <div style={tableWrapperStyle}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th>Logged In</th>
                        <th>Student</th>
                        <th>Executed?</th>
                        <th>Successful Executions</th>
                        <th>Failed Executions</th>
                        <th>Questions Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            No students currently enrolled in this room.
                          </td>
                        </tr>
                      ) : filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            No students found matching "<strong>{currentSearchQuery}</strong>".
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => {
                          const hasExecuted = (student.compileCount || 0) > 0;
                          const successCount = student.successCount || 0;
                          const failedCount = (student.compileCount || 0) - successCount;

                          return (
                            <tr key={student.id}>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={statusBadgeStyle(student.isOnline)}>
                                    <span style={dotStyle(student.isOnline)} />
                                    {student.isOnline ? 'Online' : 'Offline'}
                                  </span>
                                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                    {student.lastActiveAt ? new Date(student.lastActiveAt).toLocaleTimeString() : 'Never'}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{student.username}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{student.email}</div>
                                </div>
                              </td>
                              <td>
                                <span style={executedBadgeStyle(hasExecuted)}>
                                  {hasExecuted ? `Yes (${student.compileCount} runs)` : 'No (0 runs)'}
                                </span>
                              </td>
                              <td>
                                <span style={successBadgeStyle}>
                                  ✓ {successCount} successful
                                </span>
                              </td>
                              <td>
                                <span style={failedBadgeStyle(failedCount)}>
                                  {failedCount > 0 ? `✗ ${failedCount} failed` : '0 failed'}
                                </span>
                              </td>
                              <td>
                                <strong style={{ color: '#059669', fontSize: '0.9rem' }}>
                                  {student.finishedCount || 0}
                                </strong>{' '}
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ 50 questions</span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Execution Records */}
              {activeTab === 'records' && (
                <div style={tableWrapperStyle}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Student</th>
                        <th>Question</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {executionRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            No code compilation logs recorded yet.
                          </td>
                        </tr>
                      ) : filteredExecutionRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            No compilation logs found matching "<strong>{currentSearchQuery}</strong>".
                          </td>
                        </tr>
                      ) : (
                        filteredExecutionRecords.map((record) => (
                          <tr key={record.id}>
                            <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {new Date(record.createdAt).toLocaleTimeString()}
                            </td>
                            <td style={{ fontWeight: 600 }}>{record.username}</td>
                            <td>Q{record.questionId}</td>
                            <td>
                              <span style={execStatusBadgeStyle(record.succeeded)}>
                                {record.statusDescription || (record.succeeded ? 'Success' : 'Error')}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => setSelectedCodeRecord(record)}
                                style={viewCodeButtonStyle}
                              >
                                View Code
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div style={emptyMainStyle}>
              <Users size={48} color="#cbd5e1" />
              <h3>Select a room to monitor</h3>
              <p>Choose an existing room from the sidebar or create a new room for your class.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Create Room */}
      {createModalOpen && (
        <div style={modalBackdropStyle}>
          <div style={modalCardStyle}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>Create Classroom Room</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Create a dedicated room for your students (capped at max 100 students).
            </p>
            {createError && <div style={errorBannerStyle}>{createError}</div>}
            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={labelStyle}>Room Name *</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. CS101 Morning Section"
                  style={formInputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Room Code (Optional)</label>
                <input
                  type="text"
                  value={newRoomCode}
                  onChange={(e) => setNewRoomCode(e.target.value.toUpperCase())}
                  placeholder="Leave empty to auto-generate"
                  style={formInputStyle}
                  maxLength={10}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setCreateModalOpen(false)} style={cancelButtonStyle}>
                  Cancel
                </button>
                <button type="submit" disabled={creating} style={submitButtonStyle}>
                  {creating ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Code Record */}
      {selectedCodeRecord && (
        <div style={modalBackdropStyle}>
          <div style={{ ...modalCardStyle, maxWidth: '640px', width: '100%' }}>
            <h3 style={{ marginTop: 0 }}>Code Submission - {selectedCodeRecord.username} (Q{selectedCodeRecord.questionId})</h3>
            <div style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#64748b' }}>
              Compiled at: {new Date(selectedCodeRecord.createdAt).toLocaleString()} | Status: {selectedCodeRecord.statusDescription || (selectedCodeRecord.succeeded ? 'Success' : 'Error')}
            </div>
            <pre style={codeBlockStyle}>
              <code>{selectedCodeRecord.code}</code>
            </pre>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => setSelectedCodeRecord(null)} style={submitButtonStyle}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline styles for Manager Dashboard
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: '#f8fafc',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  padding: '0.75rem 1.5rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const logoBadgeStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  backgroundColor: '#4f46e5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const createRoomButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.5rem 0.9rem',
  borderRadius: '8px',
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  border: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const logoutButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.5rem 0.8rem',
  borderRadius: '8px',
  backgroundColor: '#f1f5f9',
  color: '#475569',
  border: '1px solid #cbd5e1',
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const layoutStyle: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
};

const sidebarStyle: React.CSSProperties = {
  width: '280px',
  backgroundColor: '#ffffff',
  borderRight: '1px solid #e2e8f0',
  padding: '1rem',
  overflowY: 'auto',
};

const emptySidebarStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem 0',
  color: '#94a3b8',
  fontSize: '0.85rem',
};

const inlineCreateStyle: React.CSSProperties = {
  marginTop: '0.5rem',
  background: 'none',
  border: 'none',
  color: '#4f46e5',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '0.85rem',
};

const iconRefreshStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#64748b',
  cursor: 'pointer',
  padding: '2px',
};

const roomCardStyle = (isSelected: boolean): React.CSSProperties => ({
  textAlign: 'left',
  padding: '0.75rem',
  borderRadius: '8px',
  border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
  backgroundColor: isSelected ? '#eef2ff' : '#ffffff',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  width: '100%',
});

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  padding: '1.5rem',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const roomBannerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '1.25rem 1.5rem',
  border: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const statBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  backgroundColor: '#f8fafc',
  padding: '0.5rem 0.85rem',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const refreshButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  fontSize: '0.8rem',
};

const tabContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  borderBottom: '1px solid #e2e8f0',
  paddingBottom: '0.25rem',
};

const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.6rem 1rem',
  border: 'none',
  borderBottom: isActive ? '3px solid #4f46e5' : '3px solid transparent',
  backgroundColor: 'transparent',
  fontWeight: isActive ? 600 : 400,
  color: isActive ? '#4f46e5' : '#64748b',
  cursor: 'pointer',
  fontSize: '0.9rem',
});

const tableWrapperStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: '0.875rem',
};

const statusBadgeStyle = (isOnline: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.2rem 0.5rem',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: isOnline ? '#dcfce7' : '#f1f5f9',
  color: isOnline ? '#15803d' : '#64748b',
});

const dotStyle = (isOnline: boolean): React.CSSProperties => ({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: isOnline ? '#16a34a' : '#94a3b8',
});

const executedBadgeStyle = (executed: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.2rem 0.55rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: executed ? '#e0f2fe' : '#f1f5f9',
  color: executed ? '#0369a1' : '#64748b',
});

const successBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.2rem 0.55rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: '#dcfce7',
  color: '#15803d',
};

const failedBadgeStyle = (count: number): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.2rem 0.55rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: count > 0 ? '#fee2e2' : '#f8fafc',
  color: count > 0 ? '#b91c1c' : '#94a3b8',
});

const execStatusBadgeStyle = (succeeded: boolean): React.CSSProperties => ({
  display: 'inline-block',
  padding: '0.2rem 0.5rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: succeeded ? '#dcfce7' : '#fee2e2',
  color: succeeded ? '#15803d' : '#991b1b',
});

const viewCodeButtonStyle: React.CSSProperties = {
  padding: '0.25rem 0.6rem',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  fontSize: '0.75rem',
  cursor: 'pointer',
};

const emptyMainStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#64748b',
  textAlign: 'center',
};

const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1100,
};

const modalCardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '1.5rem',
  maxWidth: '440px',
  width: '100%',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  marginBottom: '0.25rem',
  color: '#334155',
};

const formInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#f8fafc',
  cursor: 'pointer',
  fontSize: '0.85rem',
};

const submitButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '0.85rem',
};

const errorBannerStyle: React.CSSProperties = {
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  padding: '0.5rem',
  borderRadius: '6px',
  fontSize: '0.8rem',
};

const codeBlockStyle: React.CSSProperties = {
  backgroundColor: '#0f172a',
  color: '#f8fafc',
  padding: '1rem',
  borderRadius: '8px',
  overflowX: 'auto',
  maxHeight: '300px',
  fontSize: '0.85rem',
};

const searchBarWrapperStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '0.75rem 1rem',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
};

const searchInputContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flex: 1,
  backgroundColor: '#f8fafc',
  padding: '0.45rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
};

const searchInputStyle: React.CSSProperties = {
  border: 'none',
  outline: 'none',
  backgroundColor: 'transparent',
  width: '100%',
  fontSize: '0.875rem',
  color: '#0f172a',
};

const clearSearchButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#64748b',
  cursor: 'pointer',
  padding: '2px',
  display: 'flex',
  alignItems: 'center',
};

const searchResultBadgeStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#4f46e5',
  backgroundColor: '#eef2ff',
  padding: '0.35rem 0.75rem',
  borderRadius: '6px',
  whiteSpace: 'nowrap',
};
