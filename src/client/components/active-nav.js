export function initActiveNav() {
  const currentPath = window.location.pathname
  const navLinks = document.querySelectorAll('.nav-links a')

  navLinks.forEach((link) => {
    const linkPath = new URL(link.href).pathname
    if (linkPath === currentPath || (linkPath !== '/' && currentPath.startsWith(linkPath))) {
      link.setAttribute('aria-current', 'page')
    }
  })
}
