import { NavLink, Outlet } from 'react-router-dom'
import { Home, Search, PlusCircle, User, Wallet, Settings } from 'lucide-react'
import { Mark } from './Logo.jsx'
import { Navigate } from 'react-router-dom'
import { getCachedUser } from '../lib/api.js'

const navItems = [
  { to: '/app/home', label: 'Home', icon: Home },
  { to: '/app/find-work', label: 'Find Work', icon: Search },
  { to: '/app/post-task', label: 'Post a Task', icon: PlusCircle },
  { to: '/app/wallet', label: 'Wallet', icon: Wallet },
  { to: '/app/profile', label: 'Profile', icon: User }
]

// Shown in the desktop sidebar. On mobile, Settings is the gear icon on the Profile page.
const settingsItem = { to: '/app/settings', label: 'Settings', icon: Settings }

function SideLink({ item }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
          isActive
            ? 'bg-trust-700 text-white shadow-[0_8px_18px_-10px_rgba(23,58,94,0.7)]'
            : 'text-trust-500 hover:bg-trust-50 hover:text-trust-700'
        }`
      }
    >
      <Icon size={20} />
      {item.label}
    </NavLink>
  )
}

function TabLink({ item }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 text-xs font-medium transition-colors ${
          isActive ? 'text-trust-700' : 'text-trust-300'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`px-4 py-1 rounded-full transition-colors ${isActive ? 'bg-growth-100' : ''}`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
          </span>
          <span>{item.label === 'Post a Task' ? 'Post' : item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function AppShell() {
  if (!getCachedUser()) return <Navigate to="/auth" replace />
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 overflow-y-auto border-r border-trust-100 bg-white/85 backdrop-blur px-5 py-8">
        <div className="flex justify-center mb-8">
          <Mark size={150} />
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <SideLink key={item.to} item={item} />
          ))}
        </nav>
        <div className="mt-auto pt-6 flex flex-col gap-4">
          <SideLink item={settingsItem} />
          <div className="rounded-2xl bg-growth-50 border border-growth-100 p-4 text-xs text-trust-500 leading-relaxed">
            WorkLink connects township communities to everyday paid work, same day.
          </div>
        </div>
      </aside>

      <div className="flex-1 md:ml-64 pb-24 md:pb-0">
        <main className="max-w-3xl mx-auto px-4 py-6 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t border-trust-100 flex px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-20">
        {navItems.map((item) => (
          <TabLink key={item.to} item={item} />
        ))}
      </nav>
    </div>
  )
}
