import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'

const STATUS_CONFIG = {
    todo:        { label: 'To Do',       class: 'badge-todo',        dot: 'bg-amber-400' },
    in_progress: { label: 'In Progress', class: 'badge-in_progress', dot: 'bg-blue-400' },
    done:        { label: 'Done',        class: 'badge-done',        dot: 'bg-green-400' },
}

const PRIORITY_CONFIG = {
    high:   { class: 'badge-high',   label: 'High' },
    medium: { class: 'badge-medium', label: 'Medium' },
    low:    { class: 'badge-low',    label: 'Low' },
}

function ProjectDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [project, setProject] = useState(null)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [creating, setCreating] = useState(false)
    const [filter, setFilter] = useState('all')
    const [newTask, setNewTask] = useState({
        title: '', description: '', priority: 'medium', due_date: ''
    })

    useEffect(() => { fetchProject() }, [id])

    const fetchProject = async () => {
        try {
            const res = await API.get(`/projects/${id}`)
            setProject(res.data.project)
            setTasks(res.data.tasks)
        } catch (err) {
            setError('Failed to load project')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTask = async (e) => {
        e.preventDefault()
        setCreating(true)
        try {
            const payload = { ...newTask }
            if (!payload.due_date) delete payload.due_date
            const res = await API.post(`/projects/${id}/tasks`, payload)
            setTasks([...tasks, res.data])
            setNewTask({ title: '', description: '', priority: 'medium', due_date: '' })
            setShowForm(false)
        } catch (err) {
            setError('Failed to create task')
        } finally {
            setCreating(false)
        }
    }

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            const res = await API.patch(`/tasks/${taskId}`, { status: newStatus })
            setTasks(tasks.map(t => t.id === taskId ? res.data : t))
        } catch (err) {
            setError('Failed to update task')
        }
    }

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Delete this task?')) return
        try {
            await API.delete(`/tasks/${taskId}`)
            setTasks(tasks.filter(t => t.id !== taskId))
        } catch (err) {
            setError('Failed to delete task')
        }
    }

    const filteredTasks = filter === 'all'
        ? tasks
        : tasks.filter(t => t.status === filter)

    const counts = {
        all: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        done: tasks.filter(t => t.status === 'done').length,
    }

    const completionPct = tasks.length > 0
        ? Math.round((counts.done / tasks.length) * 100)
        : 0

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
            <div className="max-w-4xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="mt-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50 transition-all"
                        >
                            ← Back
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {project?.name}
                            </h1>
                            <p className="text-gray-400 text-sm mt-0.5">
                                {project?.description || 'No description'}
                            </p>
                        </div>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? '✕ Cancel' : '+ New Task'}
                    </button>
                </div>

                {/* Progress bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">
                            Project Progress
                        </span>
                        <span className="text-sm font-bold text-indigo-600">
                            {completionPct}%
                        </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${completionPct}%` }}
                        ></div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span>{counts.done} done</span>
                        <span>{counts.in_progress} in progress</span>
                        <span>{counts.todo} to do</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                        ⚠ {error}
                    </div>
                )}

                {/* Create task form */}
                {showForm && (
                    <div className="bg-white rounded-2xl border border-indigo-100 shadow-lg p-6 mb-6 animate-slide-up">
                        <h3 className="font-semibold text-gray-900 mb-4">New Task</h3>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Task title
                                </label>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="e.g. Fix login bug"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    className="input-field resize-none"
                                    placeholder="What needs to be done?"
                                    rows={2}
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Priority
                                    </label>
                                    <select
                                        className="input-field"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Due date
                                    </label>
                                    <input
                                        className="input-field"
                                        type="date"
                                        value={newTask.due_date}
                                        onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className="btn-primary disabled:opacity-70"
                            >
                                {creating ? 'Creating...' : 'Create Task'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Filter tabs */}
                <div className="flex gap-2 mb-5 flex-wrap">
                    {['all', 'todo', 'in_progress', 'done'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                                filter === f
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-200'
                            }`}
                        >
                            {f === 'all' ? 'All' :
                             f === 'in_progress' ? 'In Progress' :
                             f === 'todo' ? 'To Do' : 'Done'}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {counts[f]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tasks */}
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <span className="text-4xl mb-3 block">✅</span>
                        <h3 className="font-semibold text-gray-600 mb-1">
                            {filter === 'all' ? 'No tasks yet' : `No ${filter.replace('_', ' ')} tasks`}
                        </h3>
                        <p className="text-gray-400 text-sm">
                            {filter === 'all' ? 'Create your first task above' : 'Try a different filter'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 animate-fade-in">
                        {filteredTasks.map(task => {
                            const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo
                            const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
                            const isOverdue = task.due_date &&
                                new Date(task.due_date) < new Date() &&
                                task.status !== 'done'

                            return (
                                <div
                                    key={task.id}
                                    className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all duration-200 ${
                                        task.status === 'done'
                                            ? 'border-green-100 opacity-80'
                                            : 'border-gray-100'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            {/* Status dot */}
                                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${statusCfg.dot}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-semibold text-gray-900 ${
                                                    task.status === 'done' ? 'line-through text-gray-400' : ''
                                                }`}>
                                                    {task.title}
                                                </h3>
                                                {task.description && (
                                                    <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                                                        {task.description}
                                                    </p>
                                                )}
                                                {/* Badges */}
                                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                    <span className={priorityCfg.class}>
                                                        {priorityCfg.label}
                                                    </span>
                                                    {task.due_date && (
                                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                                            isOverdue
                                                                ? 'bg-red-50 text-red-500'
                                                                : 'bg-gray-50 text-gray-400'
                                                        }`}>
                                                            {isOverdue ? '⚠ Overdue · ' : '📅 '}
                                                            {new Date(task.due_date).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <select
                                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer ${statusCfg.class}`}
                                                value={task.status}
                                                onChange={e => handleUpdateStatus(task.id, e.target.value)}
                                            >
                                                <option value="todo">To Do</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="done">Done</option>
                                            </select>
                                            <button
                                                className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all text-sm"
                                                onClick={() => handleDeleteTask(task.id)}
                                            >
                                                ✕
                                            </button>
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

export default ProjectDetail