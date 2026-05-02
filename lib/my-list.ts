const MY_LIST_KEY = "handyflix_my_list"

// Local storage functions (for guests)
export function getLocalList(): string[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(MY_LIST_KEY)
  return stored ? JSON.parse(stored) : []
}

function setLocalList(list: string[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(list))
  }
}

// Legacy functions (local storage only)
export function getMyList(): string[] {
  return getLocalList()
}

export function addToMyList(id: string | number): string[] {
  const stringId = String(id)
  const list = getLocalList()
  if (!list.includes(stringId)) {
    const updated = [...list, stringId]
    setLocalList(updated)
    return updated
  }
  return list
}

export function removeFromMyList(id: string | number): string[] {
  const stringId = String(id)
  const list = getLocalList()
  const updated = list.filter((itemId) => itemId !== stringId)
  setLocalList(updated)
  return updated
}

export function isInMyList(id: string | number): boolean {
  return getLocalList().includes(String(id))
}

export function toggleMyList(id: string | number): { isInList: boolean; list: string[] } {
  if (isInMyList(id)) {
    return { isInList: false, list: removeFromMyList(id) }
  }
  return { isInList: true, list: addToMyList(id) }
}

// API functions (for authenticated users)
export async function fetchServerList(): Promise<string[]> {
  try {
    const res = await fetch("/api/user/list")
    if (!res.ok) return []
    const { contentIds } = await res.json()
    return contentIds || []
  } catch {
    return []
  }
}

export async function toggleServerList(contentId: string): Promise<{ isInList: boolean; contentIds: string[] }> {
  try {
    const res = await fetch("/api/user/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId, action: "toggle" }),
    })
    if (!res.ok) throw new Error("Failed to toggle")
    return await res.json()
  } catch {
    return { isInList: false, contentIds: [] }
  }
}

export async function syncLocalToServer(): Promise<void> {
  const localList = getLocalList()
  if (localList.length === 0) return

  try {
    for (const contentId of localList) {
      await fetch("/api/user/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, action: "add" }),
      })
    }
    // Clear local storage after syncing
    localStorage.removeItem(MY_LIST_KEY)
  } catch {
    console.error("Failed to sync local list to server")
  }
}
