import { useEffect, useMemo, useState } from 'react'
import { CalendarIcon, CalendarRangeIcon, ClockIcon, MapPinIcon, TicketIcon, CheckCircle2Icon, XIcon, PencilIcon, Trash2Icon, PlusIcon } from 'lucide-react'
import { createEvent, deleteEvent, listEvents, updateEvent } from '../data/eventsService'
import type { EventItem } from '../data/events'

type FormState = {
  title: string
  date: string
  time: string
  location: string
  imageUrl: string
  action: 'rsvp' | 'ticket'
  campus: 'mahikeng' | 'potchefstroom' | 'vaal'
  price?: number
}

const initialForm: FormState = {
  title: '',
  date: '',
  time: '',
  location: '',
  imageUrl: '/images/image1.jpg',
  action: 'rsvp',
  campus: 'potchefstroom',
  price: undefined,
}

export default function CreateEvent() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [success, setSuccess] = useState<null | { type: 'created' | 'updated' | 'deleted'; title: string }>(null)
  const [confirmDelete, setConfirmDelete] = useState<null | { id: string; title: string }>(null)

  useEffect(() => {
    listEvents().then((e) => setEvents(e)).finally(() => setLoading(false))
  }, [])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) {
      const updated = await updateEvent(editingId, form)
      if (updated) {
        setEvents((prev) => prev.map((ev) => (ev.id === updated!.id ? updated! : ev)))
        setEditingId(null)
        setForm(initialForm)
        setSuccess({ type: 'updated', title: updated.title })
      }
    } else {
      const created = await createEvent(form)
      setEvents((prev) => [created, ...prev])
      setForm(initialForm)
      setSuccess({ type: 'created', title: created.title })
    }
  }

  async function handleDelete(id: string) {
    const toDelete = events.find((e) => e.id === id)
    const ok = await deleteEvent(id)
    if (ok) setEvents((prev) => prev.filter((e) => e.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setForm(initialForm)
    }
    if (ok) setSuccess({ type: 'deleted', title: toDelete?.title ?? 'Event' })
  }

  function startEdit(ev: EventItem) {
    setEditingId(ev.id)
    const { id, ...rest } = ev
    setForm(rest)
  }

  // removed reset to mock; events come from real API now

  const filtered = useMemo(() => events, [events])

  return (
    <div className='w-full h-svh px-8 py-4 overflow-y-scroll'>
      <div className='flex flex-col mb-10'>
        <h1 className='text-3xl font-bold'>Create Event</h1>
        <div>
          <h2 className='text-lg text-[#737373] font-semibold'>Admin tools</h2>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-3 bg-white rounded-md p-4 border border-[#eaeaea] max-w-3xl'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-[#6b6b6b]'>Title</label>
            <input className='border border-[#e2e2e2] rounded-md px-3 py-2' value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-[#6b6b6b]'>Date</label>
            <input type='date' className='border border-[#e2e2e2] rounded-md px-3 py-2' value={form.date} onChange={(e) => updateField('date', e.target.value)} required />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-[#6b6b6b]'>Time</label>
            <input type='time' className='border border-[#e2e2e2] rounded-md px-3 py-2' value={form.time} onChange={(e) => updateField('time', e.target.value)} required />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-[#6b6b6b]'>Location</label>
            <input className='border border-[#e2e2e2] rounded-md px-3 py-2' value={form.location} onChange={(e) => updateField('location', e.target.value)} required />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-[#6b6b6b]'>Image URL</label>
            <input className='border border-[#e2e2e2] rounded-md px-3 py-2' value={form.imageUrl} onChange={(e) => updateField('imageUrl', e.target.value)} />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-[#6b6b6b]'>Campus</label>
            <select className='border border-[#e2e2e2] rounded-md px-3 py-2' value={form.campus} onChange={(e) => updateField('campus', e.target.value as any)}>
              <option value='mahikeng'>Mahikeng</option>
              <option value='potchefstroom'>Potchefstroom</option>
              <option value='vaal'>Vaal</option>
            </select>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-[#6b6b6b]'>Action</label>
            <select className='border border-[#e2e2e2] rounded-md px-3 py-2' value={form.action} onChange={(e) => updateField('action', e.target.value as any)}>
              <option value='rsvp'>RSVP</option>
              <option value='ticket'>Ticket</option>
            </select>
          </div>
          {form.action === 'ticket' && (
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-[#6b6b6b]'>Price (R)</label>
              <input type='number' min={0} step='0.01' className='border border-[#e2e2e2] rounded-md px-3 py-2' value={form.price ?? ''} onChange={(e) => updateField('price', Number(e.target.value))} required={form.action === 'ticket'} />
            </div>
          )}
        </div>

        <div className='flex flex-row gap-2'>
          <button type='submit' className='px-4 py-2 rounded-md bg-[#794c9c] text-white flex items-center gap-2'>
            <PlusIcon className='w-4 h-4' /> {editingId ? 'Update Event' : 'Create Event'}
          </button>
          <button type='button' className='px-4 py-2 rounded-md border border-[#e2e2e2] text-[#444]' onClick={() => { setEditingId(null); setForm(initialForm) }}>Clear</button>
          {/* Reset removed */}
        </div>
      </form>

      {/* EVENTS LIST */}
      <div className='flex flex-row items-center gap-6 my-8'>
        <div className='flex flex-row items-center gap-2'>
          <CalendarRangeIcon className='w-4 h-4' />
          <h2 className='text-lg text-[#737373] font-semibold whitespace-nowrap'>All Events</h2>
        </div>
        <div className="h-[1px] bg-[#d1d1d1] w-full"></div>
      </div>

      {loading ? (
        <div className='text-[#6b6b6b]'>Loading…</div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {filtered.map((event) => (
            <div key={event.id} className='flex flex-col gap-1 bg-[#ffffff] rounded-md overflow-hidden border border-[#efefef]'>
              <img src={event.imageUrl} alt={event.title} className='w-full h-[10rem] object-cover rounded-md' />
              <div className='flex flex-col gap-2 px-4 pb-4 pt-3'>
                <div className='flex flex-row items-center justify-between'>
                  <h3 className='text-lg text-[#737373] font-semibold'>{event.title}</h3>
                  {event.action === 'ticket' ? (
                    <span className='flex flex-row items-center gap-1 text-xs bg-[#e9def2] text-[#5b2a7f] px-2 py-1 rounded-md'>
                      <TicketIcon className='w-3 h-3' /> Ticket
                    </span>
                  ) : (
                    <span className='flex flex-row items-center gap-1 text-xs bg-[#e9def2] text-[#5b2a7f] px-2 py-1 rounded-md'>
                      <CheckCircle2Icon className='w-3 h-3' /> RSVP
                    </span>
                  )}
                </div>
                <div className='flex flex-col gap-2 text-xs'>
                  <div className='flex flex-row items-center gap-2'>
                    <CalendarIcon className='w-4 h-4' />
                    <p className='text-[#737373]'>
                      {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' })}
                    </p>
                  </div>
                  <div className='flex flex-row items-center gap-2'>
                    <ClockIcon className='w-4 h-4' />
                    <p className=' text-[#737373]'>{event.time}</p>
                  </div>
                  <div className='flex flex-row items-center gap-2'>
                    <MapPinIcon className='w-4 h-4' />
                    <p className=' text-[#737373] text-ellipsis overflow-hidden whitespace-nowrap w-[80%]'>
                      {event.location}
                    </p>
                  </div>
                </div>
                <div className='flex flex-row gap-2'>
                  <button className='w-full px-3 py-2 rounded-md border border-[#ddd] text-[#555] flex items-center justify-center gap-2' onClick={() => startEdit(event)}>
                    <PencilIcon className='w-4 h-4' /> Edit
                  </button>
                  <button className='w-full px-3 py-2 rounded-md border border-[#f1dede] text-[#8a2b2b] bg-[#fff6f6] flex items-center justify-center gap-2' onClick={() => setConfirmDelete({ id: event.id, title: event.title })}>
                    <Trash2Icon className='w-4 h-4' /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => setConfirmDelete(null)} />
          <div className='relative bg-white rounded-lg shadow-xl w-[90%] max-w-md p-5 z-10'>
            <button className='absolute top-2 right-2 text-[#737373]' onClick={() => setConfirmDelete(null)} aria-label='Close'>
              <XIcon className='w-4 h-4' />
            </button>
            <div className='flex flex-col gap-3'>
              <div className='flex flex-row items-center gap-2'>
                <Trash2Icon className='w-4 h-4 text-[#8a2b2b]' />
                <h3 className='text-lg font-semibold text-[#3a3a3a]'>Delete Event?</h3>
              </div>
              <p className='text-[#5a5a5a]'>Are you sure you want to delete “{confirmDelete.title}”?</p>
              <div className='flex flex-row gap-2'>
                <button className='w-full px-4 py-2 rounded-md border border-[#ddd] text-[#555]' onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button
                  className='w-full px-4 py-2 rounded-md bg-[#8a2b2b] text-white'
                  onClick={async () => {
                    const id = confirmDelete.id
                    setConfirmDelete(null)
                    await handleDelete(id)
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {success && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => setSuccess(null)} />
          <div className='relative bg-white rounded-lg shadow-xl w-[90%] max-w-md p-5 z-10'>
            <button className='absolute top-2 right-2 text-[#737373]' onClick={() => setSuccess(null)} aria-label='Close'>
              <XIcon className='w-4 h-4' />
            </button>
            <div className='flex flex-col items-center gap-3 text-center'>
              <CheckCircle2Icon className='w-10 h-10 text-green-600' />
              <h3 className='text-lg font-semibold text-[#3a3a3a]'>
                {success.type === 'created' && 'Event Created'}
                {success.type === 'updated' && 'Event Updated'}
                {success.type === 'deleted' && 'Event Deleted'}
              </h3>
              <p className='text-[#5a5a5a]'>“{success.title}”</p>
              <button className='w-full px-4 py-2 rounded-md border border-[#ddd] text-[#555]' onClick={() => setSuccess(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}