import { neon } from '@neondatabase/serverless';
import { analyzeC, generateMermaid } from '../../src/lib/cAnalysis';
import { expectedText, gradeCase, readsStdin, type GradeContext, type TestCase } from './grader';
import { testCasesFor } from './testcases';

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
  JUDGE0_COMPILER_OPTIONS?: string;
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

interface TestOutcome {
  label: string;
  stdin: string;
  expected: string;
  actual: string;
  passed: boolean;
  reason: string;
  compileOutput?: string;
  stderr?: string;
}

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
      if (url.pathname === '/api/questions/submit' && request.method === 'POST') return await submitQuestion(request, env);
      if (url.pathname === '/api/rooms/create' && request.method === 'POST') return await createRoom(request, env);
      if (url.pathname === '/api/rooms/my' && request.method === 'GET') return await getMyRooms(request, env);
      if (url.pathname === '/api/rooms/join' && request.method === 'POST') return await joinRoom(request, env);
      if (url.pathname === '/api/rooms/active' && request.method === 'GET') return await getActiveRoom(request, env);
      if (url.pathname === '/api/rooms/leave' && request.method === 'POST') return await leaveRoom(request, env);
      if (url.pathname === '/api/rooms/dashboard' && request.method === 'GET') return await roomDashboard(request, env);
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

/**
 * Forgetting a header is the single most common beginner mistake. gcc only warns
 * about an implicit declaration and links against libc anyway, so the program
 * runs and the mistake goes unnoticed. Promoting it to an error makes gcc name
 * the missing header and the exact line.
 */
const DEFAULT_COMPILER_OPTIONS = '-Werror=implicit-function-declaration';

function compilerOptions(env: Env): string {
  return env.JUDGE0_COMPILER_OPTIONS ?? DEFAULT_COMPILER_OPTIONS;
}

async function runC(request: Request, env: Env): Promise<Response> {
  const user = await getUserFromRequest(request, env);
  const body = await readJson<{ code?: string; stdin?: string; assignmentId?: string; questionId?: number }>(request);
  if (!body.code?.trim()) return json({ error: 'C code is required.' }, env, 400);

  const baseUrl = env.JUDGE0_BASE_URL || 'https://ce.judge0.com';
  const languageId = Number(env.JUDGE0_C_LANGUAGE_ID || 50);
  // base64 is required both ways: gcc diagnostics contain smart quotes that Judge0
  // refuses to serialise as plain text, which used to drop every compile error.
  const submission = await fetch(`${baseUrl}/submissions?base64_encoded=true&wait=false`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      source_code: toBase64(body.code),
      stdin: toBase64(body.stdin || ''),
      language_id: languageId,
      compiler_options: compilerOptions(env),
    }),
  });

  if (!submission.ok) {
    const detail = await submission.text().catch(() => '');
    return json({ error: `Judge0 submission failed. ${detail}`.trim() }, env, 502);
  }
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
  const body = await readJson<{
    questions?: Array<{ id: number; title: string; explanation?: string }>;
    forceNext?: boolean;
    afterQuestionId?: number;
  }>(request);
  const questions = (body.questions || []).filter((question) => question.id && question.title);
  if (!questions.length) return json({ error: 'Question list is required.' }, env, 400);
  const db = getDb(env);

  // Update room activity
  await db`update room_members set last_active_at = now() where user_id = ${user.id}`;

  const active = (await db`
    select id, question_id as "questionId", question_title as title, question_explanation as explanation
    from student_question_assignments
    where user_id = ${user.id} and submitted_at is null
    order by assigned_at desc
    limit 1
  `) as unknown as Array<{ id: string; questionId: number; title: string; explanation: string }>;

  if (active[0] && !body.forceNext) return json({ assignment: active[0] }, env);

  const submittedRows = (await db`
    select distinct question_id as "questionId"
    from student_question_assignments
    where user_id = ${user.id} and submitted_at is not null
  `) as unknown as Array<{ questionId: number }>;
  const submitted = new Set(submittedRows.map((row) => row.questionId));

  // Continue from the question just submitted, not from the highest one ever
  // submitted -- otherwise finishing Q12 out of order sends the student back to
  // whatever came after their previous best.
  const after = Number(body.afterQuestionId) || active[0]?.questionId || 0;
  const ordered = questions.map((question) => question.id).sort((a, b) => a - b);
  const nextQId =
    ordered.find((id) => id > after && !submitted.has(id)) ??
    ordered.find((id) => !submitted.has(id)) ??
    ordered[ordered.length - 1];

  const picked = questions.find((q) => q.id === nextQId) || questions[0];

  const rows = (await db`
    insert into student_question_assignments (user_id, question_id, question_title, question_explanation)
    values (${user.id}, ${picked.id}, ${picked.title}, ${picked.explanation || ''})
    returning id, question_id as "questionId", question_title as title, question_explanation as explanation
  `) as unknown[];
  return json({ assignment: rows[0] }, env, 201);
}

async function submitQuestion(request: Request, env: Env): Promise<Response> {
  const user = await requireRole(request, env, ['student']);
  if (user instanceof Response) return user;
  const body = await readJson<{ questionId: number; code?: string }>(request);
  if (!body.questionId) return json({ error: 'questionId is required.' }, env, 400);

  // Hidden test cases are the real gate: "it compiled" is not "it is correct".
  const cases = testCasesFor(body.questionId);
  let results: TestOutcome[] = [];
  if (cases.length) {
    if (!body.code?.trim()) return json({ error: 'Your code is required to check the answer.' }, env, 400);
    results = await runTestCases(env, body.code, cases);
    const passedCount = results.filter((outcome) => outcome.passed).length;
    if (passedCount < results.length) {
      // 400, not 200: an older client that does not understand `results` still
      // treats this as a failure and keeps the student on the question.
      return json(
        {
          ok: false,
          passed: false,
          error: `${passedCount} of ${results.length} test cases passed. Fix the failing cases and submit again.`,
          results,
          passedCount,
          total: results.length,
        },
        env,
        400,
      );
    }
  }

  const db = getDb(env);

  // Mark assignment submitted
  await db`
    update student_question_assignments
    set submitted_at = coalesce(submitted_at, now()),
        succeeded_at = coalesce(succeeded_at, now())
    where user_id = ${user.id} and question_id = ${body.questionId}
  `;

  // Ensure an entry exists
  const existing = (await db`
    select id from student_question_assignments
    where user_id = ${user.id} and question_id = ${body.questionId} and submitted_at is not null
    limit 1
  `) as unknown[];

  if (!existing.length) {
    await db`
      insert into student_question_assignments (user_id, question_id, question_title, question_explanation, submitted_at, succeeded_at)
      values (${user.id}, ${body.questionId}, ${'Question ' + body.questionId}, '', now(), now())
    `;
  }

  // Update room member finished_count and last_active_at
  await db`
    update room_members
    set finished_count = (
      select count(distinct question_id)::int
      from student_question_assignments
      where user_id = ${user.id} and submitted_at is not null
    ),
    last_active_at = now()
    where user_id = ${user.id}
  `;

  const nextQuestionId = body.questionId + 1;
  return json(
    {
      ok: true,
      passed: true,
      results,
      passedCount: results.length,
      total: results.length,
      submittedQuestionId: body.questionId,
      nextQuestionId,
    },
    env,
  );
}

async function createRoom(request: Request, env: Env): Promise<Response> {
  const actor = await requireRole(request, env, ['manager', 'admin']);
  if (actor instanceof Response) return actor;
  const body = await readJson<{ name?: string; roomCode?: string }>(request);
  const name = (body.name || '').trim();
  if (!name) return json({ error: 'Room name is required.' }, env, 400);

  let roomCode = (body.roomCode || '').trim().toUpperCase();
  if (!roomCode) {
    roomCode = generateRoomCode();
  }

  const db = getDb(env);
  const existing = (await db`select id from rooms where lower(room_code) = ${roomCode.toLowerCase()} limit 1`) as unknown[];
  if (existing.length) return json({ error: 'Room code already exists. Please pick another code.' }, env, 400);

  const rows = (await db`
    insert into rooms (name, room_code, manager_id, max_capacity)
    values (${name}, ${roomCode}, ${actor.id}, 100)
    returning id, name, room_code as "roomCode", manager_id as "managerId", max_capacity as "maxCapacity", created_at as "createdAt"
  `) as unknown[];
  return json({ room: rows[0] }, env, 201);
}

async function getMyRooms(request: Request, env: Env): Promise<Response> {
  const actor = await requireRole(request, env, ['manager', 'admin']);
  if (actor instanceof Response) return actor;
  const db = getDb(env);
  const rows = (await db`
    select r.id, r.name, r.room_code as "roomCode", r.max_capacity as "maxCapacity", r.created_at as "createdAt",
      count(rm.id)::int as "totalStudents",
      count(rm.id) filter (where rm.last_active_at > now() - interval '5 minutes')::int as "onlineStudents"
    from rooms r
    left join room_members rm on rm.room_id = r.id
    where r.manager_id = ${actor.id}
    group by r.id
    order by r.created_at desc
  `) as unknown[];
  return json({ rooms: rows }, env);
}

async function joinRoom(request: Request, env: Env): Promise<Response> {
  const user = await requireRole(request, env, ['student']);
  if (user instanceof Response) return user;
  const body = await readJson<{ roomCode?: string }>(request);
  const roomCode = (body.roomCode || '').trim().toUpperCase();
  if (!roomCode) return json({ error: 'Room code is required.' }, env, 400);

  const db = getDb(env);
  const roomRows = (await db`
    select id, name, room_code as "roomCode", max_capacity as "maxCapacity"
    from rooms
    where lower(room_code) = ${roomCode.toLowerCase()}
    limit 1
  `) as unknown as Array<{ id: string; name: string; roomCode: string; maxCapacity: number }>;

  const room = roomRows[0];
  if (!room) return json({ error: 'Invalid room code. Room not found.' }, env, 404);

  const countRows = (await db`
    select count(*)::int as count from room_members where room_id = ${room.id} and user_id != ${user.id}
  `) as unknown as Array<{ count: number }>;
  if (countRows[0].count >= room.maxCapacity) {
    return json({ error: `Room is full. Maximum capacity is ${room.maxCapacity} students.` }, env, 400);
  }

  // Remove student from any previous room first
  await db`delete from room_members where user_id = ${user.id}`;

  await db`
    insert into room_members (room_id, user_id, last_active_at)
    values (${room.id}, ${user.id}, now())
    on conflict (room_id, user_id) do update set last_active_at = now()
  `;

  return json({ joined: true, room: { id: room.id, name: room.name, roomCode: room.roomCode } }, env);
}

async function getActiveRoom(request: Request, env: Env): Promise<Response> {
  const user = await getUserFromRequest(request, env);
  if (!user) return json({ room: null }, env);
  const db = getDb(env);
  const rows = (await db`
    select r.id, r.name, r.room_code as "roomCode"
    from room_members rm
    join rooms r on r.id = rm.room_id
    where rm.user_id = ${user.id}
    order by rm.joined_at desc
    limit 1
  `) as unknown[];

  if (rows[0]) {
    await db`update room_members set last_active_at = now() where user_id = ${user.id}`;
  }
  return json({ room: rows[0] || null }, env);
}

async function leaveRoom(request: Request, env: Env): Promise<Response> {
  const user = await getUserFromRequest(request, env);
  if (!user) return json({ ok: true }, env);
  const db = getDb(env);
  await db`delete from room_members where user_id = ${user.id}`;
  return json({ ok: true }, env);
}

async function roomDashboard(request: Request, env: Env): Promise<Response> {
  const actor = await requireRole(request, env, ['manager', 'admin']);
  if (actor instanceof Response) return actor;
  const url = new URL(request.url);
  const roomId = url.searchParams.get('roomId');
  if (!roomId) return json({ error: 'roomId parameter is required.' }, env, 400);

  const db = getDb(env);
  const roomRows = (actor.role === 'manager'
    ? await db`
        select id, name, room_code as "roomCode", max_capacity as "maxCapacity", created_at as "createdAt"
        from rooms
        where id = ${roomId} and manager_id = ${actor.id}
        limit 1
      `
    : await db`
        select id, name, room_code as "roomCode", max_capacity as "maxCapacity", created_at as "createdAt"
        from rooms
        where id = ${roomId}
        limit 1
      `) as unknown[];
  const room = roomRows[0];
  if (!room) return json({ error: 'Room not found or access denied.' }, env, 404);

  const students = (await db`
    select u.id, u.username, u.email, rm.joined_at as "joinedAt", rm.last_active_at as "lastActiveAt",
      (rm.last_active_at > now() - interval '5 minutes') as "isOnline",
      coalesce(rm.finished_count, 0)::int as "finishedCount",
      count(ca.id)::int as "compileCount",
      count(ca.id) filter (where ca.succeeded)::int as "successCount",
      max(ca.created_at) as "lastCompileAt"
    from room_members rm
    join users u on u.id = rm.user_id
    left join compile_attempts ca on ca.user_id = u.id
    where rm.room_id = ${roomId}
    group by u.id, u.username, u.email, rm.joined_at, rm.last_active_at, rm.finished_count
    order by "isOnline" desc, rm.finished_count desc, u.username asc
  `) as unknown[];

  const executionRecords = (await db`
    select ca.id, ca.user_id as "userId", u.username, ca.question_id as "questionId",
      ca.code, ca.stdin, ca.status_id as "statusId", ca.status_description as "statusDescription",
      ca.succeeded, ca.created_at as "createdAt"
    from compile_attempts ca
    join room_members rm on rm.user_id = ca.user_id
    join users u on u.id = ca.user_id
    where rm.room_id = ${roomId}
    order by ca.created_at desc
    limit 100
  `) as unknown[];

  return json({ room, students, executionRecords }, env);
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  const randomBytes = new Uint8Array(6);
  crypto.getRandomValues(randomBytes);
  for (let i = 0; i < 6; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
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

interface Judge0Result {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
  memory?: number | null;
  status?: { id?: number; description?: string };
}

async function pollJudge0(baseUrl: string, token: string): Promise<Judge0Result> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const response = await fetch(`${baseUrl}/submissions/${token}?base64_encoded=true`);
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Judge0 polling failed (${response.status}). ${detail}`.trim());
    }
    const result = (await response.json()) as Judge0Result;
    const statusId = result.status?.id || 0;
    if (statusId > 2) {
      return {
        ...result,
        stdout: fromBase64(result.stdout),
        stderr: fromBase64(result.stderr),
        compile_output: fromBase64(result.compile_output),
        message: fromBase64(result.message),
      };
    }
    await sleep(700);
  }
  throw new Error('Judge0 timed out while compiling.');
}

/** Runs one program against every test case for a question in a single Judge0 batch. */
async function runTestCases(env: Env, code: string, cases: TestCase[]): Promise<TestOutcome[]> {
  const baseUrl = env.JUDGE0_BASE_URL || 'https://ce.judge0.com';
  const languageId = Number(env.JUDGE0_C_LANGUAGE_ID || 50);

  const submission = await fetch(`${baseUrl}/submissions/batch?base64_encoded=true`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      submissions: cases.map((testCase) => ({
        source_code: toBase64(code),
        stdin: toBase64(testCase.stdin),
        language_id: languageId,
        compiler_options: compilerOptions(env),
      })),
    }),
  });
  if (!submission.ok) {
    const detail = await submission.text().catch(() => '');
    throw new Error(`Judge0 batch submission failed (${submission.status}). ${detail}`.trim());
  }

  const tokens = ((await submission.json()) as Array<{ token: string }>).map((entry) => entry.token);
  const results = await pollJudge0Batch(baseUrl, tokens);
  const context: GradeContext = { readsInput: readsStdin(code) };
  return cases.map((testCase, index) => toOutcome(testCase, results[index], context));
}

async function pollJudge0Batch(baseUrl: string, tokens: string[]): Promise<Judge0Result[]> {
  const query = tokens.join(',');
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(`${baseUrl}/submissions/batch?tokens=${query}&base64_encoded=true`);
    if (!response.ok) {
      await sleep(900);
      continue;
    }
    const { submissions } = (await response.json()) as { submissions: Judge0Result[] };
    if (submissions.every((entry) => (entry.status?.id || 0) > 2)) {
      return submissions.map((entry) => ({
        ...entry,
        stdout: fromBase64(entry.stdout),
        stderr: fromBase64(entry.stderr),
        compile_output: fromBase64(entry.compile_output),
        message: fromBase64(entry.message),
      }));
    }
    await sleep(900);
  }
  throw new Error('Judge0 timed out while running the test cases.');
}

function toOutcome(testCase: TestCase, result: Judge0Result | undefined, context: GradeContext): TestOutcome {
  const base = {
    label: testCase.label,
    stdin: testCase.stdin,
    expected: expectedText(testCase),
    actual: result?.stdout || '',
  };

  if (!result) return { ...base, passed: false, reason: 'The judge did not return a result for this case.' };

  // A program that will not build or crashes fails before its output matters.
  if (result.status?.id !== 3) {
    return {
      ...base,
      passed: false,
      reason: result.status?.description || 'The program did not run successfully.',
      compileOutput: result.compile_output || '',
      stderr: result.stderr || '',
    };
  }

  const verdict = gradeCase(testCase, result.stdout || '', context);
  return { ...base, passed: verdict.passed, reason: verdict.reason };
}

function toBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(value?: string | null): string {
  if (!value) return '';
  try {
    const binary = atob(value.replace(/\s/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return value;
  }
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
