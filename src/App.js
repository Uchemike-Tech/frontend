import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Backend API URL
const API_URL = 'http://localhost:5001';

function App() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Work');
    const [userPriority, setUserPriority] = useState('Medium');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch all tasks on component mount
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`${API_URL}/tasks`);
                setTasks(response.data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
        fetchTasks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) {
            alert('Title is required!');
            return;
        }
        setIsLoading(true);

        try {
            // 1. Get AI predictions
            const predictResponse = await axios.post(`${API_URL}/predict`, {
                title,
                description,
                category,
                user_priority: userPriority
            });
            
            const { predicted_priority, predicted_deadline_hours } = predictResponse.data;

            // 2. Create the task with AI enhancements
            const taskData = {
                title,
                description,
                category,
                user_priority: userPriority,
                ai_priority: predicted_priority,
                ai_deadline_hours: predicted_deadline_hours
            };

            const addTaskResponse = await axios.post(`${API_URL}/tasks`, taskData);
            setTasks([...tasks, addTaskResponse.data]);

            // Reset form
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error("Error creating task:", error);
            alert('Failed to create task. Make sure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <header>
                <h1>AI-Enhanced Task Management</h1>
                <p>Fulfilling the vision of the research paper by Festus Prince Chisom</p>
            </header>
            
            <div className="main-content">
                <div className="form-container card">
                    <h2>Add a New Task</h2>
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required />
                        <textarea placeholder="Task Description" value={description} onChange={e => setDescription(e.target.value)} />
                        <select value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="Work">Work</option>
                            <option value="Personal">Personal</option>
                            <option value="Study">Study</option>
                        </select>
                        <select value={userPriority} onChange={e => setUserPriority(e.target.value)}>
                            <option value="Low">Low Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="High">High Priority</option>
                        </select>
                        <button type="submit" disabled={isLoading}>{isLoading ? 'Analyzing...' : 'Add Task with AI Insight'}</button>
                    </form>
                </div>

                <div className="task-list-container">
                    <h2>Your Tasks</h2>
                    <div className="task-list">
                        {tasks.length > 0 ? tasks.map(task => (
                            <div key={task.id} className={`card task-card priority-${task.ai_priority?.toLowerCase()}`}>
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <div className="task-meta">
                                    <span><strong>Category:</strong> {task.category}</span>
                                    <span><strong>AI Priority:</strong> {task.ai_priority}</span>
                                    <span><strong>AI Est. Hours:</strong> {task.ai_deadline_hours}</span>
                                </div>
                            </div>
                        )) : <p>No tasks yet. Add one!</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;