export function save(key: string, value: string) {
    localStorage.setItem(key, value)
}
export function load(key: string): string | null {
    return localStorage.getItem(key);
}
export function remove(key: string) {
    localStorage.removeItem(key);
}