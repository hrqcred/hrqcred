"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Banknote,
  ClipboardList,
  LogOut,
  DollarSign,
  BarChart3,
  Settings,
  CalendarDays,
  Menu,
  X,
  Download,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/solicitacoes", label: "Solicitações", icon: ClipboardList },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/emprestimos", label: "Empréstimos", icon: Banknote },
  { href: "/admin/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
];

const futureItems = [{ label: "Configurações", icon: Settings }];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const sidebar = (
    <div className="flex flex-col h-full bg-brand-dark border-r border-brand-green/10">
      <div className="p-5 border-b border-brand-green/10">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">
            Brasília<span className="text-brand-gold">Cred</span>
          </span>
        </Link>
        <p className="text-gray-500 text-xs mt-1">Painel Administrativo</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-green/10 text-brand-green"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-gray-800">
          <p className="text-gray-600 text-xs px-3 mb-2 uppercase tracking-wider">
            Em breve
          </p>
          {futureItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 cursor-not-allowed"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              <span className="ml-auto text-[10px] bg-brand-gold/20 text-brand-gold px-1.5 py-0.5 rounded">
                SOON
              </span>
            </div>
          ))}
        </div>
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-brand-dark border border-brand-green/20 text-white p-2 rounded-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebar}
      </aside>
    </>
  );
}
