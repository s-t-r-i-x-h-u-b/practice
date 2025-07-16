document.addEventListener('DOMContentLoaded', () => {

const board_section = document.getElementById("board_section");    
const button_add_board = document.getElementById("add_board");
const button_add_task = document.getElementById("add_task");
const button_del_all = document.getElementById('del_all');
const button_dropdown = document.getElementById('dropdown');
const dropdown = document.getElementsByClassName("dropdown")[0];
const storage = document.getElementsByClassName("storage")[0];


button_add_board.addEventListener('click', handleAddBoard);
button_add_task.addEventListener('click', () => handleAddTask(storage));
button_del_all.addEventListener('click', handleDelAll);
button_dropdown.addEventListener('click', () => handleDropdownClick(dropdown));
window.addEventListener('click', (event) => handleWindowClick(event, button_dropdown, dropdown));


if (localStorage.getItem('data')) {
    board_section.innerHTML = localStorage.getItem('data');
}


const mc = new Hammer.Manager(document, {
  recognizers: [
    [Hammer.Pan],
    [Hammer.Tap, { event: 'doubletap', taps: 2, interval: 300, posThreshold: 10 }]
  ]
});

let target;

mc.on('doubletap', (e) => {
    target = e.target.closest('.task');
    if (target) {
        const temp = prompt('Введите текст задачи', '');
        if (temp) {
            target.querySelector('.task_text').textContent = temp;
        }
    } else {
        target = e.target.closest('.board');
        if (!target) return;
        const temp = prompt('Введите название доски', '');
        if (temp) {
            target.querySelector('.board_name').textContent = temp;
        }
    }
    target = undefined;
    saveDocumentChanges();
});

mc.on('panstart', (e) => {
    target = e.target.closest('.task');
    if (!target) target = e.target.closest('.board');
    if (!target) return;
    target.classList.add('drag');
    if (target.closest('.task')) target.parentElement.parentElement.style.overflow = 'visible'; // для board
});

mc.on('panmove', (e) => {
    if (!target) return;
    target.style.transform = `translate(${e.deltaX}px, ${e.deltaY}px)`;
});

mc.on('panend', (e) => {
    if (!target) return;
    target.style.visibility = 'hidden';
    const elementUnder = document.elementFromPoint(e.center.x, e.center.y);
    target.style.visibility = '';

    if (target.closest('.task')) {
        target.parentElement.parentElement.style.overflow = '';
        const board = elementUnder.closest(".board")
        if (board) { // Определяем позицию вставки
            const container = board.querySelector('.container');       
            const tasks = container.querySelectorAll('.task');
            const insertBefore = Array.prototype.find.call(tasks, task => {
                const rect = task.getBoundingClientRect();
                return rect.top > e.center.y;
            });

            if (insertBefore) container.insertBefore(target, insertBefore);
            else container.appendChild(target);
        }   
    }
    
    if (elementUnder.closest('#dropdown')) {
        deleteElement(target.id);
    };
    
    target.style.transform = '';
    target.classList.remove('drag');
    target = undefined;
    saveDocumentChanges();
});
});


function handleWindowClick(event, button_dropdown, dropdown) {
    if (event.target !== button_dropdown && !button_dropdown.contains(event.target)) {
        dropdown.classList.remove("show");
    }
}

function handleDropdownClick(dropdownElement) {
    dropdownElement.classList.toggle("show");
}

function deleteElement(id) {
    document.getElementById(id).remove();
}

function find(id) {
    return document.getElementById(id);
}

function saveDocumentChanges() {
    localStorage.setItem('data', board_section.innerHTML);
}

function handleAddBoard() {
    const board_name = prompt('Введите название доски', '');
    if (!board_name) return;
    board_section.insertAdjacentHTML("afterbegin", `<div class="board" id="${idGenerate()}"><p class="board_name">${board_name}</p><div class="container"></div></div>`);
    saveDocumentChanges();
};

function handleAddTask(storage) {
    const task_text = prompt('Введите текст задачи', '');
    if (!task_text) return;
    storage.insertAdjacentHTML('beforeend', `<div class="task" id="${idGenerate()}"><p class="task_text">${task_text}</p></div>`);
};

function handleDelAll() {
    board_section.innerHTML = '';
    localStorage.removeItem('data');
};

function idGenerate() {
    return crypto.randomUUID();
}