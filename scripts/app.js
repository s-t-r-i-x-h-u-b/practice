import {renderAll} from "./render.js";
import {loadData, saveData, deleteData} from "./data.js";

document.addEventListener('DOMContentLoaded', () => {

let data = loadData();
renderAll(document, data);

const board_section = document.getElementById("board_section");  
const button_add_board = document.getElementById("add_board");
const button_del_all = document.getElementById('del_all');
const button_dropdown = document.getElementById('dropdown');
const dropdown = document.getElementsByClassName("dropdown")[0];


button_add_board.addEventListener('click', () => handleAddBoard(data));
button_del_all.addEventListener('click', () => {
    data = deleteData();
    board_section.innerHTML = '';
});
button_dropdown.addEventListener('click', () => handleDropdownClick(dropdown));
window.addEventListener('click', (event) => handleWindowClick(event, button_dropdown, dropdown));

window.addEventListener('click', (e) => {
    if (e.target.className === 'add_task') {
        handleAddTask(data, e.target.closest(".board").id);
    }
});


const mc = new Hammer.Manager(document, {
  recognizers: [
    [Hammer.Pan],
    [Hammer.Tap, { event: 'doubletap', taps: 2, interval: 300, posThreshold: 10 }]
  ]
});

mc.on('doubletap', (e) => handleDoubleTap(e, data));
mc.on('panstart', (e) => handlePanStart(e));
mc.on('panmove', (e) => handlePanMove(e));
mc.on('panend', (e) => handlePanEnd(e, document, data));
});


function handlePanStart(e) {
    if (!isValidTarget(e)) return;
    const target = getValidTarget(e);
    if (target.closest('.board')) target.parentElement.parentElement.style.overflow = 'visible'; // для board
    target.classList.add('drag');
}

function handlePanMove(e) {
    if (!isValidTarget(e)) return;
    const target = getValidTarget(e);
    target.style.transform = `translate(${e.deltaX}px, ${e.deltaY}px)`;
}


function handlePanEnd(e, document, data) {
    if (!isValidTarget(e)) return;
    const target = getValidTarget(e);

    target.style.visibility = 'hidden';
    const elementUnder = document.elementFromPoint(e.center.x, e.center.y);
    target.style.visibility = '';
    
    if (target.closest('.task')) {
        target.parentElement.parentElement.style.overflow = '';
        const boardUnder = elementUnder.closest(".board")
        if (boardUnder) {  
            const boardNew = findBoardByid(data, boardUnder.id);
            data.boards.find(board => {
                return board.tasks.find(task => {
                    if (task.id === target.id) {
                        const temp = {};
                        Object.assign(temp, task);
                        deleteElement(data, target);
                        boardNew.tasks.push(temp);
                        return
                    }
            })});
        }   
    }
    
    if (elementUnder.closest('#dropdown')) {
        deleteElement(data, target);
    };
    
    target.style.transform = '';
    target.classList.remove('drag');
    saveData(data); 
    renderAll(document, data);
}

function getValidTarget(e) {
    let target = e.target.closest('.task');
    if (!target) target = e.target.closest('.board');
    return target;
}

function isValidTarget(e) {
    return e.target.closest('.board');
}

function handleDoubleTap(e, data) {
    let target = e.target.closest('.task');
    if (target) {
        const temp = prompt('Введите текст задачи', '');
        if (temp) {
            data.boards.find(board => {
                return board.tasks.find(task => {
                    if (task.id === target.id) {
                        task.text = temp;
                        return
                    }
                });
            });
            saveData(data);
            renderAll(document, data);
        }
    } else {
        target = e.target.closest('.board');
        if (!target) return;
        const temp = prompt('Введите название доски', '');
        if (temp) {
            const board = findBoardByid(data, target.id);
            board.name = temp;
            saveData(data);
            renderAll(document, data);
        }
    }
}

function findBoardByid(data, boardId) {
    return data.boards.find(board => board.id === boardId);
}

function handleWindowClick(event, button_dropdown, dropdown) {
    if (event.target !== button_dropdown && !button_dropdown.contains(event.target)) {
        dropdown.classList.remove("show");
    }
}

function handleDropdownClick(dropdownElement) {
    dropdownElement.classList.toggle("show");
}

function deleteElement(data, target) {
    if (target.closest('.task')) {
        const board = data.boards.find(board => {
                return board.tasks.find(task => {
                    return task.id === target.id
                })});
        board.tasks = board.tasks.filter(task => task.id !== target.id);
    } else data.boards = data.boards.filter(board => board.id !== target.id);
}

function handleAddBoard(data) {
    const name = prompt('Введите название доски', '');
    if (!name) return;
    const board = {
    id: idGenerate(),
    name: name,
    tasks: [],
    }
    data.boards.push(board);
    saveData(data);
    renderAll(document, data);
}

function handleAddTask(data, id) {
    const text = prompt('Введите текст задачи', '');
    if (!text) return;
        const task = {
        id: idGenerate(),
        text: text,
    }
    const board = findBoardByid(data, id);
    board.tasks.push(task);
    saveData(data);
    renderAll(document, data);
};

function idGenerate() {
    return crypto.randomUUID();
}
