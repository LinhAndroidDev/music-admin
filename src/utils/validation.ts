import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Tên thể loại là bắt buộc').max(100),
})

export const singerSchema = z.object({
  name: z.string().min(1, 'Tên ca sĩ là bắt buộc').max(100),
  avatarUrl: z.string().url('Vui lòng upload ảnh đại diện'),
  description: z.string().max(500),
})

export const songSchema = z.object({
  title: z.string().min(1, 'Tên bài hát là bắt buộc').max(200),
  singerIds: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất một ca sĩ'),
  categoryId: z.string().min(1, 'Vui lòng chọn thể loại'),
  thumbnailUrl: z.string().url('Vui lòng upload ảnh bìa'),
  audioUrl: z.string().url('Vui lòng upload file mp3'),
  lyricUrl: z
    .string()
    .url('File lyric không hợp lệ')
    .or(z.literal(''))
    .optional(),
  duration: z.number().min(1, 'Không đọc được thời lượng bài hát'),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
export type SingerFormValues = z.infer<typeof singerSchema>
export type SongFormValues = z.infer<typeof songSchema>
