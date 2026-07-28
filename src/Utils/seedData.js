import API from '../api/axios'

const SEED_KEY = 'taskflow_seeded'

const sampleProjects = [
    {
        name: "TaskFlow API",
        description: "Backend REST API with DRF, PostgreSQL and Docker",
        tasks: [
            { title: "Implement JWT authentication", description: "Custom JWTAuthentication class using PyJWT and bcrypt", priority: "high", status: "done" },
            { title: "Add BasePermission classes", description: "IsProjectOwner and CanDeleteTask permission classes", priority: "high", status: "done" },
            { title: "Write pytest test suite", description: "7 automated tests covering auth flows and permissions", priority: "medium", status: "done" },
            { title: "Deploy to Render", description: "Dockerized deployment with PostgreSQL on Render free tier", priority: "medium", status: "in_progress" },
        ]
    },
    {
        name: "Yoga AI Coach",
        description: "FastAPI + LangChain + Groq AI agent for yoga recommendations",
        tasks: [
            { title: "Build FastAPI backend", description: "Set up FastAPI with async endpoints and Pydantic models", priority: "high", status: "done" },
            { title: "Integrate Groq LLM with tool calling", description: "AI agent that calls get_poses_for_concern and check_contraindications tools", priority: "high", status: "in_progress" },
            { title: "Add RAG pipeline", description: "ChromaDB vector store for yoga pose retrieval", priority: "medium", status: "todo" },
        ]
    },
    {
        name: "Portfolio Website",
        description: "Personal developer portfolio to showcase projects",
        tasks: [
            { title: "Design landing page", description: "Hero section with skills, projects and contact form", priority: "high", status: "todo" },
            { title: "Add project showcases", description: "TaskFlow and Yoga AI Coach with live links and GitHub", priority: "medium", status: "todo" },
            { title: "Deploy on Vercel", description: "Custom domain with SSL certificate", priority: "low", status: "todo" },
        ]
    },
    {
        name: "Interview Prep",
        description: "Preparation tracker for Python developer interviews",
        tasks: [
            { title: "DSA — Arrays and Hashmaps", description: "Complete NeetCode 150 arrays section — 20 problems", priority: "high", status: "in_progress" },
            { title: "DRF concepts revision", description: "Serializers, permissions, authentication, viewsets", priority: "high", status: "done" },
            { title: "Mock interview practice", description: "Practice explaining TaskFlow project out loud", priority: "medium", status: "todo" },
        ]
    }
]

export const seedSampleData = async () => {
    // Only seed once per browser session
    if (localStorage.getItem(SEED_KEY)) return

    try {
        for (const projectData of sampleProjects) {
            // Create project
            const projectRes = await API.post('/projects', {
                name: projectData.name,
                description: projectData.description
            })

            const projectId = projectRes.data.id

            // Create tasks for this project
            for (const task of projectData.tasks) {
                const taskRes = await API.post(`/projects/${projectId}/tasks`, {
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                })

                // Update status if not todo (default is todo)
                if (task.status !== 'todo') {
                    await API.patch(`/tasks/${taskRes.data.id}`, {
                        status: task.status
                    })
                }
            }
        }

        // Mark as seeded so it doesn't run again
        localStorage.setItem(SEED_KEY, 'true')

    } catch (err) {
        console.error('Seeding failed:', err)
    }
}