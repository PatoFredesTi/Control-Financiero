import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, BellRing, CalendarDays, Home, Plus, ReceiptText, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Inicio', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/expenses', label: 'Gastos', icon: ReceiptText },
  { to: '/financial-calendar', label: 'Calendario', icon: CalendarDays },
  { to: '/notifications', label: 'Alertas', icon: BellRing },
];

function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed left-3 right-3 top-3 z-50 flex items-center justify-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 text-sm font-semibold text-amber-100 shadow-2xl backdrop-blur">
      <WifiOff size={18} /> Estás sin conexión. La PWA mantiene la interfaz disponible, pero algunos datos pueden no actualizarse.
    </div>
  );
}

const publicPaths = new Set(['/', '/login', '/register', '/features', '/pricing', '/legal']);

function MobileBottomNav() {
  const location = useLocation();
  if (publicPaths.has(location.pathname)) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-2xl backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[0.68rem] font-semibold transition ${isActive ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function QuickAddFloatingButton() {
  const location = useLocation();
  if (location.pathname === '/quick-add' || publicPaths.has(location.pathname)) return null;

  return (
    <NavLink to="/quick-add" className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-2xl transition hover:scale-105 hover:bg-emerald-400 md:hidden" aria-label="Agregar movimiento rápido">
      <Plus size={28} />
    </NavLink>
  );
}

export function RootLayout() {
  return (
    <>
      <OfflineBanner />
      <Outlet />
      <QuickAddFloatingButton />
      <MobileBottomNav />
    </>
  );
}
