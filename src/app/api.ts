const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export interface RunResult {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  status?: {
    id: number;
    description: string;
  };
  time?: string;
  memory?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function runC(code: string, stdin: string): Promise<RunResult> {
  return post<RunResult>('/run', { code, stdin }, getToken());
}

export async function runAssignedC(code: string, stdin: string, assignmentId?: string, questionId?: number): Promise<RunResult> {
  return post<RunResult>('/run', { code, stdin, assignmentId, questionId }, getToken());
}

export async function askSensei(message: string, code: string, history: ChatMessage[]): Promise<{ text: string; provider: string; model: string }> {
  return post('/ai/chat', { message, code, history }, getToken());
}

export async function explainCode(code: string): Promise<{ text: string; provider: string; model: string }> {
  return post('/ai/explain', { code }, getToken());
}

export async function stuckHelp(code: string, cursorLine: number, stuckCount: number): Promise<{ text: string; provider: string; model: string }> {
  return post('/ai/stuck', { code, cursorLine, stuckCount }, getToken());
}

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  const response = await post<AuthResponse>('/register', { username, email, password, level: 'beginner' });
  localStorage.setItem('jojo_token', response.token);
  return response;
}

export async function login(identifier: string, password: string, role: 'student' | 'manager' | 'admin' = 'student'): Promise<AuthResponse> {
  const path = role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/login';
  const response = await post<AuthResponse>(path, { identifier, username: identifier, password });
  localStorage.setItem('jojo_token', response.token);
  return response;
}

export async function me(): Promise<{ user: AuthUser | null }> {
  return get('/auth/me', getToken());
}

export async function getSettings(): Promise<{ settings: AppSettings; user?: AuthUser | null }> {
  return get('/settings', getToken());
}

export async function updateSettings(focusMinutes: number): Promise<{ settings: AppSettings }> {
  return post('/settings', { focusMinutes }, getToken());
}

export async function addManager(username: string, email: string, password: string): Promise<{ manager: AuthUser }> {
  return post('/admin/managers', { username, email, password }, getToken());
}

export async function getProgress(): Promise<{ students: StudentProgress[] }> {
  return get('/progress', getToken());
}

export async function assignQuestion(
  questions: Array<{ id: number; title: string; explanation?: string }>,
  forceNext = false,
): Promise<{ assignment: QuestionAssignment }> {
  return post('/questions/assign', { questions, forceNext }, getToken());
}

export async function analyzeIdleCode(payload: {
  code: string;
  assignmentId?: string;
  questionId?: number;
  questionTitle?: string;
  answer?: string;
}): Promise<{ text: string; provider: string; model: string }> {
  return post('/code-snapshot', payload, getToken());
}

export function logout() {
  localStorage.removeItem('jojo_token');
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'manager' | 'admin';
  level: string;
}

export interface AppSettings {
  focusMinutes: number;
}

export interface QuestionAssignment {
  id: string;
  questionId: number;
  title: string;
  explanation?: string;
}

export interface TestOutcome {
  label: string;
  stdin: string;
  expected: string;
  actual: string;
  passed: boolean;
  reason: string;
  compileOutput?: string;
  stderr?: string;
}

export interface SubmitResult {
  ok: boolean;
  passed: boolean;
  results: TestOutcome[];
  passedCount: number;
  total: number;
  nextQuestionId?: number;
}

export async function submitQuestion(questionId: number, code?: string): Promise<SubmitResult> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/questions/submit`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ questionId, code }),
  });
  const payload = (await response.json()) as SubmitResult & { error?: string };
  // Failing the hidden tests comes back as 400 so that older clients cannot
  // mistake it for a pass; here it is a normal result we want to render.
  if (!response.ok && !payload.results) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return payload;
}

export async function createRoom(name: string, roomCode?: string): Promise<{ room: RoomInfo }> {
  return post('/rooms/create', { name, roomCode }, getToken());
}

export async function getMyRooms(): Promise<{ rooms: RoomInfo[] }> {
  return get('/rooms/my', getToken());
}

export async function joinRoom(roomCode: string): Promise<{ joined: boolean; room: RoomInfo }> {
  return post('/rooms/join', { roomCode }, getToken());
}

export async function getActiveRoom(): Promise<{ room: RoomInfo | null }> {
  return get('/rooms/active', getToken());
}

export async function leaveRoom(): Promise<{ ok: boolean }> {
  return post('/rooms/leave', {}, getToken());
}

export async function getRoomDashboard(roomId: string): Promise<{ room: RoomInfo; students: RoomStudent[]; executionRecords: ExecutionRecord[] }> {
  return get(`/rooms/dashboard?roomId=${encodeURIComponent(roomId)}`, getToken());
}

export interface RoomInfo {
  id: string;
  name: string;
  roomCode: string;
  maxCapacity?: number;
  totalStudents?: number;
  onlineStudents?: number;
  createdAt?: string;
}

export interface RoomStudent {
  id: string;
  username: string;
  email: string;
  joinedAt: string;
  lastActiveAt: string;
  isOnline: boolean;
  finishedCount: number;
  compileCount: number;
  successCount: number;
  lastCompileAt?: string;
}

export interface ExecutionRecord {
  id: string;
  userId: string;
  username: string;
  questionId: number;
  code: string;
  stdin: string;
  statusId?: number;
  statusDescription?: string;
  succeeded: boolean;
  createdAt: string;
}

export interface StudentProgress {
  id: string;
  username: string;
  email: string;
  compileCount: number;
  successCount: number;
  lastCompileAt?: string;
}

async function post<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || `Request failed: ${response.status}`);
  return payload;
}

async function get<T>(path: string, token?: string | null): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || `Request failed: ${response.status}`);
  return payload;
}

function getToken(): string | null {
  return localStorage.getItem('jojo_token');
}
