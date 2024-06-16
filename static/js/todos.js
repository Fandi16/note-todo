document.addEventListener('DOMContentLoaded', function () {
    const todoForm = document.getElementById('todoForm');
    const todoTask = document.getElementById('todoTask');
    const todoDueDate = document.getElementById('todoDueDate');
    const todosList = document.getElementById('todosList');

    const editModal = document.getElementById('editModalTodo');
    const editTodoForm = document.getElementById('editTodoForm');
    const editTodoId = document.getElementById('editTodoId');
    const editTodoTask = document.getElementById('editTodoTask');
    const editTodoDueDate = document.getElementById('editTodoDueDate');
    const closeModalButtons = document.querySelectorAll('.modal .close');

    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteModalButton = document.getElementById('closeDeleteModal');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    const cancelDeleteButton = document.getElementById('cancelDelete');

    let currentDeleteTarget = null;
    let currentEditTarget = null;

    const showFormattedDate = (dateString) => {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const options = {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            };
            return date.toLocaleDateString("id-ID", options);
        } else {
            return "Invalid Date";
        }
    };

    const openEditTodoModal = (todo) => {
        editModal.style.display = 'block';
        editTodoId.value = todo.id;
        editTodoTask.value = todo.task;
        editTodoDueDate.value = todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : '';
        currentEditTarget = { element: document.querySelector(`[data-id="${todo.id}"]`) };
    };

    const closeModal = () => {
        editModal.style.display = 'none';
        deleteModal.style.display = 'none';
        currentDeleteTarget = null;
        currentEditTarget = null;
    };

    const getRandomColor = () => {
        const colors = ['#77d8ff', '#97CADB', '#D6EBEE', 'rgb(216, 240, 250)'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const checkUpcomingDeadline = (todo) => {
        const dueDate = new Date(todo.dueDate);
        const now = new Date();
        const timeDiff = dueDate - now;
        const minutesDiff = timeDiff / (1000 * 60);

        if (minutesDiff > 0 && minutesDiff <= 5) {
            showNotification(`The task "${todo.task}" is due in less than 5 minutes!`);
        }
    };

    const createTodoCard = (todo) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-id', todo.id);
        card.style.backgroundColor = getRandomColor();
        card.innerHTML = `
            <div class="card-header">
                <span class="label">Todo</span>
                <div class="actions">
                    <i class="fa-solid fa-pen-to-square edit-todo"></i>
                    <i class="fa-solid fa-trash-can delete-todo"></i>
                </div>
            </div>
            <div class="card-content">
                <h3>${todo.task}</h3>
                <p>Due: ${todo.dueDate ? showFormattedDate(todo.dueDate) : 'No due date'}</p>
            </div>
        `;
        todosList.appendChild(card);

        // Add delete event listener
        const deleteButton = card.querySelector('.delete-todo');
        if (deleteButton) {
            deleteButton.addEventListener('click', function () {
                const todoId = card.getAttribute('data-id');
                currentDeleteTarget = { id: todoId, element: card };
                deleteModal.style.display = 'block';
            });
        }

        // Add edit event listener
        const editButton = card.querySelector('.edit-todo');
        if (editButton) {
            editButton.addEventListener('click', function () {
                openEditTodoModal(todo);
            });
        }

        // Check for upcoming deadline
        checkUpcomingDeadline(todo);
    };

    const deleteTodo = () => {
        if (currentDeleteTarget) {
            const { id, element } = currentDeleteTarget;
            fetch(`http://localhost:3000/todos/${id}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        element.remove();
                        closeModal();
                    } else {
                        response.json().then(data => {
                            alert(`Failed to delete todo: ${data.message}`);
                        });
                    }
                })
                .catch(error => {
                    alert(`An error occurred: ${error.message}`);
                });
        }
    };

    // Fetch Todos
    fetch('http://localhost:3000/todos')
        .then(response => response.json())
        .then(data => {
            data.forEach(todo => createTodoCard(todo));
        });

    // Add Todo
    todoForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const task = todoTask.value;
        const dueDate = todoDueDate.value;

        fetch('http://localhost:3000/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ task, dueDate })
        })
            .then(response => response.json())
            .then(todo => {
                createTodoCard(todo);
                todoTask.value = '';
                todoDueDate.value = '';
            });
    });

    // Edit Todo
    editTodoForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const id = editTodoId.value;
        const updateData = { task: editTodoTask.value, dueDate: editTodoDueDate.value };

        fetch(`http://localhost:3000/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        })
            .then(response => response.json())
            .then(updatedItem => {
                const element = currentEditTarget.element;
                element.querySelector('h3').innerText = updatedItem.task;
                element.querySelector('p').innerText = updatedItem.dueDate ? showFormattedDate(updatedItem.dueDate) : 'No due date';
                closeModal();
            });
    });

    // Close modals
    closeModalButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', closeModal);
        }
    });

    // Delete modal actions
    if (closeDeleteModalButton) {
        closeDeleteModalButton.addEventListener('click', closeModal);
    }
    if (cancelDeleteButton) {
        cancelDeleteButton.addEventListener('click', closeModal);
    }
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', deleteTodo);
    }

    // Check for upcoming deadline every minute
    setInterval(() => {
        fetch('http://localhost:3000/todos')
            .then(response => response.json())
            .then(data => {
                data.forEach(todo => checkUpcomingDeadline(todo));
            });
    }, 60000);

    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerText = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    };
});
