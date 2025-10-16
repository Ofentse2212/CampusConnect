import { Link, NavLink } from 'react-router-dom'
import { ArrowRightIcon, CalendarIcon, CheckCircle2Icon, TicketIcon, CameraIcon, SparklesIcon } from 'lucide-react'
import { useAuth } from '../components/AuthProvider'
import logo from '../../public/logos/nwu_icon.png'
export default function Landing() {
  const { user } = useAuth()
  const isAuthed = Boolean(user)
  return (
    <div className='min-h-svh flex flex-col bg-white'>
      {/* NAVBAR */}
      <header className='sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-[#f0e8f6]'>
        <nav className='mx-auto max-w-6xl px-4 py-3 flex items-center justify-between'>
          <Link to='/' className='flex items-center gap-2'>
            <div className='w-10 h-10 rounded-md bg-[#6c3d91] grid place-items-center text-white font-bold'>
                <img src={logo} alt='logo' className='w-7 h-7' />
            </div>
            <div className='leading-tight'>
              <div className='text-sm font-semibold text-[#3a3a3a]'>NWU</div>
              <div className='text-[10px] uppercase tracking-wide text-[#794c9c]'>Campus Connect</div>
            </div>
          </Link>
          <div className='hidden sm:flex items-center gap-6'>
            <NavLink to='/welcome' className='text-sm text-[#5b2a7f] hover:text-[#794c9c]'>Home</NavLink>
            <NavLink to='/app/events' className='text-sm text-[#5b2a7f] hover:text-[#794c9c]'>Events</NavLink>
          </div>
          <div className='flex items-center gap-2'>
            {isAuthed ? (
              <NavLink to='/' className='inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#794c9c] text-white text-sm'>
                Go to Dashboard <ArrowRightIcon className='w-4 h-4' />
              </NavLink>
            ) : (
              <>
                <NavLink to='/auth' className='hidden sm:inline-flex px-3 py-2 rounded-md border border-[#e2e2e2] text-[#444] text-sm'>Sign In</NavLink>
                <NavLink to='/auth/register' className='inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#794c9c] text-white text-sm'>
                  Get Started <ArrowRightIcon className='w-4 h-4' />
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className='bg-gradient-to-b from-[#f8f5fb] to-white'>
        <div className='mx-auto max-w-6xl px-4 py-14 sm:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
          <div className='flex flex-col items-center md:items-start text-center md:text-left gap-6'>
            <h1 className='text-3xl sm:text-5xl font-extrabold tracking-tight text-[#3a3a3a]'>Discover, RSVP, and Connect on Campus</h1>
            <p className='text-[#6b6b6b] text-base sm:text-lg max-w-2xl'>Your hub for all campus events. Browse upcoming activities, RSVP in one click, and secure tickets effortlessly.</p>
            <div className='flex items-center gap-2'>
              {isAuthed ? (
                <NavLink to='/app' className='inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#794c9c] text-white'>
                  Open Dashboard <ArrowRightIcon className='w-4 h-4' />
                </NavLink>
              ) : (
                <>
                  <NavLink to='/auth/register' className='inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#794c9c] text-white'>
                    Create Account <ArrowRightIcon className='w-4 h-4' />
                  </NavLink>
                  <NavLink to='/auth' className='inline-flex px-4 py-2 rounded-md border border-[#e2e2e2] text-[#444]'>
                    Sign In
                  </NavLink>
                </>
              )}
            </div>
          </div>
          <div className='w-full'>
            <div className='relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#eaeaea] shadow-sm'>
              <img
                src='/images/langing-page/img4.png'
                alt='Campus events collage'
                className='w-full h-full object-cover'
                loading='lazy'
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className='mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <FeatureCard icon={<CalendarIcon className='w-5 h-5' />} title='All Events in One Place' desc='Browse upcoming events across all campuses with powerful filters.' />
          <FeatureCard icon={<CheckCircle2Icon className='w-5 h-5' />} title='One‑click RSVP' desc='Reserve your spot instantly and keep track of your RSVPs.' />
          <FeatureCard icon={<TicketIcon className='w-5 h-5' />} title='Tickets Made Easy' desc='Purchase tickets securely and view them anytime.' />
        </div>
      </section>

      {/* CTA STRIP */}
      <section className='py-10'>
        <div className='mx-auto max-w-6xl px-4'>
          <div className='rounded-md border border-[#eaeaea] bg-[#f8f5fb] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div>
              <h3 className='text-lg font-semibold text-[#3a3a3a]'>Ready to get started?</h3>
              <p className='text-sm text-[#6b6b6b]'>Create your account or sign in to explore events.</p>
            </div>
            <div className='flex items-center gap-2'>
              {isAuthed ? (
                <NavLink to='/app' className='inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#794c9c] text-white'>Go to Dashboard</NavLink>
              ) : (
                <>
                  <NavLink to='/auth/sign-up' className='inline-flex px-4 py-2 rounded-md bg-[#794c9c] text-white'>Sign Up</NavLink>
                  <NavLink to='/auth/sign-in' className='inline-flex px-4 py-2 rounded-md border border-[#e2e2e2] text-[#444]'>Sign In</NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className='py-6'>
        <div className='mx-auto max-w-6xl px-4'>
          <div className='flex items-center gap-2 mb-3'>
            <CameraIcon className='w-4 h-4 text-[#794c9c]' />
            <h2 className='text-lg sm:text-xl font-semibold text-[#3a3a3a]'>Iconic Moments</h2>
          </div>
          <div className='grid grid-cols-2 sm:grid-cols-6 gap-3'>
            {/* Tile 1 */}
            <div className='sm:col-span-3 relative group rounded-lg bg-gradient-to-br from-[#e241ca1a] to-[#794c9c1a] p-[2px]'>
              <div className='relative rounded-[10px] overflow-hidden bg-white'>
                <img src='/images/langing-page/img1.jpeg' alt='Campus life 1' className='w-full h-full object-cover aspect-[4/3] transition-all duration-300 group-hover:scale-[1.03] group-hover:rotate-[0.4deg]' loading='lazy' />
                <span className='absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-[#f8f5fb] text-[#5b2a7f] border border-[#e9def2]'><SparklesIcon className='w-3 h-3'/> Culture</span>
              </div>
            </div>
            {/* Tile 2 */}
            <div className='sm:col-span-3 relative group rounded-lg bg-gradient-to-br from-[#6c3d911a] to-[#e241ca1a] p-[2px]'>
              <div className='relative rounded-[10px] overflow-hidden bg-white'>
                <img src='/images/langing-page/img2.jpeg' alt='Campus life 2' className='w-full h-full object-cover aspect-[4/3] transition-all duration-300 group-hover:scale-[1.03] group-hover:-rotate-[0.4deg]' loading='lazy' />
                <span className='absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-[#fff6f6] text-[#8a2b2b] border border-[#f1dede]'><SparklesIcon className='w-3 h-3'/> Sports</span>
              </div>
            </div>
            {/* Tile 3 */}
            <div className='sm:col-span-2 relative group rounded-lg bg-gradient-to-br from-[#794c9c1a] to-[#6c3d911a] p-[2px]'>
              <div className='relative rounded-[10px] overflow-hidden bg-white'>
                <img src='/images/langing-page/img3.jpeg' alt='Campus life 3' className='w-full h-full object-cover aspect-[4/3] transition-all duration-300 group-hover:scale-[1.03]' loading='lazy' />
                <span className='absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-[#f7f0f7] text-[#5b2a7f] border border-[#e9def2]'><SparklesIcon className='w-3 h-3'/> Moments</span>
              </div>
            </div>
            {/* Tile 4 */}
            <div className='hidden sm:block sm:col-span-4 relative group rounded-lg bg-gradient-to-br from-[#e241ca1a] to-[#6c3d911a] p-[2px]'>
              <div className='relative rounded-[10px] overflow-hidden bg-white'>
                <img src='/images/langing-page/img4.png' alt='Campus events collage' className='w-full h-full object-cover aspect-[21/9] transition-all duration-300 group-hover:scale-[1.02]' loading='lazy' />
                <span className='absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-[#f8f5fb] text-[#5b2a7f] border border-[#e9def2]'><SparklesIcon className='w-3 h-3'/> Highlights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className='mt-auto border-t border-[#f0e8f6]'>
        <div className='mx-auto max-w-6xl px-4 py-6 text-xs text-[#8a8a8a]'>
          © {new Date().getFullYear()} NWU Campus Connect
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className='bg-white border border-[#eaeaea] rounded-md p-5 flex items-start gap-3'>
      <div className='text-[#794c9c]'>{icon}</div>
      <div>
        <h4 className='text-sm font-semibold text-[#3a3a3a]'>{title}</h4>
        <p className='text-sm text-[#6b6b6b]'>{desc}</p>
      </div>
    </div>
  )
}


