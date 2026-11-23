const Joi = require('joi');
const express = require('express');
const pino = require('pino');
const pinohttp = require('pino-http');
const app = express();
app.use(pinohttp({ logger }))
app.use(express.json()); // Parse JSON bodies
const logger = pino({ level: 'debug' });

let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
  { id: 3, task: 'Clone the repo', completed: true },
];

const patchTodoSchema = Joi.object({
  task: Joi.string().min(3),
  completed: Joi.boolean(),
}).min(1);

//POST - Create todo.0
app.post('/todos', (req, res) => {
try {
    schema.validate(req.body)
  const newTodo = { id: todos.length + 1, completed:false, ...req.body }; // Auto-ID
  todos.push(newTodo);
  

  req.log.info('New todo created');
  res.status(201).json(newTodo); // Echo back
} catch (err) {
  next(err)
}
});     

app.patch('/todos/:id', (req,res, next) => {
  try{
  const { error, value } = patchTodoSchema.validate(req.body)
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      Object.assign(todo, value)
      req.log.info({ todoId: todo.id }, 'Todo updated');
      res.status(200).json(todo);
}
    catch (err) {
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
  res.json({success: true, data:active}); // Custom Read!
});                                                                     

// GET - Read Single
app.get('/todos/:id', (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id)); // Array.find()
  res.status(200).json(todo);
});


app.use((err, req, res, next) => {
 
  res.status(500).json({ error: 'Server error!' });
  logger.error({ err: new Error('Failure') }, 'Error occurred');
});

const PORT = 3002;
app.listen(PORT, () => logger.info(`Server on port ${PORT}`));
