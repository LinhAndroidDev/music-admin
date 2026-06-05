import axios from 'axios'

export type CloudinaryResourceType = 'image' | 'raw' | 'video' | 'auto'

export interface CloudinaryUploadResult {
  url: string
  duration?: number
}

export async function uploadToCloudinary(
  file: File,
  resourceType: CloudinaryResourceType = 'auto',
): Promise<CloudinaryUploadResult> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Thiếu cấu hình Cloudinary. Kiểm tra file .env')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
  const { data } = await axios.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return {
    url: data.secure_url as string,
    duration: typeof data.duration === 'number' ? data.duration : undefined,
  }
}

export async function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url)
    audio.addEventListener('loadedmetadata', () => {
      resolve(Math.round(audio.duration))
    })
    audio.addEventListener('error', () => {
      reject(new Error('Không đọc được thời lượng audio'))
    })
  })
}
