const data = {
    boards: [],
}

export function loadData() {
    const saveData = localStorage.getItem('data');
    if (saveData) {
        return JSON.parse(saveData);
    }
    return data;
}

export function saveData(data) {
    localStorage.setItem('data', JSON.stringify(data));
}

export function deleteData() {
    localStorage.removeItem('data');
    return data;
};
