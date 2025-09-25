import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// The URL where our Flask AI backend is running
const API_URL = 'http://localhost:5001';

function App() {
  // State for the form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [userPriority, setUserPriority] = useState('Medium');
  
  // State for the list of tasks and loading indicator
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all tasks from the DB when the app loads
  useEffect(() => {
    axios.get(`${API_URL}/tasks`).then(response => {
      setTasks(response.data);
    }).catch(error => {
      console.error("Error fetching tasks:", error);
    });
  }, []);

  // --- Main AI Integration Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return alert("Title is required!");
    setIsLoading(true);

    try {
      // 1. Get AI predictions from the backend FIRST
      const predictPayload = { title, description, category, user_priority: userPriority };
      const predictResponse = await axios.post(`${API_URL}/predict`, predictPayload);
      const { ai_priority, ai_deadline_hours } = predictResponse.data;
      
      // 2. Create the final task object, including the AI's suggestions
      const taskPayload = {
        title,
        description,
        category,
        userPriority,
        aiPriority: ai_priority, // Add AI results to the object
        aiDeadlineHours: ai_deadline_hours,
        status: 'To Do',
      };
      
      // 3. Save the complete task to our database
      const addTaskResponse = await axios.post(`${API_URL}/tasks`, taskPayload);
      
      // 4. Update the UI with the newly created task
      setTasks([...tasks, addTaskResponse.data]);
      
      // Reset form
      setTitle('');
      setDescription('');

    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to add task. Is the backend server running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>AI-Enhanced Task Manager</h1>
        <p>A React implementation of the research project</p>
      </header>
      
      <main className="main-content">
        <div className="form-container card">
          <h2>Create a New Task</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required />
            <textarea placeholder="Description (add keywords like 'urgent', 'important'!)" value={description} onChange={e => setDescription(e.target.value)} />
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
            <button type="submit" disabled={isLoading}>
              {isLoading ? '🤖 Analyzing...' : 'Add Task with AI Insight'}
            </button>
          </form>
        </div>
        
        <div className="task-list-container">
          <h2>Task Board</h2>
          <div className="task-list">
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className={`card task-card priority-${task.aiPriority?.toLowerCase()}`}>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <div className="task-meta">
                  <span><strong>Category:</strong> {task.category}</span>
                  <span><strong>Your Priority:</strong> {task.userPriority}</span>
                </div>
                <div className="ai-suggestions">
                  <span><strong>AI Priority:</strong> {task.aiPriority}</span>
                  <span><strong>AI Est. Hours:</strong> {task.aiDeadlineHours}</span>
                </div>
              </div>
            )) : <p>No tasks yet. Create one!</p>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;