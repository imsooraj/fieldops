
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import { useUploadWorkOrderFiles } from '../hooks/useUploadWorkOrderFiles'

type PreviewFile = {
  id: string
  file: File
  previewUrl: string
}

type WorkOrderFileUploadProps = {
  workOrderId: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

function WorkOrderFileUpload({
  workOrderId,
}: WorkOrderFileUploadProps) {
  const [files, setFiles] = useState<PreviewFile[]>([])
  const [validationError, setValidationError] = useState('')

  const previewUrls = useRef(new Set<string>())

  const uploadMutation = useUploadWorkOrderFiles()

  useEffect(() => {
    return () => {
      previewUrls.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })

      previewUrls.current.clear()
    }
  }, [])

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      setValidationError('')

      const selectedFiles = Array.from(
        event.target.files ?? [],
      )

      const validFiles: File[] = []

      for (const file of selectedFiles) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          setValidationError(
            `${file.name}: Only JPEG, PNG and WebP images are allowed.`,
          )
          continue
        }

        if (file.size > MAX_FILE_SIZE) {
          setValidationError(
            `${file.name}: File size must not exceed 10 MB.`,
          )
          continue
        }

        validFiles.push(file)
      }

      const newFiles: PreviewFile[] = validFiles.map((file) => {
        const previewUrl = URL.createObjectURL(file)

        previewUrls.current.add(previewUrl)

        return {
          id: crypto.randomUUID(),
          file,
          previewUrl,
        }
      })

      setFiles((previousFiles) => [
        ...previousFiles,
        ...newFiles,
      ])

      // Allows the user to select the same file again.
      event.target.value = ''
    } catch (error) {
      console.error('File selection failed:', error)
      setValidationError('Unable to select files.')
    }
  }

  const removeFile = (id: string) => {
    try {
      const fileToRemove = files.find(
        (item) => item.id === id,
      )

      if (!fileToRemove) return

      URL.revokeObjectURL(fileToRemove.previewUrl)

      previewUrls.current.delete(fileToRemove.previewUrl)

      setFiles((previousFiles) =>
        previousFiles.filter((item) => item.id !== id),
      )
    } catch (error) {
      console.error('File removal failed:', error)
    }
  }

  const handleUpload = async () => {
    try {
      if (files.length === 0) return

      setValidationError('')

      await uploadMutation.mutateAsync({
        workOrderId,
        files: files.map((item) => item.file),
      })

      files.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl)
        previewUrls.current.delete(item.previewUrl)
      })

      setFiles([])
    } catch (error) {
      console.error('Evidence upload failed:', error)
    }
  }

  const formatFileSize = (size: number) => {
    try {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`
    } catch (error) {
      console.error('Unable to format file size:', error)
      return 'Unknown size'
    }
  }

  return (
    <section>
      <h3>Upload Work Order Evidence</h3>

      <p>
        Upload photos showing the condition of the equipment
        or completed maintenance work.
      </p>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        disabled={uploadMutation.isPending}
      />

      {validationError && (
        <p role="alert">
          {validationError}
        </p>
      )}

      {files.length > 0 && (
        <div>
          <h4>Selected Files ({files.length})</h4>

          <div>
            {files.map((item) => (
              <div key={item.id}>
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  width={150}
                  height={120}
                  style={{ objectFit: 'cover' }}
                />

                <p>{item.file.name}</p>

                <small>
                  {formatFileSize(item.file.size)}
                </small>

                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  disabled={uploadMutation.isPending}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadMutation.isError && (
        <p role="alert">
          Upload failed. Please try again.
        </p>
      )}

      {uploadMutation.isSuccess && (
        <p role="status">
          Evidence uploaded successfully!
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={
          files.length === 0 ||
          uploadMutation.isPending
        }
      >
        {uploadMutation.isPending
          ? 'Uploading...'
          : 'Upload Evidence'}
      </button>
    </section>
  )
}

export default WorkOrderFileUpload
