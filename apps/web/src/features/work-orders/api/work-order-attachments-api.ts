
import { apiRequest } from '../../../lib/api-client'

export type WorkOrderAttachmentDTO = {
  id: string
  fileName: string
  mimeType: string
  size: number
  url?: string
  uploadedAt?: string
}

export type UploadAttachmentsResponse = {
  data: WorkOrderAttachmentDTO[]
}

export async function uploadWorkOrderFiles(
  workOrderId: string,
  files: File[],
): Promise<UploadAttachmentsResponse> {
  try {
    const formData = new FormData()

    files.forEach((file) => {
      formData.append('files', file)
    })

    return await apiRequest<UploadAttachmentsResponse>(
      `/api/v1/work-orders/${workOrderId}/attachments`,
      {
        method: 'POST',
        body: formData,
      },
    )
  } catch (error) {
    console.error('Work order attachment upload failed:', error)
    throw error
  }
}
