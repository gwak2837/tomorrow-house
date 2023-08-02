export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export function getUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function swap(json: Record<string, string>) {
  const result: Record<string, string[]> = {}

  for (const coords in json) {
    const _class = json[coords]
    if (!result[_class]) result[_class] = []
    result[_class].push(coords)
  }

  return result
}
