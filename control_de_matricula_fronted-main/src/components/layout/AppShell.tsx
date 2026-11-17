import {
  ChevronDown,
  Guitar,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Music4,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { BrandMark } from '@/components/shared/brand-mark'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAuth } from '@/context/AuthContext'
import { APP } from '@/utils/constants'
import { cn } from '@/utils/utils'

const navigation = [
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/estudiantes', label: 'Estudiantes', icon: Users },
  { to: '/instrumentos', label: 'Instrumentos', icon: Guitar },
  { to: '/asignaciones', label: 'Asignaciones', icon: Link2 },
] as const

const sectionTitles: Record<string, string> = {
  '/dashboard': 'Panel de control',
  '/estudiantes': 'Gestión de estudiantes',
  '/estudiantes/nuevo': 'Nuevo estudiante',
  '/instrumentos': 'Gestión de instrumentos',
  '/asignaciones': 'Asignaciones de instrumentos',
}

function useSectionTitle(): string {
  const { pathname } = useLocation()

  if (sectionTitles[pathname]) {
    return sectionTitles[pathname]
  }

  if (pathname.startsWith('/estudiantes/')) {
    return 'Detalle del estudiante'
  }

  return 'Panel de control'
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Navegación principal">
      <p className="px-3 pt-2 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Gestión
      </p>
      {navigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={cn(
                  'size-4 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground',
                )}
                aria-hidden="true"
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </>
          )}
        </NavLink>
      ))}

      <div className="mt-auto rounded-xl border border-dashed bg-card/60 p-3">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Music4 className="size-4 text-primary" aria-hidden="true" />
          Periodo 2026
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Datos sincronizados en tiempo real con la API del núcleo a través de
          <code className="mx-1 rounded bg-muted px-1 py-0.5 text-[10px]">
            .env
          </code>
          .
        </p>
      </div>
    </nav>
  )
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <BrandMark />
      </div>
      <div className="flex flex-1 flex-col py-4">
        <SidebarNav />
      </div>
    </aside>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 px-2 sm:pr-3"
          aria-label="Abrir menú de usuario"
        >
          <Avatar className="size-7">
            <AvatarFallback className="text-[11px]">
              {user?.nombre.slice(0, 2).toUpperCase() ?? 'NP'}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
            {user?.nombre}
          </span>
          <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{user?.nombre}</p>
          <p className="text-xs text-muted-foreground">
            {user?.cedula} · {user?.rol === 'admin' ? 'Administrador' : 'Operador'}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={handleLogout}
          className="cursor-pointer"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const title = useSectionTitle()

  return (
    <div className="min-h-svh bg-background">
      <Sidebar />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú de navegación"
          >
            <Menu className="size-5" />
          </Button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{title}</p>
            <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
              {APP.name}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main className="w-full min-w-0">
          <Outlet />
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-5 py-4 text-left">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <SheetDescription className="sr-only">
              Accede a las secciones del sistema.
            </SheetDescription>
            <BrandMark />
          </SheetHeader>
          <div className="flex flex-1 flex-col py-4">
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
