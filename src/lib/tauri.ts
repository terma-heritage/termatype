import { invoke } from '@/lib/safe-invoke'
import { open, save } from '@tauri-apps/plugin-dialog'

export interface DocumentContent {
  content: Record<string, unknown>
  path: string | null
}

const DOCX_FILTER = {
  name: 'Word Document',
  extensions: ['docx'],
}

const ALL_FILTERS = [
  DOCX_FILTER,
  { name: 'Text Files', extensions: ['txt'] },
  { name: 'Markdown', extensions: ['md'] },
  { name: 'All Files', extensions: ['*'] },
]

export async function newDocument(): Promise<Record<string, unknown>> {
  return invoke('new_document')
}

export async function openFileDialog(): Promise<DocumentContent | null> {
  const path = await open({
    multiple: false,
    filters: ALL_FILTERS,
  })

  if (!path) return null

  return invoke<DocumentContent>('read_file', { path })
}

export async function openFilePath(path: string): Promise<DocumentContent> {
  return invoke<DocumentContent>('read_file', { path })
}

export async function saveFile(
  path: string,
  content: Record<string, unknown>
): Promise<void> {
  return invoke('write_file', { path, content })
}

export async function saveFileAsDialog(
  content: Record<string, unknown>
): Promise<string | null> {
  const path = await save({
    filters: ALL_FILTERS,
    defaultPath: 'Untitled.docx',
  })

  if (!path) return null

  await invoke('write_file', { path, content })
  return path
}
