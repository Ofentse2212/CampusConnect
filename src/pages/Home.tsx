import { CalendarIcon, CalendarRangeIcon, ClockIcon, MapPinIcon, TicketIcon, CheckCircle2Icon, ListFilterIcon, XIcon, ShieldCheckIcon } from 'lucide-react'
import type { EventItem, MyEventItem } from '../data/events'
import { listEvents, listMyEvents, rsvpEvent, buyTicket } from '../data/eventsService'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../components/AuthProvider'

export default function Home() {
  const { user } = useAuth()
  const [campus, setCampus] = useState<'all' | 'mahikeng' | 'potchefstroom' | 'vaal'>('all')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [modal, setModal] = useState<
    | { type: 'rsvp'; id: string }
    | { type: 'ticket'; id: string }
    | { type: 'view'; id: string; status: 'rsvp' | 'ticket' }
    | null
  >(null)
  const [allEvents, setAllEvents] = useState<EventItem[]>([])
  const [myEvents, setMyEvents] = useState<MyEventItem[]>([])

  useEffect(() => {
    Promise.all([listEvents(), listMyEvents()]).then(([events, mine]) => {
      setAllEvents(events)
      setMyEvents(mine)
    })
  }, [])

  const filteredEvents = useMemo(() => {
    const all = [...allEvents].sort((a, b) => a.date.localeCompare(b.date))
    const byCampus = campus === 'all' ? all : all.filter(e => e.campus === campus)
    const byFrom = fromDate ? byCampus.filter(e => e.date >= fromDate) : byCampus
    const byTo = toDate ? byFrom.filter(e => e.date <= toDate) : byFrom
    return byTo.slice(0, 4)
  }, [campus, fromDate, toDate, allEvents])
  const myEventsSorted = useMemo(() => {
    return [...myEvents].sort((a, b) => a.date.localeCompare(b.date))
  }, [myEvents])
  return (
    <div className='w-full h-[calc(100svh-56px)] md:h-svh px-4 md:px-8 py-4 overflow-y-scroll'>
        <div className='flex flex-col mb-10'>
          <h1 className='text-3xl font-bold'>Dashboard</h1>
          <div>
            <h2 className='text-lg text-[#737373] font-semibold'>Welcome, <span className='text-[#794c9c]'>{user?.name ?? 'User'}</span></h2>
          </div>
        </div>

        <div className='flex flex-col md:flex-row md:items-center gap-3 md:gap-6'>
          <div className='flex flex-row items-center gap-2'>
            <CalendarRangeIcon className='w-4 h-4' />
            <h2 className='text-lg text-[#737373] font-semibold whitespace-nowrap'>Upcoming Events</h2>
          </div>
          <div className="h-[1px] bg-[#d1d1d1] w-full"></div>
          <span className='text-[#737373] font-semibold whitespace-nowrap'>Campus:</span>
          <select className='w-full md:w-[15rem]' value={campus} onChange={(e) => setCampus(e.target.value as any)}>
            <option value='all'>All</option>
            <option value='mahikeng'>Mahikeng</option>
            <option value='potchefstroom'>Potchefstroom</option>
            <option value='vaal'>Vaal</option>
          </select>
        </div>

        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 mb-4 text-xs border border-[#d1d1d1] rounded-md p-2 w-full sm:w-fit'>
          <div className='flex flex-row items-center gap-2'>
            <ListFilterIcon className='w-3 h-3' />
            <span className='text-[#737373] font-semibold whitespace-nowrap'>Filter</span>
          </div>
          <div className='flex flex-row items-center gap-2'>
            <span className='text-[#929292] font-semibold whitespace-nowrap'>From:</span>
            <div className='bg-[#f2f2f2] border border-[#e2e2e2] px-2 py-1 rounded-md'>
              <input type='date' className='w-[8rem] sm:w-[6rem]' value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className='h-[1px] bg-[#313131] w-[10px]'></div>
            <span className='text-[#929292] font-semibold whitespace-nowrap'>To:</span>
            <div className='bg-[#f2f2f2] border border-[#e2e2e2] px-2 py-1 rounded-md'>
              <input type='date' className='w-[8rem] sm:w-[6rem]' value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
        </div>
        
        {/* EVENT CARD ROW */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div key={event.id} className='flex flex-col gap-1 bg-[#ffffff] rounded-md overflow-hidden'>
                <img src={event.imageUrl} alt={event.title} className='w-full h-[14rem] object-cover rounded-md' />
                <div className='flex flex-col gap-2 px-4 pb-4'>
                  <h3 className='text-lg text-[#737373] font-semibold'>{event.title}</h3>
                  {/* EVENT DETAILS */}
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
                {(() => {
                  const mine = myEvents.find((e) => e.id === event.id)
                  if (mine?.status === 'ticket') {
                    return (
                      <button className='bg-[#e9def2] w-full text-[#5b2a7f] px-4 font-semibold py-2 rounded-md cursor-not-allowed' disabled>
                        Ticket Purchased
                      </button>
                    )
                  }
                  if (mine?.status === 'rsvp') {
                    return (
                      <button className='bg-[#e9def2] w-full text-[#5b2a7f] px-4 font-semibold py-2 rounded-md cursor-not-allowed' disabled>
                        RSVPed
                      </button>
                    )
                  }
                  return (
                    <button
                      className='bg-[#794c9c] w-full text-white px-4 font-semibold py-2 rounded-md'
                      onClick={() => setModal({ type: event.action, id: event.id })}
                    >
                      {event.action === 'ticket' ? 'Buy Ticket' : 'RSVP'}
                    </button>
                  )
                })()}
                </div>
              </div>
            ))
          ) : (
            <div className='col-span-1 sm:col-span-4'>
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
                const ev = allEvents.find(e => e.id === modal.id)
                if (!ev) return null
                if (modal.type === 'rsvp') {
                  return (
                    <RsvpModalContent
                      event={ev}
                      onClose={() => setModal(null)}
                      onConfirmed={(id) => {
                        rsvpEvent(id)
                          .then(() => {
                            setMyEvents((prev) => {
                              const existing = prev.find((e) => e.id === id)
                              if (existing) return prev.map((e) => (e.id === id ? { ...e, status: 'rsvp' } : e))
                              return [...prev, { ...ev, status: 'rsvp' }]
                            })
                          })
                      }}
                    />
                  )
                }
                if (modal.type === 'ticket') {
                  return (
                    <TicketModalContent
                      event={ev}
                      onClose={() => setModal(null)}
                      onPurchased={(id) => {
                        buyTicket(id)
                          .then(() => {
                            setMyEvents((prev) => {
                              const existing = prev.find((e) => e.id === id)
                              if (existing) return prev.map((e) => (e.id === id ? { ...e, status: 'ticket' } : e))
                              return [...prev, { ...ev, status: 'ticket' }]
                            })
                          })
                      }}
                    />
                  )
                }
                return (
                  <ViewModalContent
                    event={ev}
                    status={modal.status}
                    onClose={() => setModal(null)}
                  />
                )
              })()}
            </div>
          </div>
        )}

        {/* YOUR EVENTS */}
        <div className='flex flex-row items-center gap-6 my-8'>
          <div className='flex flex-row items-center gap-2'>
            <CheckCircle2Icon className='w-4 h-4' />
            <h2 className='text-lg text-[#737373] font-semibold whitespace-nowrap'>Your Events</h2>
          </div>
          <div className="h-[1px] bg-[#d1d1d1] w-full"></div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {myEventsSorted.length > 0 ? (
            myEventsSorted.map((event) => (
              <div key={event.id} className='flex flex-col gap-1 bg-[#ffffff] rounded-md overflow-hidden h-full'>
                <img src={event.imageUrl} alt={event.title} className='w-full h-[10rem] object-cover rounded-md' />
                <div className='flex flex-col gap-2 px-4 pb-4 h-full'>
                  <div className='flex flex-col gap-2 flex-1'>
                    <div className='flex flex-row items-center justify-between'>
                    <h3 className='text-lg text-[#737373] font-semibold'>{event.title}</h3>
                    {event.status === 'ticket' ? (
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
                  </div>
                  <button
                    className='bg-[#794c9c] w-full text-white px-4 font-semibold py-2 rounded-md mt-auto'
                    onClick={() => setModal({ type: 'view', id: event.id, status: event.status })}
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className='col-span-1 sm:col-span-4'>
              <div className='flex flex-col items-center justify-center min-h-[14rem] border-dashed gap-2 bg-[#f7f0f7] rounded-md border border-[#e241ca] p-6'>
                <CalendarIcon className='w-6 h-6 text-[#794c9c]' />
                <p className='text-[#737373] font-semibold'>You currently have no events you will be attending soon.</p>
              </div>
            </div>
          )}
        </section>
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

function ViewModalContent({ event, status, onClose }: ModalBaseProps & { status: 'rsvp' | 'ticket' }) {
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-row items-center gap-2'>
        {status === 'ticket' ? (
          <TicketIcon className='w-4 h-4 text-[#794c9c]' />
        ) : (
          <CheckCircle2Icon className='w-4 h-4 text-[#794c9c]' />
        )}
        <h3 className='text-lg font-semibold text-[#3a3a3a]'>Your {status === 'ticket' ? 'Ticket' : 'RSVP'}</h3>
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
        {status === 'ticket' && (
          <div className='flex flex-row items-baseline justify-between mt-2'>
            <span className='text-[#737373]'>Amount Paid</span>
            <span className='text-xl font-semibold text-[#3a3a3a]'>R{(event.price ?? 0).toFixed(2)}</span>
          </div>
        )}
      </div>
      <button className='w-full px-4 py-2 rounded-md border border-[#ddd] text-[#555]' onClick={onClose}>Close</button>
    </div>
  )
}
