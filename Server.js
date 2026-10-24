require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} request made to: ${req.url}`);
  next();
};
app.use(requestLogger);

// In-memory database
let todos = [
  { id: 1, task: "Complete Express API assignment", status: "active" },
  { id: 2, task: "Review JavaScript async/await", status: "completed" }
];

// 1. GET: Retrieve all todos
app.get('/todos', (req, res) => {
  res.json({
    success: true,
    count: todos.length,
    data: todos
  });
});

// 2. GET: Array bonus - Retrieve active todos (filter !completed)[cite: 9]
app.get('/todos/active', (req, res) => {
  const activeTodos = todos.filter(t => t.status.toLowerCase() !== 'completed');
  res.json({
    success: true,
    count: activeTodos.length,
    data: activeTodos
  });
});

// 3. GET: Single read by ID[cite: 9]
app.get('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);
  const todo = todos.find(t => t.id === todoId);

  if (!todo) {
    return res.status(404).json({
      success: false,
      error: 'Todo not found with the given ID.'
    });
  }

  res.json({
    success: true,
    data: todo
  });
});

// 4. POST: Create a new todo with "task" field validation[cite: 9]
app.post('/todos', (req, res) => {
  const { task, status } = req.body;

  // Validation: POST requires "task" field[cite: 9]
  if (!task || typeof task !== 'string' || task.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Validation error: "task" field is required and must be a non-empty string.'
    });
  }

  const nextId = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;

  const newTodo = {
    id: nextId,
    task: task.trim(),
    status: status || 'active'
  };

  todos.push(newTodo);
  res.status(201).json({
    success: true,
    message: 'Todo created successfully',
    data: newTodo
  });
});

// 5. PUT: Update an existing todo
app.put('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);
  const todo = todos.find(t => t.id === todoId);

  if (!todo) {
    return res.status(404).json({
      success: false,
      error: 'Todo not found.'
    });
  }

  const { task, status } = req.body;
  if (task !== undefined) todo.task = task.trim();
  if (status !== undefined) todo.status = status;

  res.json({
    success: true,
    message: 'Todo updated successfully',
    data: todo
  });
});

// 6. DELETE: Remove a todo
app.delete('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === todoId);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Todo not found.'
    });
  }

  const deletedTodo = todos.splice(index, 1)[0];
  res.json({
    success: true,
    message: 'Todo deleted successfully',
    data: deletedTodo
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});