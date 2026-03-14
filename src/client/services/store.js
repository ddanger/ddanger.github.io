const initialUiState = {
  navOpen: false,
}

const storeState = {
  ui: { ...initialUiState },
}

const eventMap = {
  ui: 'site:uichange',
}

export const Store = new Proxy(storeState, {
  set(target, prop, value) {
    target[prop] = value

    const eventName = eventMap[prop]
    if (eventName) {
      window.dispatchEvent(new CustomEvent(eventName, { detail: value }))
    }

    return true
  },
})

export function setNavOpen(isOpen) {
  Store.ui = {
    ...Store.ui,
    navOpen: Boolean(isOpen),
  }
}

export function resetUiState() {
  Store.ui = { ...initialUiState }
}
