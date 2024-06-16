document.addEventListener('DOMContentLoaded', function() {
    const noteForm = document.getElementById('noteForm');
    const noteTitle = document.getElementById('noteTitle');
    const noteContent = document.getElementById('noteContent');
    const notesList = document.getElementById('notesList');

    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    const closeModalButtons = document.querySelectorAll('.modal .close');

    const editModal = document.getElementById('editModalNote');
    const editForm = document.getElementById('editForm');
    const editId = document.getElementById('editId');
    const editNoteTitle = document.getElementById('editNoteTitle');
    const editNoteContent = document.getElementById('editNoteContent');

    let currentDeleteTarget = null;
    let currentEditTarget = null;

    const openModal = (callback) => {
        deleteModal.style.display = 'block';
        currentDeleteTarget = callback;
    };

    const openEditNoteModal = (note) => {
        editModal.style.display = 'block';
        editId.value = note.id;
        editNoteTitle.value = note.title;
        editNoteContent.value = note.content;
        currentEditTarget = { isNote: true, element: document.querySelector(`[data-id="${note.id}"]`) };
    };

    const closeModal = () => {
        deleteModal.style.display = 'none';
        editModal.style.display = 'none';
        currentDeleteTarget = null;
        currentEditTarget = null;
    };

    const getRandomColor = () => {
        const colors = [ '#77d8ff', '#97CADB', '#D6EBEE','rgb(216, 240, 250)'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const createNoteCard = (note) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-id', note.id);
        card.style.backgroundColor = getRandomColor();
        card.innerHTML = `
            <div class="card-header">
                <span class="label">Note</span>
                <div class="actions">
                    <i class="fa-solid fa-pen-to-square edit-note"></i>
                    <i class="fa-solid fa-trash-can delete-note"></i>
                </div>
            </div>
            <div class="card-content">
                <h3>${note.title}</h3>
                <p>${note.content}</p>
            </div>
        `;
        notesList.appendChild(card);

        // Add delete event listener
        card.querySelector('.delete-note').addEventListener('click', function() {
            const noteId = card.getAttribute('data-id');
            openModal(() => deleteNote(noteId, card));
        });

        // Add edit event listener
        card.querySelector('.edit-note').addEventListener('click', function() {
            openEditNoteModal(note);
        });
    };

    const deleteNote = (id, cardElement) => {
        fetch(`http://localhost:3000/notes/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                cardElement.remove();
                closeModal();
            } else {
                alert('Failed to delete note.');
            }
        });
    };

    // Fetch Notes
    fetch('http://localhost:3000/notes')
        .then(response => response.json())
        .then(data => {
            data.forEach(note => createNoteCard(note));
        });

    // Add Note
    noteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const title = noteTitle.value;
        const content = noteContent.value;

        fetch('http://localhost:3000/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        })
        .then(response => response.json())
        .then(note => {
            createNoteCard(note);
            noteTitle.value = '';
            noteContent.value = '';
        });
    });

    // Edit Note
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = editId.value;
        const updateData = { title: editNoteTitle.value, content: editNoteContent.value };

        fetch(`http://localhost:3000/notes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        })
        .then(response => response.json())
        .then(updatedItem => {
            const element = currentEditTarget.element;
            element.querySelector('h3').innerText = updatedItem.title;
            element.querySelector('p').innerText = updatedItem.content;
            closeModal();
        });
    });

    // Close modals
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    confirmDeleteButton.addEventListener('click', function() {
        if (currentDeleteTarget) currentDeleteTarget();
    });
});
