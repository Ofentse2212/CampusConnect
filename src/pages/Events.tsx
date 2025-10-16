import { useEffect, useMemo, useState } from 'react'
import { CalendarRangeIcon, CalendarIcon, ClockIcon, MapPinIcon, TicketIcon, CheckCircle2Icon, XIcon, ShieldCheckIcon } from 'lucide-react'
import type { EventItem, MyEventItem } from '../data/events'
import { listEvents, rsvpEvent, buyTicket, listMyEvents } from '../data/eventsService'
import { useAuth } from '../components/AuthProvider'

export default function Events() {
  const { user } = useAuth()
  const isAdminViewOnly = user?.role === 'admin' || user?.role === 'staff'
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [myStatus, setMyStatus] = useState<Record<string, MyEventItem['status']>>({})
  const [modal, setModal] = useState<
    | { type: 'rsvp'; id: string }
    | { type: 'ticket'; id: string }
    | { type: 'view'; id: string }
    | null
  >(null)

  useEffect(() => {
    listEvents().then(setEvents).finally(() => setLoading(false))
    listMyEvents().then((mine) => {
      const map: Record<string, MyEventItem['status']> = {}
      mine.forEach((m) => { map[m.id] = m.status })
      setMyStatus(map)
    })
  }, [])

  const sorted = useMemo(() => {
    return [...events].sort((a, b) => a.date.localeCompare(b.date))
  }, [events])

  return (
    <div className='w-full h-[calc(100svh-56px)] md:h-svh px-4 md:px-8 py-4 overflow-y-scroll'>
      <div className='flex flex-col mb-6'>
        <h1 className='text-2xl font-bold'>All Events</h1>
        <p className='text-sm text-[#737373]'>Browse all upcoming events and take action.</p>
      </div>

      {loading ? (
        <div className='text-[#6b6b6b]'>Loading…</div>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorted.length > 0 ? (
              sorted.map((event) => (
                <div key={event.id} className='flex flex-col gap-1 bg-[#ffffff] rounded-md overflow-hidden border border-[#efefef]'>
                  <img src={event.imageUrl} alt={event.title} className='w-full h-[12rem] object-cover rounded-md' />
                  <div className='flex flex-col gap-2 px-4 pb-4 pt-3'>
                    <h3 className='text-lg text-[#737373] font-semibold'>{event.title}</h3>
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
                    <div className='flex flex-row gap-2 mt-1'>
                      {isAdminViewOnly ? (
                        <button className='w-full px-3 py-2 rounded-md border border-[#ddd] text-[#555]' onClick={() => setModal({ type: 'view', id: event.id })}>
                          View
                        </button>
                      ) : (
                        (() => {
                          const status = myStatus[event.id]
                          if (status === 'ticket') {
                            return (
                              <button className='w-full px-3 py-2 rounded-md bg-[#e9def2] text-[#5b2a7f] cursor-not-allowed' disabled>
                                Ticket Purchased
                              </button>
                            )
                          }
                          if (status === 'rsvp') {
                            return (
                              <button className='w-full px-3 py-2 rounded-md bg-[#e9def2] text-[#5b2a7f] cursor-not-allowed' disabled>
                                RSVPed
                              </button>
                            )
                          }
                          if (event.action === 'ticket') {
                            return (
                              <button className='w-full px-3 py-2 rounded-md bg-[#794c9c] text-white' onClick={() => setModal({ type: 'ticket', id: event.id })}>
                                Buy Ticket
                              </button>
                            )
                          }
                          return (
                            <button className='w-full px-3 py-2 rounded-md bg-[#794c9c] text-white' onClick={() => setModal({ type: 'rsvp', id: event.id })}>
                              RSVP
                            </button>
                          )
                        })()
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='col-span-1 sm:col-span-3 lg:col-span-4'>
                <div className='flex flex-col items-center justify-center gap-2 bg-[#f7f0f7] border-dashed min-h-[14rem] rounded-md border border-[#e241ca] p-6'>
                  <CalendarRangeIcon className='w-6 h-6 text-[#794c9c]' />
                  <p className='text-[#737373] font-semibold'>There are currently no upcoming events.</p>
                </div>
              </div>
            )}
          </section>

          {/* MODALS */}
          {modal && (
            <div className='fixed inset-0 z-50 flex items-center justify-center'>
              <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => setModal(null)} />
              <div className='relative bg-white rounded-lg shadow-xl w-[90%] max-w-md p-4 z-10'>
                <button className='absolute top-2 right-2 text-[#737373]' onClick={() => setModal(null)} aria-label='Close'>
                  <XIcon className='w-4 h-4' />
                </button>
                {(() => {
                  const ev = events.find(e => e.id === modal.id)
                  if (!ev) return null
                  if (modal.type === 'rsvp') {
                    return (
                      <RsvpModalContent
                        event={ev}
                        onClose={() => setModal(null)}
                        onConfirmed={async (id) => {
                          await rsvpEvent(id)
                          setMyStatus((prev) => ({ ...prev, [id]: 'rsvp' }))
                          setModal(null)
                        }}
                      />
                    )
                  }
                  if (modal.type === 'ticket') {
                    return (
                      <TicketModalContent
                        event={ev}
                        onClose={() => setModal(null)}
                        onPurchased={async (id) => {
                          await buyTicket(id)
                          setMyStatus((prev) => ({ ...prev, [id]: 'ticket' }))
                          setModal(null)
                        }}
                      />
                    )
                  }
                  return (
                    <ViewModalContent
                      event={ev}
                      onClose={() => setModal(null)}
                    />
                  )
                })()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

type ModalBaseProps = {
  event: EventItem
  onClose: () => void
}

function RsvpModalContent({ event, onClose, onConfirmed }: ModalBaseProps & { onConfirmed: (id: string) => void }) {
  const [confirmed, setConfirmed] = useState(false)
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-row items-center gap-2'>
        <ShieldCheckIcon className='w-4 h-4 text-[#794c9c]' />
        <h3 className='text-lg font-semibold text-[#3a3a3a]'>Confirm RSVP</h3>
      </div>
      {!confirmed ? (
        <>
          <div className='flex flex-col gap-2 text-sm text-[#5a5a5a]'>
            <p>Are you sure you want to RSVP to this event?</p>
            <div className='bg-[#f8f5fb] rounded-md p-3'>
              <p className='font-semibold text-[#3a3a3a]'>{event.title}</p>
              <div className='flex flex-row items-center gap-2'>
                <CalendarIcon className='w-4 h-4' />
                <span>{new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' })}</span>
              </div>
              <div className='flex flex-row items-center gap-2'>
                <ClockIcon className='w-4 h-4' />
                <span>{event.time}</span>
              </div>
              <div className='flex flex-row items-center gap-2'>
                <MapPinIcon className='w-4 h-4' />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
          <div className='flex flex-row gap-2 mt-2'>
            <button className='w-full px-4 py-2 rounded-md border border-[#ddd] text-[#555]' onClick={onClose}>Cancel</button>
            <button
              className='w-full px-4 py-2 rounded-md bg-[#794c9c] text-white'
              onClick={() => {
                setConfirmed(true)
                onConfirmed(event.id)
              }}
            >
              Confirm RSVP
            </button>
          </div>
        </>
      ) : (
        <div className='flex flex-col items-center gap-3 text-center'>
          <CheckCircle2Icon className='w-8 h-8 text-green-600' />
          <p className='text-[#3a3a3a] font-semibold'>RSVP Successful</p>
          <button className='w-full px-4 py-2 rounded-md border border-[#ddd] text-[#555]' onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  )
}

function TicketModalContent({ event, onClose, onPurchased }: ModalBaseProps & { onPurchased: (id: string) => void }) {
  const [isPaying, setIsPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const price = event.price ?? 0
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-row items-center gap-2'>
        <TicketIcon className='w-4 h-4 text-[#794c9c]' />
        <h3 className='text-lg font-semibold text-[#3a3a3a]'>Buy Ticket</h3>
      </div>
      <div className='bg-[#f8f5fb] rounded-md p-3 text-sm text-[#5a5a5a]'>
        <p className='font-semibold text-[#3a3a3a]'>{event.title}</p>
        <div className='flex flex-row items-center gap-2'>
          <CalendarIcon className='w-4 h-4' />
          <span>{new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' })}</span>
        </div>
        <div className='flex flex-row items-center gap-2'>
          <ClockIcon className='w-4 h-4' />
          <span>{event.time}</span>
        </div>
        <div className='flex flex-row items-center gap-2'>
          <MapPinIcon className='w-4 h-4' />
          <span>{event.location}</span>
        </div>
      </div>
      {!paid ? (
        <>
          <div className='flex flex-row items-baseline justify-between'>
            <span className='text-[#737373]'>Price</span>
            <span className='text-xl font-semibold text-[#3a3a3a]'>R{price.toFixed(2)}</span>
          </div>
          <button
            className='w-full px-4 py-2 rounded-md bg-[#794c9c] text-white disabled:opacity-60'
            onClick={() => {
              setIsPaying(true)
              setTimeout(() => {
                setPaid(true)
                setIsPaying(false)
                onPurchased(event.id)
              }, 1200)
            }}
            disabled={isPaying}
          >
            {isPaying ? 'Processing…' : 'Pay Now'}
          </button>
        </>
      ) : (
        <div className='flex flex-col items-center gap-3 text-center'>
          <CheckCircle2Icon className='w-8 h-8 text-green-600' />
          <p className='text-[#3a3a3a] font-semibold'>Payment Successful</p>
          <button className='w-full px-4 py-2 rounded-md border border-[#ddd] text-[#555]' onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  )
}

function ViewModalContent({ event, onClose }: ModalBaseProps) {
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-row items-center gap-2'>
        <CalendarRangeIcon className='w-4 h-4 text-[#794c9c]' />
        <h3 className='text-lg font-semibold text-[#3a3a3a]'>Event Details</h3>
      </div>
      <div className='bg-[#f8f5fb] rounded-md p-3 text-sm text-[#5a5a5a]'>
        <p className='font-semibold text-[#3a3a3a]'>{event.title}</p>
        <div className='flex flex-row items-center gap-2'>
          <CalendarIcon className='w-4 h-4' />
          <span>{new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' })}</span>
        </div>
        <div className='flex flex-row items-center gap-2'>
          <ClockIcon className='w-4 h-4' />
          <span>{event.time}</span>
        </div>
        <div className='flex flex-row items-center gap-2'>
          <MapPinIcon className='w-4 h-4' />
          <span>{event.location}</span>
        </div>
      </div>
      <button className='w-full px-4 py-2 rounded-md border border-[#ddd] text-[#555]' onClick={onClose}>Close</button>
    </div>
  )
}
