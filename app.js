function deleteElement(id) {
    let del = document.getElementById(id);
    if (!del) { // Реагирует только на пустой ввод, а не ищет нужный элемент
        alert("Элемент не найден");
        return;
    } del.remove();
}


document.addEventListener('DOMContentLoaded', () => {

const board_section = document.getElementById("board_section");    
const button_add_board = document.getElementById("add_board");
const button_add_task = document.getElementById("add_task");
const button_del_board = document.getElementById("del_board");
const button_del_task = document.getElementById("del_task");
const button_del_all = document.getElementById('del_all');
const button_dropdown = document.getElementById('dropdown');
const dropdown = document.getElementsByClassName("dropdown")[0];


if (localStorage.getItem('data')) { // Загрузка досок и задач
    board_section.innerHTML = localStorage.getItem('data');
}


button_add_board.onclick = function() {
    let board_name = prompt('Введите название доски', '');
    board_section.insertAdjacentHTML("afterbegin", `<div class="board" id="${board_name}"><h2 class="board_name">Доска ${board_name}</h2></div>`);
    localStorage.setItem('data', board_section.innerHTML);
};


button_add_task.onclick = function() {
    let board_name = prompt('Введите название доски', '');
    let task_name = prompt('Введите название задачи', '');
    let board = document.getElementById(board_name);
    board.insertAdjacentHTML("beforeend",
        `<div class="task" id="${board_name + task_name}"><p>${task_name}</p></div>`);
        localStorage.setItem('data', board_section.innerHTML);
};


button_del_board.onclick = function() {
    let board_name = prompt('Введите название доски', '');
    deleteElement(board_name);
    localStorage.setItem('data', board_section.innerHTML);
};


button_del_task.onclick = function() {
    let board_name = prompt('Введите название доски', '');
    let task_name = prompt('Введите название задачи', '');
    deleteElement(board_name + task_name);
    localStorage.setItem('data', board_section.innerHTML);
};


button_del_all.onclick = function() {
    board_section.innerHTML = '';
    localStorage.removeItem('data');
};

button_dropdown.onclick = function() {
    dropdown.classList.toggle("show");
}

window.onclick = function(event) { // Скрыть кнопки
    if (event.target !== button_dropdown && !button_dropdown.contains(event.target)) {
        dropdown.classList.remove("show");
    }
}
});