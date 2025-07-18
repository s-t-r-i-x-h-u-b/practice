export function renderTask(task) {
    return `<div class="task" id="${task.id}"><p class="task_text">${task.text}</p></div>`
}

export function renderBoard(board) {
    return`<div class="board" id="${board.id}">
    <p class="board_name">${board.name}</p>
    <button class="add_task">Добавить задачу</button>
    <div class="container">${board.tasks.map(renderTask).join('')}</div></div>`
}

export function renderAll(document, data) {
    document.getElementById("board_section").innerHTML = data.boards.map(renderBoard).join('');
}

export function updateTaskText(target, text) {
    target.querySelector(".task_text").textContent = text;
}

export function updateBoardName(target, text) {
    target.querySelector(".board_name").textContent = text;
}

export function addTask(target, task) {
    target.querySelector(".container").insertAdjacentHTML('beforeend', renderTask(task));
}