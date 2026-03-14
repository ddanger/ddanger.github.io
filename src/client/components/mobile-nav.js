import { setNavOpen } from '../services/store.js'

export function initMobileNav() {
  const navToggle = document.querySelector('.nav-toggle')
  const navLinks = document.querySelector('.nav-links')

  if (!navToggle || !navLinks) {
    return
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open')
    navToggle.setAttribute('aria-expanded', String(isOpen))
    setNavOpen(isOpen)
  })

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open')
      navToggle.setAttribute('aria-expanded', 'false')
      setNavOpen(false)
    })
  })
}
