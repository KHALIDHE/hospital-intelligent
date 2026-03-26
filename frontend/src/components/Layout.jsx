// ============================================================
// src/components/Layout.jsx — HOSPITAL REDESIGN
// ============================================================
// Main layout wrapper used by ALL authenticated pages.
//
// Structure:
//   ┌──────────────────────────────┐
//   │ Sidebar (fixed left, dark)  │
//   │  ┌───────────────────────┐  │
//   │  │ Navbar (top, white)   │  │
//   │  ├───────────────────────┤  │
//   │  │ Page content (scroll) │  │
//   │  └───────────────────────┘  │
//   └──────────────────────────────┘
//
// Usage:
//   <Layout title="Dashboard">
//     <YourPageContent />
//   </Layout>
//
// The `title` prop shows in the navbar breadcrumb.
// ============================================================

import Sidebar from './Sidebar'
import Navbar  from './Navbar'

function Layout({ children, title = 'Dashboard' }) {
    return (
        // ── Full viewport flex row ─────────────────────────────
        // Sidebar on left, main content on right
        <div className="flex h-screen overflow-hidden bg-slate-50">

            {/* ── Fixed left sidebar ──────────────────────────── */}
            {/* Width = 256px (w-64), never shrinks */}
            <Sidebar />

            {/* ── Right side: Navbar + scrollable content ──────── */}
            {/* Takes all remaining width with flex column */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* ── Top navbar — fixed height h-14 ───────────── */}
                <Navbar title={title} />

                {/* ── Scrollable page content ───────────────────── */}
                {/* overflow-y-auto allows page to scroll           */}
                {/* The subtle dot pattern gives medical texture     */}
                <main className="flex-1 overflow-y-auto p-6 medical-pattern">

                    {/* ── Content wrapper with fade-in ─────────── */}
                    {/* max-w keeps content readable on large screens */}
                    <div className="max-w-7xl mx-auto fade-in">
                        {children}
                    </div>

                </main>

            </div>
        </div>
    )
}

export default Layout