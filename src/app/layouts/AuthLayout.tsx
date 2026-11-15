import { CheckCircle2 } from 'lucide-react'
import { Outlet } from 'react-router'
import { Logo } from '@/shared/components/Logo'

const HIGHLIGHTS = [
  'Contrate serviços e pague com o saldo da sua carteira',
  'Prestadores recebem no momento da reserva',
  'Cancelamentos com reembolso integral e histórico completo',
]

export function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0f1d3a] p-10 text-white lg:flex">
        <Logo className="text-white [&_span_span]:text-teal-200" />
        <div className="space-y-6">
          <h2 className="max-w-md text-3xl leading-tight font-semibold">
            A forma simples de contratar e oferecer serviços em Angola.
          </h2>
          <ul className="space-y-3 text-sm text-slate-200">
            {HIGHLIGHTS.map((text) => (
              <li key={text} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-teal-300" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-400">Pagamentos em Kwanzas (AOA).</p>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-teal-400/20 blur-3xl"
        />
      </aside>
      <main className="flex flex-col items-center justify-center gap-6 p-4 py-10">
        <Logo className="lg:hidden" />
        <Outlet />
      </main>
    </div>
  )
}
