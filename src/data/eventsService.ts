import type { EventItem, MyEventItem } from './events'

export type EventInput = Omit<EventItem, 'id'>

const API_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:4000'

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) {
    let message = 'Request failed'
    try {
      const json = await res.json()
      message = json?.error || message
    } catch {}
    throw new Error(message)
  }
  return (await res.json()) as T
}

export async function listEvents(): Promise<EventItem[]> {
  return api<EventItem[]>('/events')
}

export async function getEvent(id: string): Promise<EventItem> {
  return api<EventItem>(`/events/${id}`)
}

export async function createEvent(input: EventInput): Promise<EventItem> {
  return api<EventItem>('/events', { method: 'POST', body: JSON.stringify(input) })
}

export async function updateEvent(id: string, updates: Partial<EventItem>): Promise<EventItem> {
  return api<EventItem>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
}

export async function deleteEvent(id: string): Promise<boolean> {
  await api<{ ok: boolean }>(`/events/${id}`, { method: 'DELETE' })
  return true
}

export async function rsvpEvent(id: string): Promise<void> {
  await api<{ ok: boolean }>(`/events/${id}/rsvp`, { method: 'POST' })
}

export async function buyTicket(id: string): Promise<void> {
  await api<{ ok: boolean }>(`/events/${id}/ticket`, { method: 'POST' })
}

export async function listMyEvents(): Promise<MyEventItem[]> {
  return api<MyEventItem[]>('/me/events')
}

export type EventStat = {
  id: string
  title: string
  date: string
  time: string
  campus: EventItem['campus']
  action: EventItem['action']
  rsvpCount: number
  ticketCount: number
  revenue: number
}

export async function listNotifications(): Promise<EventItem[]> {
  return api<EventItem[]>('/notifications')
}

export async function listEventStats(): Promise<EventStat[]> {
  return api<EventStat[]>('/admin/event-stats')
}

