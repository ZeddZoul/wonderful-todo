const Joi = require('joi');
const express = require('express');
const pino = require('pino');
const pinohttp = require('pino-http');

const app = express();
const logger = pino({ level: 'debug' });

app.use(pinohttp({ logger }));
app.use(express.json()); // Parse JSON bodies

let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
  { id: 3, task: 'Clone the repo', completed: true },
];

const createTodoSchema = Joi.object({
  task: Joi.string().min(3).required(),
  completed: Joi.boolean().default(false),
});

const patchTodoSchema = Joi.object({
  task: Joi.string().min(3),
  completed: Joi.boolean(),
}).min(1);

// POST - Create todo
app.post('/todos', (req, res, next) => {
  try {
    const { error, value } = createTodoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const newId = todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1;
    const newTodo = { id: newId, completed: false, ...value };
    todos.push(newTodo);

    req.log.info({ todoId: newTodo.id }, 'New todo created');
    res.status(201).json(newTodo); // Echo back
  } catch (err) {
    next(err);
  }
});

// PATCH - Update todo
app.patch('/todos/:id', (req, res, next) => {
  try {
    const { error, value } = patchTodoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const id = parseInt(req.params.id, 10);
    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    Object.assign(todo, value);
    req.log.info({ todoId: todo.id }, 'Todo updated');
    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
});

// GET – Read All todos
app.get('/todos', (req, res) => {
  res.status(200).json(todos); // Send array as JSON
});

// GET – Read all active todos
app.get('/todos/active', (req, res) => {
  const active = todos.filter((t) => !t.completed);
  res.status(200).json({ success: true, data: active }); // Custom Read!
});

// GET - Read Single
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const todo = todos.find((t) => t.id === id); // Array.find()
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.status(200).json(todo);
});

// DELETE - Delete todo
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const [deletedTodo] = todos.splice(index, 1);
  req.log.info({ todoId: deletedTodo.id }, 'Todo deleted');
  res.status(200).json({ message: 'Todo deleted successfully', todo: deletedTodo });
});

// Central error handler
app.use((err, req, res, next) => {
  logger.error({ err }, 'Error occurred');
  res.status(500).json({ error: 'Server error!' });
});

const PORT = 3002;
app.listen(PORT, () => logger.info(`Server on port ${PORT}`));
