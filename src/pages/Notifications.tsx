import { useEffect, useState, useMemo } from 'react'
import { CalendarIcon, CalendarRangeIcon, ClockIcon, MapPinIcon, BellIcon } from 'lucide-react'
import type { EventItem } from '../data/events'
import { listNotifications } from '../data/eventsService'

function Notifications() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listNotifications().then(setEvents).finally(() => setLoading(false))
  }, [])

  const recent = useMemo(() => {
    return [...events].sort((a, b) => a.date.localeCompare(b.date))
  }, [events])

  return (
    <div className='w-full h-[calc(100svh-56px)] md:h-svh px-4 md:px-8 py-4 overflow-y-scroll'>
      <div className='flex flex-col mb-6'>
        <h1 className='text-2xl font-bold flex items-center gap-2'><BellIcon className='w-5 h-5 text-[#794c9c]' /> Notifications</h1>
        <p className='text-sm text-[#737373]'>Latest events and updates.</p>
      </div>

      {loading ? (
        <div className='text-[#6b6b6b]'>Loading…</div>
      ) : (
        <section className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          {recent.length > 0 ? (
            recent.map((event) => (
              <div key={event.id} className='flex flex-col gap-2 bg-white rounded-md border border-[#eaeaea] p-4'>
                <div className='flex flex-row items-center gap-2'>
                  <CalendarRangeIcon className='w-4 h-4 text-[#794c9c]' />
                  <h3 className='text-base text-[#3a3a3a] font-semibold'>{event.title}</h3>
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
            ))
          ) : (
            <div className='col-span-1 sm:col-span-3'>
              <div className='flex flex-col items-center justify-center gap-2 bg-[#f7f0f7] border-dashed min-h-[14rem] rounded-md border border-[#e241ca] p-6'>
                <BellIcon className='w-6 h-6 text-[#794c9c]' />
                <p className='text-[#737373] font-semibold'>No new notifications.</p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default Notifications