export type DocumentCategory = "preContractual" | "execution" | "closure"
export type DocumentStatus = "pending" | "approved" | "rejected"
export type FolderColor =
  | "blue"
  | "lightBlue"
  | "cyan"
  | "teal"
  | "green"
  | "lime"
  | "yellow"
  | "amber"
  | "orange"
  | "red"
  | "pink"
  | "fuchsia"
  | "purple"
  | "violet"
  | "indigo"
  | "gray"

export interface Folder {
  id: string
  name: string
  color: string
  description?: string
  createdAt?: string
  updatedAt?: string
  category: DocumentCategory
}

export interface Document {
  id: string
  name: string
  description?: string
  fileUrl?: string
  fileType?: string
  fileSize: number
  createdAt?: string
  updatedAt?: string
  folderId: string
}
