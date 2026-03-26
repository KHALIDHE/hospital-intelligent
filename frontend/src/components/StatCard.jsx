// ============================================================
// src/components/StatCard.jsx
// ============================================================
// Reusable stat card used in ALL dashboards.
// Shows a number, label, icon, and optional trend/note.
//
// HOW to use:
//   import StatCard from '../../components/StatCard'
//   <StatCard icon="👥" label="Total Patients" value={42} note="Assigned to you" color="blue" />
//
// color options: blue | teal | purple | green | red | yellow
// ============================================================

const COLOR_MAP = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'bg-blue-100',   border: 'border-blue-100'   },
    teal:   { bg: 'bg-teal-50',   text: 'text-teal-700',   icon: 'bg-teal-100',   border: 'border-teal-100'   },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'bg-purple-100', border: 'border-purple-100' },
    green:  { bg: 'bg-green-50',  text: 'text-green-700',  icon: 'bg-green-100',  border: 'border-green-100'  },
    red:    { bg: 'bg-red-50',    text: 'text-red-700',    icon: 'bg-red-100',    border: 'border-red-100'    },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'bg-yellow-100', border: 'border-yellow-100' },
    gray:   { bg: 'bg-gray-50',   text: 'text-gray-700',   icon: 'bg-gray-100',   border: 'border-gray-100'   },
}


function StatCard({ icon, label, value, note, color = 'blue' }) {

    const c = COLOR_MAP[color] || COLOR_MAP.blue

    return (
        <div className={`bg-white rounded-2xl border ${c.border} p-5 flex items-start gap-4`}
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

            {/* Icon box */}
            <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center text-xl flex-shrink-0`}>
                {icon}
            </div>

            {/* Text content */}
            <div>
                {/* Big number */}
                <p className={`text-2xl font-bold ${c.text} leading-none`}>
                    {value}
                </p>
                {/* Label */}
                <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
                {/* Optional note */}
                {note && (
                    <p className="text-xs text-gray-400 mt-0.5">{note}</p>
                )}
            </div>

        </div>
    )
}

export default StatCard