import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Upload, Settings, Lock, Clock, Trash2, Save, X } from 'lucide-react'
import BackButton from '../components/BackButton'
import FileGrid from '../components/FileGrid'
import SearchBar from '../components/SearchBar'
import { useFilesByTag } from '../hooks/useSearch'
import { useFileStore } from '../store/useFileStore'
import { normalizeTag } from '../utils/formatters'
import { clearRoomSettings, clearRoomVerified, getRoomSettings, isRoomVerified, markRoomVerified, RoomSettings, setRoomSettings } from '../utils/roomSettings'
import { deleteRoom } from '../utils/adminCleanup'

export default function TagPage() {
  const { tagName } = useParams()
  const navigate = useNavigate()
  const normalizedTag = normalizeTag(tagName ?? '')
  const { files, loading, error } = useFilesByTag(normalizedTag)
  const setFiles = useFileStore((state) => state.setFiles)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsPinValue, setSettingsPinValue] = useState('')
  const [unlockPinValue, setUnlockPinValue] = useState('')
  const [modalExpiry, setModalExpiry] = useState<string>('infinite')
  const [settingsState, setSettingsState] = useState<RoomSettings | null>(null)
  const [expired, setExpired] = useState(false)
  const [verified, setVerified] = useState(() => isRoomVerified(normalizedTag))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [deletingRoom, setDeletingRoom] = useState(false)

  useEffect(() => {
    setFiles(files)
  }, [files, setFiles])

  useEffect(() => {
    if (!normalizedTag) return
    const s = getRoomSettings(normalizedTag)
    const currentlyVerified = isRoomVerified(normalizedTag)
    setSettingsState(s)
    setVerified(currentlyVerified)
    setExpired(Boolean(s?.expiresAt && new Date(s.expiresAt).getTime() < Date.now()))
    setUnlockPinValue('')
    setErrorMessage(null)
  }, [normalizedTag])

  function openSettings() {
    setSettingsOpen(true)
    setErrorMessage(null)
    setSettingsError(null)
    setSettingsPinValue(settingsState?.pin ?? '')
    setModalExpiry(settingsState?.expiresAt ?? 'infinite')
  }

  function saveSettings({ expiresAt, pin }: { expiresAt: string | null; pin: string | null }) {
    if (!normalizedTag) return
    const next: RoomSettings = { expiresAt, pin }
    setRoomSettings(normalizedTag, next)
    setSettingsState(next)
    setSettingsOpen(false)

    // If PIN is removed or changed, force a fresh verification flow.
    if (!pin) {
      clearRoomVerified(normalizedTag)
      setVerified(true)
      setUnlockPinValue('')
      setErrorMessage(null)
      return
    }

    clearRoomVerified(normalizedTag)
    setVerified(false)
    setUnlockPinValue('')
    setErrorMessage(null)
  }

  async function handleDeleteRoom() {
    if (!normalizedTag || deletingRoom) return

    const confirmed = window.confirm(`Delete the entire #${normalizedTag} room? This removes its files and cannot be undone.`)
    if (!confirmed) return

    const adminToken = window.prompt('Enter the admin delete token to continue')?.trim()
    if (!adminToken) return

    setDeletingRoom(true)
    setSettingsError(null)

    try {
      await deleteRoom(normalizedTag, adminToken)
      clearRoomSettings(normalizedTag)
      setSettingsOpen(false)
      navigate('/')
    } catch (caught) {
      setSettingsError(caught instanceof Error ? caught.message : 'Failed to delete the room.')
    } finally {
      setDeletingRoom(false)
    }
  }

  function handleVerifyPin() {
    if (!settingsState?.pin) return
    if (unlockPinValue.trim() === settingsState.pin) {
      markRoomVerified(normalizedTag)
      setVerified(true)
      setUnlockPinValue('')
      setErrorMessage(null)
    } else {
      setErrorMessage('Incorrect PIN')
    }
  }

  return (
    <div className="space-y-8 py-6">
      <section className="grid gap-5 rounded-3xl border border-white/10 bg-panel/70 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
        <div>
          <div className="mb-5">
            <BackButton />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">Hashtag board</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">#{normalizedTag}</h1>
          <p className="mt-2 text-zinc-400">
            {loading ? 'Loading files...' : `${files.length} ${files.length === 1 ? 'file' : 'files'} found`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar compact />
          <button
            type="button"
            onClick={openSettings}
            title="Room settings"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-panel text-zinc-300 transition hover:bg-white/5"
          >
            <Settings aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </section>

      {settingsState?.expiresAt && expired ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">This room has expired and is read-only.</div>
      ) : null}

      {/* Settings modal */}
      {settingsOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Room settings</h3>
              <button onClick={() => setSettingsOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">Expiry</label>
                <select
                  value={modalExpiry}
                  onChange={(e) => setModalExpiry(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/10 px-3 py-2 text-white outline-none"
                >
                  <option value="3600000">1 hour</option>
                  <option value="21600000">6 hours</option>
                  <option value="86400000">24 hours</option>
                  <option value="604800000">7 days</option>
                  <option value="2592000000">30 days</option>
                  <option value="infinite">Never (infinite)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">PIN (optional)</label>
                <input
                  value={settingsPinValue}
                  onChange={(e) => setSettingsPinValue(e.target.value)}
                  placeholder="Set a numeric PIN or leave blank"
                  className="w-full rounded-md border border-white/10 bg-black/10 px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (!normalizedTag) return
                    clearRoomSettings(normalizedTag)
                    setSettingsState(null)
                    setSettingsOpen(false)
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear settings
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void handleDeleteRoom()
                    }}
                    disabled={deletingRoom}
                    className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingRoom ? 'Deleting...' : 'Delete room'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const expiresAt = modalExpiry === 'infinite' ? null : new Date(Date.now() + Number(modalExpiry)).toISOString()
                      const pin = settingsPinValue.trim() === '' ? null : settingsPinValue.trim()
                      saveSettings({ expiresAt, pin })
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-black"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                </div>
              </div>

              {settingsError ? <p className="text-sm text-red-300">{settingsError}</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* PIN gate */}
      {settingsState?.pin && !verified ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Enter room PIN</h3>
              <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white" title="Go back home">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-zinc-400">This room is PIN-protected. Enter the PIN to join.</p>
            <input
              value={unlockPinValue}
              onChange={(e) => setUnlockPinValue(e.target.value)}
              placeholder="Enter PIN"
              className="w-full rounded-md border border-white/10 bg-black/10 px-3 py-2 text-white outline-none"
            />
            {errorMessage ? <p className="mt-2 text-sm text-red-300">{errorMessage}</p> : null}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={handleVerifyPin} className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-black">
                <Lock aria-hidden className="h-4 w-4" />
                Unlock
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
      ) : null}

      {!error && loading ? <FileGrid files={[]} loading /> : null}

      {!error && !loading && files.length > 0 ? <FileGrid files={files} /> : null}

      {!error && !loading && files.length === 0 ? (
        <section className="flex min-h-[22rem] flex-col items-center justify-center rounded-3xl border border-white/10 bg-panel px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold text-white">No files found for #{normalizedTag}.</h2>
          <p className="mt-2 text-zinc-400">Be the first to drop one.</p>
          <Link
            to="/upload"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300"
          >
            <Upload aria-hidden className="h-4 w-4" />
            Upload
          </Link>
        </section>
      ) : null}
    </div>
  )
}
