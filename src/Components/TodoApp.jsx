// src/TodoApp.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TodoApp.css";

const TodoApp = () => {
	const [todos, setTodos] = useState([]);
	const [input, setInput] = useState("");
	const [editingId, setEditingId] = useState(null);
	const [editInput, setEditInput] = useState("");
	const [notification, setNotification] = useState(null);

	useEffect(() => {
		axios
			.get("http://localhost:8080/api/todos")
			.then((res) => {
				setTodos(res.data);
			})
			.catch((error) => {
				console.error("Error fetching todos:", error);
			});
	}, []);

	const addTodo = (event) => {
		event.preventDefault();
		if (!input.trim()) {
			showNotification("You can't add an empty todo.");
			return;
		}

		axios
			.post("http://localhost:8080/api/todos", {
				title: input,
				completed: false,
			})
			.then((res) => {
				setTodos([...todos, res.data]);
				setInput("");
				showNotification("Todo added successfully.");
			})
			.catch((error) => {
				console.error("Error adding todo:", error);
			});
	};

	const toggleComplete = (id) => {
		const todo = todos.find((todo) => todo.id === id);
		axios
			.put(`http://localhost:8080/api/todos/${id}`, {
				...todo,
				completed: !todo.completed,
			})
			.then((res) => {
				setTodos(todos.map((t) => (t.id === id ? res.data : t)));
			})
			.catch((error) => {
				console.error("Error updating todo:", error);
			});
	};

	const deleteTodo = (id) => {
		axios
			.delete(`http://localhost:8080/api/todos/${id}`)
			.then(() => {
				setTodos(todos.filter((todo) => todo.id !== id));
				showNotification("Todo deleted successfully.");
			})
			.catch((error) => {
				console.error("Error deleting todo:", error);
			});
	};

	const startEditing = (id, title) => {
		setEditingId(id);
		setEditInput(title);
	};

	const saveEdit = (id) => {
		axios
			.put(`http://localhost:8080/api/todos/${id}`, {
				title: editInput,
				completed: todos.find((todo) => todo.id === id).completed,
			})
			.then((res) => {
				setTodos(todos.map((t) => (t.id === id ? res.data : t)));
				setEditingId(null);
				setEditInput("");
				showNotification("Todo updated successfully.");
			})
			.catch((error) => {
				console.error("Error updating todo:", error);
			});
	};

	const handleStatusChange = (id, status) => {
		const todo = todos.find((todo) => todo.id === id);
		axios
			.put(`http://localhost:8080/api/todos/${id}`, {
				...todo,
				completed: status === "completed",
			})
			.then((res) => {
				setTodos(todos.map((t) => (t.id === id ? res.data : t)));
			})
			.catch((error) => {
				console.error("Error updating todo:", error);
			});
	};

	const showNotification = (message) => {
		setNotification(message);
		setTimeout(() => setNotification(null), 3000);
	};

	return (
		<div className='todo-app'>
			<h1 className='title'>Todo List</h1>
			{notification && <div className='notification'>{notification}</div>}
			<form onSubmit={addTodo} className='todo-form'>
				<input
					type='text'
					value={input}
					onChange={(e) => setInput(e.target.value)}
					className='input'
					placeholder='Add a new todo...'
				/>
				<button type='submit' className='btn btn-add'>
					Add
				</button>
			</form>
			<ul className='todo-list'>
				{todos.map((todo) => (
					<li key={todo.id} className='todo-item'>
						{editingId === todo.id ? (
							<>
								<input
									type='text'
									value={editInput}
									onChange={(e) => setEditInput(e.target.value)}
									className='input-edit'
									placeholder='Edit todo'
								/>
								<button
									onClick={() => saveEdit(todo.id)}
									className='btn btn-save'
								>
									Save
								</button>
								<button
									onClick={() => setEditingId(null)}
									className='btn btn-cancel'
								>
									Cancel
								</button>
							</>
						) : (
							<>
								<span
									onClick={() => toggleComplete(todo.id)}
									className={`todo-text ${todo.completed ? "completed" : ""}`}
								>
									{todo.title}
								</span>
								<select
									className='dropdown'
									value={todo.completed ? "completed" : "pending"}
									onChange={(e) => handleStatusChange(todo.id, e.target.value)}
								>
									<option value='pending'>Pending</option>
									<option value='completed'>Completed</option>
								</select>
								<div className='todo-actions'>
									<button
										onClick={() => startEditing(todo.id, todo.title)}
										className='btn btn-edit'
									>
										Edit
									</button>
									<button
										onClick={() => deleteTodo(todo.id)}
										className='btn btn-delete'
									>
										Delete
									</button>
								</div>
							</>
						)}
					</li>
				))}
			</ul>
		</div>
	);
};

export default TodoApp;
