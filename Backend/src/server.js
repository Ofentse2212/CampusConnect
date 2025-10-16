import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@supabase/supabase-js'

const app = express()

const PORT = process.env.PORT || 4000
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

// Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[config error] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// Helpers
const SESSION_COOKIE_NAME = 'sid'
const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 24 * 7) // default 7 days

async function ensureSchema() { /* managed by Supabase migrations */ }

async function createSession(userId) {
  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000)
  const { error } = await supabase.from('sessions').insert({ id: sessionId, user_id: userId, expires_at: expiresAt })
  if (error) throw error
  return { sessionId, expiresAt }
}

async function getUserBySession(sessionId) {
  if (!sessionId) return null
  const { data, error } = await supabase
    .from('sessions')
    .select('user:users(id, name, email, student_number, staff_number, role)')
    .eq('id', sessionId)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  await supabase.from('sessions').update({ last_seen_at: new Date().toISOString() }).eq('id', sessionId)
  return data.user
}

function setSessionCookie(res, sessionId, expiresAt) {
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    expires: expiresAt,
    path: '/',
  })
}

function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' })
}

// Middleware to resolve current user
async function authMiddleware(req, res, next) {
  try {
    const sessionId = req.cookies[SESSION_COOKIE_NAME]
    const user = await getUserBySession(sessionId)
    req.user = user
  } catch (e) {
    // ignore
  }
  next()
}

app.use(authMiddleware)

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true })
})

// AuthZ helpers
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  next()
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    const allowed = Array.isArray(roles) ? roles : [roles]
    if (!allowed.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}

// Events helpers: map DB <-> API
function mapEventRowToApi(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    location: row.location,
    imageUrl: row.image_url,
    action: row.action,
    campus: row.campus,
    price: row.price ?? undefined,
  }
}

function mapEventApiToRow(api) {
  return {
    // id is auto on DB; only include if present
    ...(api.id ? { id: api.id } : {}),
    title: api.title,
    date: api.date,
    time: api.time,
    location: api.location,
    image_url: api.imageUrl,
    action: api.action,
    campus: api.campus,
    price: api.price ?? null,
  }
}

// Events CRUD
app.get('/events', async (req, res) => {
  try {
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true })
    if (error) throw error
    res.json(data.map(mapEventRowToApi))
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

app.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Not found' })
    res.json(mapEventRowToApi(data))
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

// Notifications: latest created events (non-admin users can call this)
app.get('/notifications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    if (error) throw error
    res.json(data.map(mapEventRowToApi))
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

// Admin: event stats (RSVP count, Ticket count, Revenue)
app.get('/admin/event-stats', requireRole(['staff','admin']), async (req, res) => {
  try {
    // Fetch events
    const [eventsRes, rsvpsRes, ticketsRes] = await Promise.all([
      supabase.from('events').select('*'),
      supabase.from('rsvps').select('event_id'),
      supabase.from('tickets').select('event_id, amount'),
    ])
    if (eventsRes.error) throw eventsRes.error
    if (rsvpsRes.error) throw rsvpsRes.error
    if (ticketsRes.error) throw ticketsRes.error

    const rsvpCountByEvent = new Map()
    for (const row of rsvpsRes.data || []) {
      rsvpCountByEvent.set(row.event_id, (rsvpCountByEvent.get(row.event_id) || 0) + 1)
    }
    const ticketCountByEvent = new Map()
    const revenueByEvent = new Map()
    for (const row of ticketsRes.data || []) {
      ticketCountByEvent.set(row.event_id, (ticketCountByEvent.get(row.event_id) || 0) + 1)
      const amount = Number(row.amount || 0)
      revenueByEvent.set(row.event_id, (revenueByEvent.get(row.event_id) || 0) + amount)
    }

    const stats = (eventsRes.data || []).map((ev) => ({
      id: ev.id,
      title: ev.title,
      date: ev.date,
      time: ev.time,
      campus: ev.campus,
      action: ev.action,
      rsvpCount: rsvpCountByEvent.get(ev.id) || 0,
      ticketCount: ticketCountByEvent.get(ev.id) || 0,
      revenue: revenueByEvent.get(ev.id) || 0,
    }))
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

app.post('/events', requireRole(['staff','admin']), async (req, res) => {
  try {
    const payload = mapEventApiToRow(req.body || {})
    const { data, error } = await supabase
      .from('events')
      .insert(payload)
      .select('*')
      .maybeSingle()
    if (error) throw error
    res.status(201).json(mapEventRowToApi(data))
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

app.put('/events/:id', requireRole(['staff','admin']), async (req, res) => {
  try {
    const { id } = req.params
    const payload = mapEventApiToRow({ ...req.body, id })
    const { data, error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle()
    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Not found' })
    res.json(mapEventRowToApi(data))
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

app.delete('/events/:id', requireRole(['staff','admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

// User actions: RSVP and Ticket
app.post('/events/:id/rsvp', requireAuth, async (req, res) => {
  try {
    const { id: eventId } = req.params
    const userId = req.user.id
    // Ensure event exists
    const { data: ev, error: evErr } = await supabase.from('events').select('id').eq('id', eventId).maybeSingle()
    if (evErr) throw evErr
    if (!ev) return res.status(404).json({ error: 'Event not found' })
    const { error } = await supabase
      .from('rsvps')
      .upsert({ user_id: userId, event_id: eventId }, { onConflict: 'user_id,event_id' })
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

app.post('/events/:id/ticket', requireAuth, async (req, res) => {
  try {
    const { id: eventId } = req.params
    const userId = req.user.id
    // Get event for price
    const { data: ev, error: evErr } = await supabase.from('events').select('id, price').eq('id', eventId).maybeSingle()
    if (evErr) throw evErr
    if (!ev) return res.status(404).json({ error: 'Event not found' })
    const amount = ev.price ?? 0
    const { error } = await supabase
      .from('tickets')
      .upsert({ user_id: userId, event_id: eventId, amount }, { onConflict: 'user_id,event_id' })
    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

// Current user's events with status
app.get('/me/events', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id
    // Fetch RSVPs
    const [rsvpsRes, ticketsRes] = await Promise.all([
      supabase.from('rsvps').select('event:events(*)').eq('user_id', userId),
      supabase.from('tickets').select('event:events(*)').eq('user_id', userId),
    ])
    if (rsvpsRes.error) throw rsvpsRes.error
    if (ticketsRes.error) throw ticketsRes.error
    const rsvpItems = (rsvpsRes.data || []).map((r) => ({ ...mapEventRowToApi(r.event), status: 'rsvp' }))
    const ticketItems = (ticketsRes.data || []).map((t) => ({ ...mapEventRowToApi(t.event), status: 'ticket' }))
    // Merge with ticket taking precedence if duplicates
    const byId = new Map()
    for (const item of [...rsvpItems, ...ticketItems]) {
      byId.set(item.id, item)
    }
    res.json(Array.from(byId.values()))
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

// Sign up routes
app.post('/auth/signup/student', async (req, res) => {
  try {
    const { name, studentNumber, password, email } = req.body
    if (!name || !studentNumber || !password) return res.status(400).json({ error: 'Missing fields' })
    const passwordHash = await bcrypt.hash(password, 12)
    const { data: inserted, error } = await supabase
      .from('users')
      .insert({ name, email: email || null, student_number: studentNumber, role: 'student', password_hash: passwordHash })
      .select('id, name, email, student_number, staff_number, role')
      .maybeSingle()
    if (error) throw error
    const user = inserted
    const { sessionId, expiresAt } = await createSession(user.id)
    setSessionCookie(res, sessionId, expiresAt)
    res.status(201).json({ user })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'User already exists' })
    res.status(500).json({ error: 'Internal error' })
  }
})

app.post('/auth/signup/guest', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' })
    const passwordHash = await bcrypt.hash(password, 12)
    const { data: inserted, error } = await supabase
      .from('users')
      .insert({ name, email, role: 'guest', password_hash: passwordHash })
      .select('id, name, email, student_number, staff_number, role')
      .maybeSingle()
    if (error) throw error
    const user = inserted
    const { sessionId, expiresAt } = await createSession(user.id)
    setSessionCookie(res, sessionId, expiresAt)
    res.status(201).json({ user })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'User already exists' })
    res.status(500).json({ error: 'Internal error' })
  }
})

app.post('/auth/signup/staff', async (req, res) => {
  try {
    const { name, staffNumber, password, email, role } = req.body
    const resolvedRole = role === 'admin' ? 'admin' : 'staff' // allow creating admin via staff route when explicitly requested
    if (!name || !staffNumber || !password) return res.status(400).json({ error: 'Missing fields' })
    const passwordHash = await bcrypt.hash(password, 12)
    const { data: inserted, error } = await supabase
      .from('users')
      .insert({ name, email: email || null, staff_number: staffNumber, role: resolvedRole, password_hash: passwordHash })
      .select('id, name, email, student_number, staff_number, role')
      .maybeSingle()
    if (error) throw error
    const user = inserted
    const { sessionId, expiresAt } = await createSession(user.id)
    setSessionCookie(res, sessionId, expiresAt)
    res.status(201).json({ user })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'User already exists' })
    res.status(500).json({ error: 'Internal error' })
  }
})

// Login routes
app.post('/auth/login/student', async (req, res) => {
  try {
    const { studentNumber, password } = req.body
    if (!studentNumber || !password) return res.status(400).json({ error: 'Missing fields' })
    const { data: userRow, error } = await supabase.from('users').select('*').eq('student_number', studentNumber).eq('role', 'student').maybeSingle()
    if (error) throw error
    if (!userRow) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, userRow.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const { sessionId, expiresAt } = await createSession(userRow.id)
    const user = { id: userRow.id, name: userRow.name, email: userRow.email, student_number: userRow.student_number, staff_number: userRow.staff_number, role: userRow.role }
    setSessionCookie(res, sessionId, expiresAt)
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

app.post('/auth/login/guest', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' })
    const { data: userRow, error } = await supabase.from('users').select('*').eq('email', email).eq('role', 'guest').maybeSingle()
    if (error) throw error
    if (!userRow) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, userRow.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const { sessionId, expiresAt } = await createSession(userRow.id)
    const user = { id: userRow.id, name: userRow.name, email: userRow.email, student_number: userRow.student_number, staff_number: userRow.staff_number, role: userRow.role }
    setSessionCookie(res, sessionId, expiresAt)
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

app.post('/auth/login/staff', async (req, res) => {
  try {
    const { staffNumber, password } = req.body
    if (!staffNumber || !password) return res.status(400).json({ error: 'Missing fields' })
    const { data: userRow, error } = await supabase.from('users').select('*').eq('staff_number', staffNumber).in('role', ['staff','admin']).maybeSingle()
    if (error) throw error
    if (!userRow) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, userRow.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const { sessionId, expiresAt } = await createSession(userRow.id)
    const user = { id: userRow.id, name: userRow.name, email: userRow.email, student_number: userRow.student_number, staff_number: userRow.staff_number, role: userRow.role }
    setSessionCookie(res, sessionId, expiresAt)
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

// Session endpoints
app.post('/auth/logout', async (req, res) => {
  try {
    const sessionId = req.cookies[SESSION_COOKIE_NAME]
    if (sessionId) await supabase.from('sessions').delete().eq('id', sessionId)
    clearSessionCookie(res)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Internal error' })
  }
})

app.get('/auth/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ user: null })
  res.json({ user: req.user })
})

// Expire old sessions periodically
async function reapExpiredSessions() {
  try {
    await supabase.from('sessions').delete().lte('expires_at', new Date().toISOString())
  } catch {}
}
setInterval(reapExpiredSessions, 1000 * 60 * 10) // every 10 min

// Startup
;(async () => {
  try {
    await ensureSchema()
    app.listen(PORT, () => console.log(`Auth API listening on :${PORT}`))
  } catch (e) {
    console.error('Failed to start server', e)
    process.exit(1)
  }
})()

