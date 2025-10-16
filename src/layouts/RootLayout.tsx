import { NavLink, Outlet } from 'react-router-dom'
import logo from '../../public/logos/nwu_icon.png'
import { HomeIcon, CalendarIcon } from 'lucide-react'
import { PlusIcon } from 'lucide-react'
import { BellIcon } from 'lucide-react'
import { SettingsIcon } from 'lucide-react'
import { MenuIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../components/AuthProvider'

export default function RootLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'staff'
  const navItems = [
    { to: '/app', label: 'Dashboard', Icon: HomeIcon, show: true },
    { to: '/app/events', label: 'Events', Icon: CalendarIcon, show: true },
    { to: '/app/create-event', label: 'Create Event', Icon: PlusIcon, show: isAdmin },
    { to: '/app/notifications', label: 'Notifications', Icon: BellIcon, show: true },
    { to: '/app/admin', label: 'Admin', Icon: SettingsIcon, show: isAdmin },
  ]
  return (
    <div className='h-svh overflow-hidden flex flex-row'>
        {/* Mobile Top Bar */}
        <div className='md:hidden flex flex-row items-center justify-between px-4 py-3 bg-[#6c3d91] w-full fixed top-0 left-0 z-40'>
          <div className='flex flex-row items-center gap-2'>
            <div className='flex flex-row items-center w-fit p-2 justify-center bg-[#492564] rounded-md'>
              <img src={logo} alt='logo' className='w-7 h-7' />
            </div>
            <div className='flex flex-col'>
              <h1 className='text-lg font-bold text-white'>NWU</h1>
              <p className='text-[10px] text-[#ffffff] uppercase'>Campus Connect</p>
            </div>
          </div>
          <button className='text-white' aria-label='Open Menu' onClick={() => setMobileOpen(true)}>
            <MenuIcon className='w-6 h-6' />
          </button>
        </div>

        {/* Desktop Sidebar */}
        <aside className='hidden md:block w-64 bg-[#6c3d91] h-svh overflow-hidden'>
            <nav className='flex flex-col gap-2 h-full'>
              {/* HEADER */}
              <div>
                <div className='flex flex-row items-center gap-2 px-4 py-4'>
                  <div className='flex flex-row items-center w-fit p-2  justify-center bg-[#492564] rounded-md'>
                    <img src={logo} alt='logo' className='w-7 h-7' />
                  </div>
                  <div className='flex flex-col'>
                    <h1 className='text-xl font-bold text-white'>NWU</h1>
                    <p className='text-xs text-[#ffffff] uppercase'>Campus Connect</p>
                  </div>
                </div>
              </div>
                <ul className='flex flex-col gap-2 px-2 text-[#d5d5d5]'>
                  {navItems.filter(i => i.show).map(({ to, label, Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/app'}
                      className={({ isActive }) =>
                        `flex flex-row items-center gap-2 px-4 py-2 w-full rounded-md hover:bg-[#794c9c] transition-all duration-150 ${isActive ? ' bg-[#9c73bb] text-white' : ''}`
                      }
                    >
                      <Icon className='w-4 h-4' />
                      {label}
                    </NavLink>
                  ))}
                </ul>
                <div className='mt-auto px-2 pb-4'>
                  {user ? (
                    <button className='w-full bg-[#9c73bb] hover:bg-[#a685c6] text-white px-4 py-2 rounded-md' onClick={() => signOut()}>Sign Out</button>
                  ) : (
                    <NavLink to='/auth' className='block w-full text-center bg-[#9c73bb] hover:bg-[#a685c6] text-white px-4 py-2 rounded-md'>Sign In</NavLink>
                  )}
                </div>
            </nav>
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className='md:hidden fixed inset-0 z-50'>
            <div className='absolute inset-0 bg-black/50' onClick={() => setMobileOpen(false)} />
            <aside className='absolute left-0 top-0 h-svh w-64 bg-[#6c3d91] shadow-xl'>
              <nav className='flex flex-col gap-2 h-full'>
                <div className='flex flex-row items-center justify-between px-4 py-4'>
                  <div className='flex flex-row items-center gap-2'>
                    <div className='flex flex-row items-center w-fit p-2 justify-center bg-[#492564] rounded-md'>
                      <img src={logo} alt='logo' className='w-7 h-7' />
                    </div>
                    <div className='flex flex-col'>
                      <h1 className='text-xl font-bold text-white'>NWU</h1>
                      <p className='text-xs text-[#ffffff] uppercase'>Campus Connect</p>
                    </div>
                  </div>
                  <button className='text-white' aria-label='Close Menu' onClick={() => setMobileOpen(false)}>
                    <XIcon className='w-5 h-5' />
                  </button>
                </div>
                <ul className='flex flex-col gap-2 px-2 text-[#d5d5d5]'>
                  {navItems.filter(i => i.show).map(({ to, label, Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/app'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex flex-row items-center gap-2 px-4 py-2 w-full rounded-md hover:bg-[#794c9c] transition-all duration-150 ${isActive ? ' bg-[#9c73bb] text-white' : ''}`
                      }
                    >
                      <Icon className='w-4 h-4' />
                      {label}
                    </NavLink>
                  ))}
                </ul>
                <div className='mt-auto px-2 pb-4'>
                  {user ? (
                    <button className='w-full bg-[#9c73bb] hover:bg-[#a685c6] text-white px-4 py-2 rounded-md' onClick={() => { setMobileOpen(false); signOut() }}>Sign Out</button>
                  ) : (
                    <NavLink to='/auth' className='block w-full text-center bg-[#9c73bb] hover:bg-[#a685c6] text-white px-4 py-2 rounded-md' onClick={() => setMobileOpen(false)}>Sign In</NavLink>
                  )}
                </div>
              </nav>
            </aside>
          </div>
        )}
        <div className='w-full h-[calc(100svh-56px)] md:h-svh overflow-hidden md:ml-0 mt-14 md:mt-0'>
        <Outlet />
        </div>
    </div>
  )
}
