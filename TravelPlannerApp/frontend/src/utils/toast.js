let listeners = [];
let idCounter = 0;

export const toast = {
    success: (message) => emit(message, 'success'),
    error: (message) => emit(message, 'error'),
    subscribe: (fn) => {
        listeners.push(fn);
        return () => { listeners = listeners.filter(l => l !== fn); };
    }
};

function emit(message, type) {
    const id = ++idCounter;
    listeners.forEach(l => l({ id, message, type }));
}