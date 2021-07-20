const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(400).json({ error: "Customer not found" });
  }
  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };

  if (users.find((user) => user.username === username)) {
    return response.status(400).json({ error: "Usuario ja existe" });
  }
  users.push(user);
  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.user;
  const user = users.find((user) => user.username === username);
  return response.status(200).send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.user;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  const userIndex = users.indexOf(user);
  users[userIndex].todos.push(todo);
  return response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const user = request.user;

  const userIndex = users.indexOf(user);

  const toUpdateTodo = users[userIndex].todos.find((todo) => todo.id === id);

  if (!toUpdateTodo) {
    return response.status(404).send({ error: "toDo does not exists" });
  }
  toUpdateTodo.deadline = deadline;
  toUpdateTodo.title = title;

  return response.status(200).send(toUpdateTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const userIndex = users.indexOf(user);

  const toUpdateTodo = users[userIndex].todos.find((todo) => todo.id === id);

  if (!toUpdateTodo) {
    return response.status(404).send({ error: "toDo does not exists" });
  }
  toUpdateTodo.done = true;

  return response.status(200).send(toUpdateTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const userIndex = users.indexOf(user);

  const toDeleteTodo = users[userIndex].todos.find((todo) => todo.id === id);

  if (!toDeleteTodo) {
    return response.status(404).send({ error: "toDo does not exists" });
  }
  users[userIndex].todos.splice(toDeleteTodo, 1);

  return response.status(204).json(users);
});

module.exports = app;
