
import { useMutation } from '@tanstack/react-query'

import {
  uploadWorkOrderFiles,
} from '../api/work-order-attachments-api'

type UploadFilesPayload = {
  workOrderId: string
  files: File[]
}

export function useUploadWorkOrderFiles() {
  return useMutation({
    mutationFn: ({
      workOrderId,
      files,
    }: UploadFilesPayload) => {
      return uploadWorkOrderFiles(workOrderId, files)
    },
  })
}
