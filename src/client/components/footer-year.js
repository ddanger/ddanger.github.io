export function initFooterYear() {
  const yearNode = document.querySelector('[data-year]')

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear())
  }
}
