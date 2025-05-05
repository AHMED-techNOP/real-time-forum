export function showError(message, id) {
    let err = document.getElementById(id)
    
    err.textContent = message
    err.style.display = "block"
    err.style.color = "red"
}