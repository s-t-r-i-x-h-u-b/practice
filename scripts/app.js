import {renderAll, updateTaskText, updateBoardName, addTask} from "./render.js";
import {loadData, saveData, deleteData} from "./data.js";

// необходимы для корректной работы panmove
let target = null; 
let isDragging = false;

document.addEventListener('DOMContentLoaded', () => {

let data = loadData();
renderAll(document, data);

const board_section = document.getElementById("board_section");  
const button_add_board = document.getElementById("add_board");
const button_del_all = document.getElementById('del_all');
const button_dropdown = document.getElementById('dropdown');
const dropdown = document.querySelector(".dropdown");
const searchInput = document.getElementById("searchInput");
const theme = document.getElementById("theme");

theme.addEventListener('click', handleTheme);
button_add_board.addEventListener('click', () => handleAddBoard(data));
button_dropdown.addEventListener('click', () => handleDropdownClick(dropdown));
window.addEventListener('click', (event) => handleWindowClick(event, button_dropdown, dropdown));

window.addEventListener('click', (e) => {
    if (e.target.className === 'add_task') {
        handleAddTask(data, e.target.closest(".board"));
    }
});

button_del_all.addEventListener('click', () => {
    data = deleteData();
    board_section.innerHTML = '';
});

searchInput.addEventListener('input', (e) => {
  const search = e.target.value.trim().toLowerCase();
  filterTasks(search, data);
});

if (localStorage.getItem('theme')) setTheme();

const mc = new Hammer.Manager(document, {
  recognizers: [
    [Hammer.Pan, { threshold: 5, pointers: 1}],
    [Hammer.Tap, { event: 'doubletap', taps: 2, interval: 300, posThreshold: 10 }]
  ]
});

mc.on('doubletap', (e) => handleDoubleTap(e, data));
mc.on('panstart', (e) => handlePanStart(e));
mc.on('panmove', (e) => handlePanMove(e));
mc.on('panend', (e) => handlePanEnd(e, document, data));

document.addEventListener('touchmove', (e) => {
  if (isDragging) e.preventDefault();
}, { passive: false });
});


function toggleUnselectable(enable) {
    document.body.classList.toggle("unselectable", enable);
}

function setTheme() {
    document.body.classList.toggle('dark-mode');
}

function handleTheme() {
    if (!localStorage.getItem('theme')) localStorage.setItem('theme', 1);
    else localStorage.removeItem('theme');
    setTheme();
}

function filterTasks(search, data) {
  const boards = document.querySelectorAll(".board");
  
  boards.forEach(board => {
    const tasks = board.querySelectorAll(".task");
    let hasVisibleTasks = false;

    tasks.forEach(task => {
      const taskText = task.querySelector(".task_text").textContent.toLowerCase();
      const isMatch = taskText.includes(search);
      
      task.style.display = isMatch ? "block" : "none";
      if (isMatch) hasVisibleTasks = true;
    });

    // Скрываем пустые доски
    board.style.display = hasVisibleTasks || !search ? "block" : "none";
  });
}

function handlePanStart(e) {
    if (!isValidTarget(e)) return;
    isDragging = true;
    target = getValidTarget(e);
    if (target.closest('.board')) target.parentElement.parentElement.style.overflow = 'visible'; // для board
    target.classList.add('drag');
    toggleUnselectable(true);
    target.style.position = 'absolute';
    target.style.left = `${e.center.x}px`;
    target.style.top = `${e.center.y}px`;
}

function handlePanMove(e) {
    if (!target) return;
    target.style.transform = `translate(${e.deltaX}px, ${e.deltaY+window.scrollY}px)`;
    autoScrollDuringDrag(e, target);
}

function autoScrollDuringDrag(e, target) {
    if (!target || !isDragging) return;
    
    const scrollThreshold = 20; // расстояние от края, при котором начинается прокрутка
    const scrollSpeed = 10; // скорость прокрутки
    
    const rect = target.getBoundingClientRect();
    const elementX = rect.left;
    const elementY = rect.top;
    
    // Проверяем близость к краям окна
    if (elementX < scrollThreshold) {
        // Прокрутка влево
        window.scrollBy(-scrollSpeed, 0);
    } else if (elementX > window.innerWidth - scrollThreshold) {
        // Прокрутка вправо
        window.scrollBy(scrollSpeed, 0);
    }
    
    if (elementY < scrollThreshold) {
        // Прокрутка вверх
        window.scrollBy(0, -scrollSpeed);
    } else if (elementY > window.innerHeight - scrollThreshold) {
        // Прокрутка вниз
        window.scrollBy(0, scrollSpeed);
    }
}


function handlePanEnd(e, document, data) {
    if (!target) return;
    toggleUnselectable(false);
    isDragging = false;
    target.style.visibility = 'hidden';
    const elementUnder = document.elementFromPoint(e.center.x, e.center.y);
    target.style.visibility = '';
    if (elementUnder) {
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
    }
    target.style.position = '';
    target.style.left = '';
    target.style.top = '';
    target.style.transform = '';
    target.classList.remove('drag');
    target = null;
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
            updateTaskText(target, temp);
        }
    } else {
        target = e.target.closest('.board');
        if (!target) return;
        const temp = prompt('Введите название доски', '');
        if (temp) {
            const board = findBoardByid(data, target.id);
            board.name = temp;
            saveData(data);
            updateBoardName(target, temp);
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

function handleAddTask(data, target) {
    const text = prompt('Введите текст задачи', '');
    if (!text) return;
        const task = {
        id: idGenerate(),
        text: text,
    }
    const board = findBoardByid(data, target.id);
    if (!board) return;
    board.tasks.push(task);
    saveData(data);
    addTask(target, task);
};

function idGenerate() {
    return crypto.randomUUID();
}