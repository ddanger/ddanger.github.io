const revealObserverOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -30px 0px',
}

export function initRevealAnimations() {
  const revealNodes = document.querySelectorAll('.reveal')

  if (!revealNodes.length) {
    return
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, revealObserverOptions)

  revealNodes.forEach((node) => observer.observe(node))
}
