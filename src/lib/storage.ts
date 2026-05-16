class Storage {
  get<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }
    try {
      return JSON.parse(item) as T
    } catch {
      return defaultValue
    }
  }

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  }

  remove(key: string): void {
    localStorage.removeItem(key)
  }

  clear(): void {
    localStorage.clear()
  }
}

export const storage = new Storage()

