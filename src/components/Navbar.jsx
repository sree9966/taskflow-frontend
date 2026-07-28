import { useNavigate } from 'react-router-dom'

function Navbar() {
    const navigate = useNavigate()
    const email = localStorage.getItem('email')

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('email')
        localStorage.removeItem('taskflow_seeded')
        navigate('/login')
    }

    return (
        <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-6 py-3.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => navigate('/')}
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">T</span>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight group-hover:text-indigo-300 transition-colors">
                        TaskFlow
                    </span>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* User badge */}
                    <div className="hidden sm:flex items-center gap-2 bg-slate-700/50 border border-slate-600 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-slate-300 text-xs font-medium">{email}</span>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="px-4 py-1.5 text-slate-300 border border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-700 hover:text-white transition-all duration-200"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar