import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import { seedSampleData } from '../utils/seedData'

const PROJECT_GRADIENTS = [
    'from-indigo-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-500',
    'from-rose-500 to-pink-600',
    'from-blue-500 to-cyan-600',
    'from-violet-500 to-purple-700',
]

function Dashboard() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [seeding, setSeeding] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [newProject, setNewProject] = useState({ name: '', description: '' })
    const [creating, setCreating] = useState(false)
    const navigate = useNavigate()

    useEffect(() => { initDashboard() }, [])

    const initDashboard = async () => {
        try {
            const res = await API.get('/projects')
            if (res.data.length === 0) {
                setSeeding(true)
                await seedSampleData()
                const seededRes = await API.get('/projects')
                setProjects(seededRes.data)
            } else {
                setProjects(res.data)
            }
        } catch (err) {
            setError('Failed to load projects')
        } finally {
            setLoading(false)
            setSeeding(false)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        setCreating(true)
        try {
            const res = await API.post('/projects', newProject)
            setProjects([...projects, res.data])
            setNewProject({ name: '', description: '' })
            setShowForm(false)
        } catch (err) {
            setError('Failed to create project')
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project?')) return
        try {
            await API.delete(`/projects/${id}`)
            setProjects(projects.filter(p => p.id !== id))
        } catch (err) {
            setError('Failed to delete project')
        }
    }

    if (loading || seeding) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="text-center animate-fade-in">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-indigo-600 font-semibold">
                    {seeding ? '✨ Setting up your workspace...' : 'Loading projects...'}
                </p>
                {seeding && (
                    <p className="text-gray-400 text-sm mt-2">Creating sample projects for you</p>
                )}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Projects
                            <span className="ml-3 text-lg font-normal text-gray-400">
                                ({projects.length})
                            </span>
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            Manage your work and track progress
                        </p>
                    </div>
                    <div className="flex gap-3">
                       
                        <button
                            className="btn-primary"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? '✕ Cancel' : '+ New Project'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                        ⚠ {error}
                    </div>
                )}

                {/* Create form */}
                {showForm && (
                    <div className="bg-white rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-50 p-6 mb-8 animate-slide-up">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs">+</span>
                            New Project
                        </h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Project name
                                </label>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="e.g. My Awesome Project"
                                    value={newProject.name}
                                    onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    className="input-field resize-none"
                                    placeholder="What is this project about?"
                                    rows={2}
                                    value={newProject.description}
                                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className="btn-primary disabled:opacity-70"
                            >
                                {creating ? 'Creating...' : 'Create Project'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Projects grid */}
                {projects.length === 0 ? (
                    <div className="text-center py-20 animate-fade-in">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📋</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No projects yet</h3>
                        <p className="text-gray-400 text-sm">Create your first project to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in">
                        {projects.map((project, index) => {
                            const gradient = PROJECT_GRADIENTS[index % PROJECT_GRADIENTS.length]
                            return (
                                <div
                                    key={project.id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer group"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    {/* Gradient header */}
                                    <div className={`bg-gradient-to-br ${gradient} h-20 p-4 flex justify-between items-start`}>
                                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">
                                                {project.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <button
                                            className="w-7 h-7 bg-white/10 hover:bg-white/30 rounded-lg text-white text-xs transition-all opacity-0 group-hover:opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(project.id)
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                            {project.name}
                                        </h3>
                                        <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                                            {project.description || 'No description'}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-indigo-500 font-medium group-hover:text-indigo-600">
                                                View tasks →
                                            </span>
                                            <span className="text-xs text-gray-300">
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard