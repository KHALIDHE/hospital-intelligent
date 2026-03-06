// ============================================================
// src/components/Layout.jsx
// ============================================================
// Main layout wrapper used by EVERY page after login.
// Combines Sidebar + Navbar + page content in one structure.
//
// Structure:
//   ┌──────────────────────────────────┐
//   │  Sidebar  │  Navbar              │
//   │           ├──────────────────────│
//   │  (nav     │  Page content        │
//   │   menu)   │  (children prop)     │
//   └──────────────────────────────────┘
//
// HOW to use it in any page:
//   import Layout from '../../components/Layout'
//
//   export default function AnyPage() {
//     return (
//       <Layout title="My Page Title">
//         <div>your page content here</div>
//       </Layout>
//     )
//   }
//
// PROPS:
//   title    → shown in the top Navbar e.g. "Dashboard"
//   children → the page content rendered in the main area
// ============================================================

import Sidebar from './Sidebar'
import Navbar  from './Navbar'


function Layout({ title, children }) {
    return (
        // ── Full screen flex row layout ───────────────────────
        // h-screen     → takes full screen height
        // overflow-hidden → prevents double scrollbars
        // bg-gray-50   → light gray background for all pages
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            {/* ── LEFT: Sidebar navigation menu ──────────────── */}
            {/* Sidebar reads user role from AuthContext */}
            {/* and shows the correct menu items automatically */}
            <Sidebar />

            {/* ── RIGHT: Navbar + Page content ───────────────── */}
            {/* flex-1 → takes all remaining horizontal space */}
            {/* flex flex-col → stack navbar on top, content below */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top navbar with page title + notifications + logout */}
                {/* title prop is passed down to Navbar */}
                <Navbar title={title} />

                {/* ── Page content area ──────────────────────── */}
                {/* overflow-y-auto → this area scrolls vertically */}
                {/* p-6 → padding around all content */}
                {/* flex-1 → takes all remaining vertical space */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* children = everything inside <Layout>...</Layout> */}
                    {children}
                </main>

            </div>
        </div>
    )
}

export default Layout