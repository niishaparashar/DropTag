export interface RoomSettings {
  expiresAt: string | null // ISO timestamp or null for infinite
  pin: string | null
}

const PREFIX = 'droptag:room:'

export function getRoomSettings(tag: string): RoomSettings | null {
  try {
    const raw = localStorage.getItem(PREFIX + tag)
    if (!raw) return null
    return JSON.parse(raw) as RoomSettings
  } catch {
    return null
  }
}

export function setRoomSettings(tag: string, settings: RoomSettings) {
  localStorage.setItem(PREFIX + tag, JSON.stringify(settings))
}

export function clearRoomSettings(tag: string) {
  localStorage.removeItem(PREFIX + tag)
}

export function markRoomVerified(tag: string) {
  try {
    sessionStorage.setItem(PREFIX + 'verified:' + tag, '1')
  } catch {}
}

export function clearRoomVerified(tag: string) {
  try {
    sessionStorage.removeItem(PREFIX + 'verified:' + tag)
  } catch {}
}

export function isRoomVerified(tag: string) {
  try {
    return sessionStorage.getItem(PREFIX + 'verified:' + tag) === '1'
  } catch {
    return false
  }
}
