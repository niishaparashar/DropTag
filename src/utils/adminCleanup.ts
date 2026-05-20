export async function deleteRoom(tag: string, adminToken: string): Promise<void> {
  const response = await fetch('/api/admin/delete-room', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-admin-token': adminToken,
    },
    body: JSON.stringify({ tag }),
  })

  const payload = (await response.json().catch(() => null)) as { error?: string } | null

  if (!response.ok) {
    throw new Error(payload?.error ?? 'Failed to delete the room.')
  }
}