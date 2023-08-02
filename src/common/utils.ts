export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export function getUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
