import { neon } from '@neondatabase/serverless';
import { analyzeC, generateMermaid } from '../../src/lib/cAnalysis';

type LearningLevel = 'beginner' | 'intermediate' | 'pro';
type UserRole = 'student' | 'manager' | 'admin';
type Intent = 'question' | 'code' | 'nextstep';

interface Env {
  DATABASE_URL?: string;
  SESSION_SECRET?: string;
  ADMIN_USERNAME?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  JUDGE0_BASE_URL?: string;
  JUDGE0_C_LANGUAGE_ID?: string;
  APP_ORIGIN?: string;
}

interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  level: LearningLevel;
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204 }), env);

    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/health') return json({ ok: true, service: 'jojo-worker' }, env);
      if (url.pathname === '/api/register' && request.method === 'POST') return await signup(request, env);
      if (url.pathname === '/api/login' && request.method === 'POST') return await login(request, env, 'student');
      if (url.pathname === '/api/admin' && request.method === 'POST') return await login(request, env, 'admin');
      if (url.pathname === '/api/manager' && request.method === 'POST') return await login(request, env, 'manager');
      if (url.pathname === '/api/auth/signup' && request.method === 'POST') return await signup(request, env);
      if (url.pathname === '/api/auth/login' && request.method === 'POST') return await login(request, env);
      if (url.pathname === '/api/auth/me' && request.method === 'GET') return await me(request, env);
      if (url.pathname === '/api/admin/managers' && request.method === 'POST') return await addManager(request, env);
      if (url.pathname === '/api/settings' && request.method === 'GET') return await getSettings(request, env);
      if (url.pathname === '/api/settings' && request.method === 'POST') return await updateSettings(request, env);
      if (url.pathname === '/api/progress' && request.method === 'GET') return await progress(request, env);
      if (url.pathname === '/api/questions/assign' && request.method === 'POST') return await assignQuestion(request, env);
      if (url.pathname === '/api/code-snapshot' && request.method === 'POST') return await codeSnapshot(request, env);
      if (url.pathname === '/api/run' && request.method === 'POST') return await runC(request, env);
      if (url.pathname === '/api/parse' && request.method === 'POST') return await parseC(request, env);
      if (url.pathname === '/api/ai/chat' && request.method === 'POST') return await senseiChat(request, env);
      if (url.pathname === '/api/ai/explain' && request.method === 'POST') return await explainCode(request, env);
      if (url.pathname === '/api/ai/stuck' && request.method === 'POST') return await stuckHelp(request, env);

      return json({ error: 'Not found' }, env, 404);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      return json({ error: message }, env, 500);
    }
  },
};

async function signup(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ username?: string; email?: string; password?: string; level?: LearningLevel }>(request);
  const username = normalizeUsername(body.username);
  const email = normalizeEmail(body.email);
  if (!username || !email || !body.password || body.password.length < 8) {
    return json({ error: 'Username, email, and an 8+ character password are required.' }, env, 400);
  }

  const db = getDb(env);
  const salt = randomToken(16);
  const passwordHash = await hashPassword(body.password, salt);
  const rows = (await db`
    insert into users (username, email, password_hash, salt, role, level)
    values (${username}, ${email}, ${passwordHash}, ${salt}, 'student', ${body.level || 'beginner'})
    returning id, username, email, role, level
  `) as unknown as AuthUser[];
  const user = rows[0] as AuthUser;
  const token = await createSession(db, env, user.id);
  return json({ user, token }, env, 201);
}

async function login(request: Request, env: Env, expectedRole?: UserRole): Promise<Response> {
  const body = await readJson<{ username?: string; email?: string; identifier?: string; password?: string }>(request);
  const identifier = normalizeUsername(body.identifier || body.username || body.email);
  if (!identifier || !body.password) return json({ error: 'Username/email and password are required.' }, env, 400);

  const db = getDb(env);
  const rows = (await db`
    select id, username, email, role, level, password_hash, salt
    from users
    where lower(username) = ${identifier} or lower(email) = ${identifier}
    limit 1
  `) as unknown as Array<AuthUser & { password_hash: string; salt: string }>;
  let user = rows[0] as (AuthUser & { password_hash: string; salt: string }) | undefined;
  if (!user && expectedRole === 'admin') {
    user = await bootstrapAdmin(env, identifier);
  }
  if (!user) return json({ error: 'Invalid credentials.' }, env, 401);
  if (expectedRole && user.role !== expectedRole) return json({ error: `This login is only for ${expectedRole}s.` }, env, 403);
  const passwordHash = await hashPassword(body.password, user.salt);
  if (passwordHash !== user.password_hash) return json({ error: 'Invalid credentials.' }, env, 401);

  const token = await createSession(db, env, user.id);
  return json({ user: publicUser(user), token }, env);
}

async function bootstrapAdmin(env: Env, identifier: string): Promise<(AuthUser & { password_hash: string; salt: string }) | undefined> {
  const adminUsername = normalizeUsername(env.ADMIN_USERNAME);
  const adminEmail = normalizeEmail(env.ADMIN_EMAIL || 'admin@jojo.local');
  if (!adminUsername || !env.ADMIN_PASSWORD || (identifier !== adminUsername && identifier !== adminEmail)) return undefined;
  const db = getDb(env);
  const existing = (await db`select id from users where role = 'admin' limit 1`) as unknown[];
  if (existing.length) return undefined;
  const salt = randomToken(16);
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD, salt);
  const rows = (await db`
    insert into users (username, email, password_hash, salt, role, level)
    values (${adminUsername}, ${adminEmail}, ${passwordHash}, ${salt}, 'admin', 'beginner')
    returning id, username, email, role, level, password_hash, salt
  `) as unknown as Array<AuthUser & { password_hash: string; salt: string }>;
  return rows[0];
}

async function me(request: Request, env: Env): Promise<Response> {
  const user = await getUserFromRequest(request, env);
  if (!user) return json({ user: null }, env, 401);
  return json({ user }, env);
}

async function runC(request: Request, env: Env): Promise<Response> {
  const user = await getUserFromRequest(request, env);
  const body = await readJson<{ code?: string; stdin?: string; assignmentId?: string; questionId?: number }>(request);
  if (!body.code?.trim()) return json({ error: 'C code is required.' }, env, 400);

  const baseUrl = env.JUDGE0_BASE_URL || 'https://ce.judge0.com';
  const languageId = Number(env.JUDGE0_C_LANGUAGE_ID || 50);
  const submission = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      source_code: body.code,
      stdin: body.stdin || '',
      language_id: languageId,
    }),
  });

  if (!submission.ok) return json({ error: 'Judge0 submission failed.' }, env, 502);
  const { token } = (await submission.json()) as { token: string };
  const result = await pollJudge0(baseUrl, token);
  await recordCompile(env, user, body, result);
  return json(result, env);
}

async function parseC(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ code?: string }>(request);
  const code = body.code || '';
  return json({ analysis: analyzeC(code), mermaid: generateMermaid(code) }, env);
}

async function senseiChat(request: Request, env: Env): Promise<Response> {
  const user = await getUserFromRequest(request, env);
  const body = await readJson<{ message?: string; code?: string; history?: Array<{ role: 'user' | 'assistant'; content: string }> }>(request);
  if (!body.message?.trim()) return json({ error: 'Message is required.' }, env, 400);

  const level = user?.level || 'beginner';
  const intent = detectIntent(body.message);
  const messages = [
    { role: 'system' as const, content: buildSenseiPrompt(level, intent, body.code || '') },
    ...(body.history || []).slice(-8),
    { role: 'user' as const, content: body.message },
  ];
  const result = await callOpenRouter(env, messages);
  return json({ ...result, intent, level }, env);
}

async function explainCode(request: Request, env: Env): Promise<Response> {
  const user = await getUserFromRequest(request, env);
  const body = await readJson<{ code?: string }>(request);
  if (!body.code?.trim()) return json({ error: 'Code is required.' }, env, 400);

  const result = await callOpenRouter(env, [
    {
      role: 'system',
      content: `You are Sensei, a C programming mentor. Explain for a ${user?.level || 'beginner'} learner in 30 words or fewer. No code blocks. Mention only the main idea and why it works.`,
    },
    { role: 'user', content: body.code.slice(0, 3000) },
  ]);
  return json(result, env);
}

async function stuckHelp(request: Request, env: Env): Promise<Response> {
  const user = await getUserFromRequest(request, env);
  const body = await readJson<{ code?: string; cursorLine?: number; stuckCount?: number }>(request);
  const level = user?.level || 'beginner';
  const result = await callOpenRouter(env, [
    {
      role: 'system',
      content:
        'You are Sensei, a patient C tutor. Give one tiny next step in 30 words or fewer. No code blocks. Do not provide a full solution unless explicitly asked.',
    },
    {
      role: 'user',
      content: `A ${level} learner is stuck near line ${body.cursorLine || 1}. Stuck count: ${body.stuckCount || 1}.
Current C code:
${(body.code || '').slice(0, 3000)}

Give a concise hint. If they have been stuck more than once, add numbered next steps. Avoid full code unless they are a beginner and truly blocked.`,
    },
  ]);
  return json(result, env);
}

async function addManager(request: Request, env: Env): Promise<Response> {
  const actor = await requireRole(request, env, ['admin']);
  if (actor instanceof Response) return actor;
  const body = await readJson<{ username?: string; email?: string; password?: string }>(request);
  const username = normalizeUsername(body.username);
  const email = normalizeEmail(body.email);
  if (!username || !email || !body.password || body.password.length < 8) {
    return json({ error: 'Manager username, email, and an 8+ character password are required.' }, env, 400);
  }
  const salt = randomToken(16);
  const passwordHash = await hashPassword(body.password, salt);
  const rows = (await getDb(env)`
    insert into users (username, email, password_hash, salt, role, level)
    values (${username}, ${email}, ${passwordHash}, ${salt}, 'manager', 'beginner')
    returning id, username, email, role, level
  `) as unknown as AuthUser[];
  return json({ manager: publicUser(rows[0]) }, env, 201);
}

async function getSettings(request: Request, env: Env): Promise<Response> {
  const user = await getUserFromRequest(request, env);
  const settings = await loadSettings(env);
  return json({ settings, user }, env);
}

async function updateSettings(request: Request, env: Env): Promise<Response> {
  const actor = await requireRole(request, env, ['admin', 'manager']);
  if (actor instanceof Response) return actor;
  const body = await readJson<{ focusMinutes?: number }>(request);
  const focusMinutes = Math.max(1, Math.min(240, Math.round(Number(body.focusMinutes || 120))));
  const rows = (await getDb(env)`
    insert into app_settings (id, focus_minutes, updated_by, updated_at)
    values (1, ${focusMinutes}, ${actor.id}, now())
    on conflict (id) do update set focus_minutes = excluded.focus_minutes, updated_by = excluded.updated_by, updated_at = now()
    returning focus_minutes as "focusMinutes", updated_at as "updatedAt"
  `) as unknown as Array<{ focusMinutes: number; updatedAt: string }>;
  return json({ settings: rows[0] }, env);
}

async function progress(request: Request, env: Env): Promise<Response> {
  const actor = await requireRole(request, env, ['admin', 'manager']);
  if (actor instanceof Response) return actor;
  const rows = (await getDb(env)`
    select users.id, users.username, users.email,
      count(compile_attempts.id)::int as "compileCount",
      count(*) filter (where compile_attempts.succeeded)::int as "successCount",
      max(compile_attempts.created_at) as "lastCompileAt"
    from users
    left join compile_attempts on compile_attempts.user_id = users.id
    where users.role = 'student'
    group by users.id
    order by "lastCompileAt" desc nulls last, users.username asc
  `) as unknown[];
  return json({ students: rows }, env);
}

async function assignQuestion(request: Request, env: Env): Promise<Response> {
  const user = await requireRole(request, env, ['student']);
  if (user instanceof Response) return user;
  const body = await readJson<{ questions?: Array<{ id: number; title: string; explanation?: string }>; forceNext?: boolean }>(request);
  const questions = (body.questions || []).filter((question) => question.id && question.title);
  if (!questions.length) return json({ error: 'Question list is required.' }, env, 400);
  const db = getDb(env);
  const active = (await db`
    select id, question_id as "questionId", question_title as title, question_explanation as explanation
    from student_question_assignments
    where user_id = ${user.id} and compiled_at is null
    order by assigned_at desc
    limit 1
  `) as unknown[];
  if (active[0] && !body.forceNext) return json({ assignment: active[0] }, env);
  const picked = questions[Math.floor(Math.random() * questions.length)];
  const rows = (await db`
    insert into student_question_assignments (user_id, question_id, question_title, question_explanation)
    values (${user.id}, ${picked.id}, ${picked.title}, ${picked.explanation || ''})
    returning id, question_id as "questionId", question_title as title, question_explanation as explanation
  `) as unknown[];
  return json({ assignment: rows[0] }, env, 201);
}

async function codeSnapshot(request: Request, env: Env): Promise<Response> {
  const user = await requireRole(request, env, ['student']);
  if (user instanceof Response) return user;
  const body = await readJson<{ code?: string; assignmentId?: string; questionId?: number; questionTitle?: string; answer?: string }>(request);
  if (!body.code?.trim()) return json({ error: 'Code is required.' }, env, 400);
  const result = await callOpenRouter(env, [
    {
      role: 'system',
      content:
        'You are Sensei, a C tutor. Compare the student code to the question and reference answer. Reply in 30 words or fewer with one diagnostic and one next action. Do not reveal the answer.',
    },
    {
      role: 'user',
      content: `Question: Q${body.questionId || ''}. ${body.questionTitle || ''}
Reference answer:
${(body.answer || '').slice(0, 2500)}

Student code:
${body.code.slice(0, 3000)}`,
    },
  ]);
  await getDb(env)`
    insert into code_snapshots (user_id, assignment_id, question_id, code, analysis)
    values (${user.id}, ${body.assignmentId || null}, ${body.questionId || null}, ${body.code}, ${result.text})
  `;
  return json(result, env);
}

async function pollJudge0(baseUrl: string, token: string): Promise<unknown> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const response = await fetch(`${baseUrl}/submissions/${token}?base64_encoded=false`);
    if (!response.ok) throw new Error('Judge0 polling failed.');
    const result = (await response.json()) as { status?: { id?: number } };
    const statusId = result.status?.id || 0;
    if (statusId > 2) return result;
    await sleep(700);
  }
  throw new Error('Judge0 timed out while compiling.');
}

async function callOpenRouter(
  env: Env,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
): Promise<{ text: string; provider: string; model: string }> {
  if (!env.OPENROUTER_API_KEY) {
    return {
      text: 'Sensei is ready, but OPENROUTER_API_KEY is not configured in the Worker yet.',
      provider: 'local',
      model: 'not-configured',
    };
  }

  const model = env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'content-type': 'application/json',
      'http-referer': 'https://jojo.dev',
      'x-title': 'Jojo',
    },
    body: JSON.stringify({ model, messages, max_tokens: 90 }),
  });
  if (!response.ok) throw new Error(`OpenRouter failed with ${response.status}`);
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return { text: payload.choices?.[0]?.message?.content || '', provider: 'openrouter', model };
}

function buildSenseiPrompt(level: LearningLevel, intent: Intent, code: string): string {
  const context = code.trim() ? `Current C code:\n${code.slice(0, 2500)}` : 'The editor is empty.';
  if (level === 'beginner') {
    if (intent === 'question') {
      return `You are Sensei, a friendly C tutor for beginners.
${context}
Explain simply in 30 words or fewer. Avoid code unless asked.`;
    }
    if (intent === 'nextstep') {
      return `You are Sensei, helping a beginner continue C code.
${context}
Say the next logical step in 30 words or fewer. No code blocks.`;
    }
    return `You are Sensei. Generate beginner-friendly C only when requested.
${context}
No markdown fences. 30 words or fewer.`;
  }
  if (level === 'intermediate') {
    return `You are Sensei for an intermediate C learner.
${context}
Give one step or debugging clue in 30 words or fewer. Do not hand over full runnable code unless explicitly requested.`;
  }
  return `You are Sensei for an experienced C programmer.
${context}
Give one concise observation in 30 words or fewer. Mention safety or edge cases only when relevant.`;
}

function detectIntent(message: string): Intent {
  const lower = message.toLowerCase();
  if (['what next', 'next step', 'continue', 'now what', 'keep going'].some((item) => lower.includes(item))) return 'nextstep';
  if (lower.endsWith('?') || ['what', 'why', 'how', 'explain', 'difference'].some((item) => lower.includes(item))) return 'question';
  return 'code';
}

async function getUserFromRequest(request: Request, env: Env): Promise<AuthUser | null> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !env.DATABASE_URL) return null;
  const tokenHash = await sha256Hex(token);
  const rows = (await getDb(env)`
    select users.id, users.username, users.email, users.role, users.level
    from sessions
    join users on users.id = sessions.user_id
    where sessions.token_hash = ${tokenHash} and sessions.expires_at > now()
    limit 1
  `) as unknown as AuthUser[];
  return (rows[0] as AuthUser | undefined) || null;
}

async function requireRole(request: Request, env: Env, roles: UserRole[]): Promise<AuthUser | Response> {
  const user = await getUserFromRequest(request, env);
  if (!user) return json({ error: 'Login required.' }, env, 401);
  if (!roles.includes(user.role)) return json({ error: 'Permission denied.' }, env, 403);
  return user;
}

async function loadSettings(env: Env): Promise<{ focusMinutes: number }> {
  if (!env.DATABASE_URL) return { focusMinutes: 120 };
  const rows = (await getDb(env)`select focus_minutes as "focusMinutes" from app_settings where id = 1`) as unknown as Array<{
    focusMinutes: number;
  }>;
  return rows[0] || { focusMinutes: 120 };
}

async function recordCompile(
  env: Env,
  user: AuthUser | null,
  body: { code?: string; stdin?: string; assignmentId?: string; questionId?: number },
  result: unknown,
): Promise<void> {
  if (!user) return;
  const judge = result as { status?: { id?: number; description?: string } };
  const succeeded = judge.status?.id === 3;
  const db = getDb(env);
  await db`
    insert into compile_attempts (user_id, assignment_id, question_id, code, stdin, status_id, status_description, succeeded)
    values (${user.id}, ${body.assignmentId || null}, ${body.questionId || null}, ${body.code || ''}, ${body.stdin || ''},
      ${judge.status?.id || null}, ${judge.status?.description || null}, ${succeeded})
  `;
  if (body.assignmentId) {
    await db`
      update student_question_assignments
      set compiled_at = coalesce(compiled_at, now()), succeeded_at = case when ${succeeded} then coalesce(succeeded_at, now()) else succeeded_at end
      where id = ${body.assignmentId} and user_id = ${user.id}
    `;
  }
}

function publicUser(user: AuthUser): AuthUser {
  return { id: user.id, username: user.username, email: user.email, role: user.role, level: user.level };
}

async function createSession(db: ReturnType<typeof neon>, env: Env, userId: string): Promise<string> {
  const token = `${randomToken(32)}.${await hmac(env.SESSION_SECRET || 'dev-secret', userId)}`;
  const tokenHash = await sha256Hex(token);
  await db`
    insert into sessions (user_id, token_hash, expires_at)
    values (${userId}, ${tokenHash}, now() + interval '14 days')
  `;
  return token;
}

function getDb(env: Env): ReturnType<typeof neon> {
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  return neon(env.DATABASE_URL);
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  );
  return bufferToHex(bits);
}

async function hmac(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return bufferToHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

async function sha256Hex(value: string): Promise<string> {
  return bufferToHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

function randomToken(bytes: number): string {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return [...values].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function normalizeEmail(email?: string): string {
  return (email || '').trim().toLowerCase();
}

function normalizeUsername(username?: string): string {
  return (username || '').trim().toLowerCase();
}

async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

function json(data: unknown, env: Env, status = 200): Response {
  return withCors(new Response(JSON.stringify(data), { status, headers: JSON_HEADERS }), env);
}

function withCors(response: Response, env: Env): Response {
  const headers = new Headers(response.headers);
  headers.set('access-control-allow-origin', env.APP_ORIGIN || '*');
  headers.set('access-control-allow-methods', 'GET,POST,OPTIONS');
  headers.set('access-control-allow-headers', 'content-type,authorization');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
