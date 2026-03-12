;(() => {
  const navToggle = document.querySelector('.nav-toggle')
  const navLinks = document.querySelector('.nav-links')

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open')
      navToggle.setAttribute('aria-expanded', String(isOpen))
    })

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => navLinks.classList.remove('open'))
    })
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -30px 0px',
    }
  )

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

  const yearNode = document.querySelector('[data-year]')
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear())
  }
})()
