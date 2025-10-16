import { useEffect, useMemo, useState } from 'react'
import { BarChart2Icon, CalendarIcon, CheckCircle2Icon, TicketIcon } from 'lucide-react'
import { listEventStats, type EventStat } from '../data/eventsService'

function Admin() {
  const [stats, setStats] = useState<EventStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listEventStats().then(setStats).finally(() => setLoading(false))
  }, [])

  const totals = useMemo(() => {
    return stats.reduce((acc, s) => {
      acc.rsvps += s.rsvpCount
      acc.tickets += s.ticketCount
      acc.revenue += s.revenue
      return acc
    }, { rsvps: 0, tickets: 0, revenue: 0 })
  }, [stats])

  return (
    <div className='w-full h-[calc(100svh-56px)] md:h-svh px-4 md:px-8 py-4 overflow-y-scroll'>
      <div className='flex flex-col mb-6'>
        <h1 className='text-2xl font-bold flex items-center gap-2'><BarChart2Icon className='w-5 h-5 text-[#794c9c]' /> Admin Stats</h1>
        <p className='text-sm text-[#737373]'>Overview of RSVPs, tickets, and revenue per event.</p>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white border border-[#eaeaea] rounded-md p-4 flex items-center gap-3'>
          <CheckCircle2Icon className='w-5 h-5 text-green-600' />
          <div>
            <p className='text-xs text-[#737373]'>Total RSVPs</p>
            <p className='text-xl font-semibold'>{totals.rsvps}</p>
          </div>
        </div>
        <div className='bg-white border border-[#eaeaea] rounded-md p-4 flex items-center gap-3'>
          <TicketIcon className='w-5 h-5 text-[#794c9c]' />
          <div>
            <p className='text-xs text-[#737373]'>Tickets Sold</p>
            <p className='text-xl font-semibold'>{totals.tickets}</p>
          </div>
        </div>
        <div className='bg-white border border-[#eaeaea] rounded-md p-4 flex items-center gap-3'>
          <CalendarIcon className='w-5 h-5 text-[#5b2a7f]' />
          <div>
            <p className='text-xs text-[#737373]'>Revenue</p>
            <p className='text-xl font-semibold'>R{totals.revenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className='text-[#6b6b6b]'>Loading…</div>
      ) : stats.length > 0 ? (
        <div className='overflow-x-auto bg-white border border-[#eaeaea] rounded-md'>
          <table className='min-w-full text-sm'>
            <thead className='bg-[#f8f5fb] text-[#5b2a7f]'>
              <tr>
                <th className='text-left px-4 py-2'>Event</th>
                <th className='text-left px-4 py-2'>Date</th>
                <th className='text-left px-4 py-2'>Campus</th>
                <th className='text-right px-4 py-2'>RSVPs</th>
                <th className='text-right px-4 py-2'>Tickets</th>
                <th className='text-right px-4 py-2'>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.id} className='border-t border-[#f0e8f6]'>
                  <td className='px-4 py-2'>{s.title}</td>
                  <td className='px-4 py-2'>{new Date(s.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })} {s.time}</td>
                  <td className='px-4 py-2 capitalize'>{s.campus}</td>
                  <td className='px-4 py-2 text-right'>{s.rsvpCount}</td>
                  <td className='px-4 py-2 text-right'>{s.ticketCount}</td>
                  <td className='px-4 py-2 text-right'>R{s.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center gap-2 bg-[#f7f0f7] border-dashed min-h-[14rem] rounded-md border border-[#e241ca] p-6'>
          <BarChart2Icon className='w-6 h-6 text-[#794c9c]' />
          <p className='text-[#737373] font-semibold'>No events found.</p>
        </div>
      )}
    </div>
  )
}

export default Admin