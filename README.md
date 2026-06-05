# Music Admin

Website quản trị dữ liệu nhạc cho ứng dụng Android nghe nhạc — quản lý **bài hát**, **ca sĩ** và **thể loại**. Dữ liệu lưu trên **Firebase Firestore**, file media (ảnh, MP3, lyric) lưu trên **Cloudinary**.

## Mục lục

- [Tính năng](#tính-năng)
- [Công nghệ](#công-nghệ)
- [Yêu cầu](#yêu-cầu)
- [Cài đặt](#cài-đặt)
- [Cấu hình Firebase](#cấu-hình-firebase)
- [Cấu hình Cloudinary](#cấu-hình-cloudinary)
- [Scripts](#scripts)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Mô hình dữ liệu](#mô-hình-dữ-liệu)
- [Kiến trúc](#kiến-trúc)
- [Lưu ý bảo mật](#lưu-ý-bảo-mật)

## Tính năng

- **Dashboard** — thống kê số lượng bài hát / ca sĩ / thể loại và bảng Top bài hát theo lượt xem.
- **Quản lý bài hát** — thêm / sửa / xóa, tìm kiếm theo tên, phân trang bằng cursor.
  - Mỗi bài hát có thể gán **nhiều ca sĩ** (multi-select).
  - **Lyric không bắt buộc** — bài hát chưa có lyric vẫn lưu được.
- **Quản lý ca sĩ** — thêm / sửa / xóa kèm ảnh đại diện và mô tả. Không cho xóa ca sĩ đang được dùng trong bài hát.
- **Quản lý thể loại** — thêm / sửa / xóa.
- **Upload media linh hoạt** — mỗi trường file (ảnh bìa, MP3, lyric, avatar) hỗ trợ 2 chế độ:
  - **Tải lên** file từ thiết bị (đẩy thẳng lên Cloudinary).
  - **Nhập URL** có sẵn. Với file MP3, hệ thống tự đọc thời lượng từ URL/file.

## Công nghệ

- **Frontend:** React 19, Vite, TypeScript
- **UI:** Material UI (MUI) v9 + Emotion
- **Data fetching / cache:** TanStack React Query v5
- **Routing:** React Router v7
- **Form & validation:** React Hook Form + Zod
- **HTTP:** Axios (upload Cloudinary)
- **Database:** Firebase Firestore
- **Media storage:** Cloudinary (unsigned upload preset)

## Yêu cầu

- Node.js 18+ (khuyến nghị 20+)
- Tài khoản Firebase (đã bật Firestore)
- Tài khoản Cloudinary (có unsigned upload preset)

## Cài đặt

```bash
npm install
cp .env.example .env
# Điền Firebase và Cloudinary credentials vào .env
npm run dev
```

Dev server mặc định chạy tại `http://localhost:5173`.

### Biến môi trường (`.env`)

| Biến | Bắt buộc | Mô tả |
|------|:--------:|-------|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project id |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender id |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app id |
| `VITE_FIREBASE_MEASUREMENT_ID` | ⬜ | Chỉ cần nếu bật Analytics |
| `VITE_CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | ✅ | Unsigned upload preset |

> App sẽ báo lỗi rõ ràng ngay khi khởi động nếu thiếu biến Firebase bắt buộc (xem `src/config/firebase.ts`).

## Cấu hình Firebase

1. Mở [Firebase Console](https://console.firebase.google.com/) và chọn project của bạn.
2. **Build → Firestore Database → Create database** (chọn region gần bạn).
3. **Firestore → Rules** — paste nội dung `firestore.rules`, hoặc deploy bằng CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use <your_project_id>
firebase deploy --only firestore:rules
```

4. Tạo **composite index** khi console/app báo lỗi `failed-precondition`. Các index thường cần:
   - `songs`: `title` (ASC) — phục vụ tìm kiếm theo tên
   - `songs`: `views` (DESC) — phục vụ Top bài hát
   - `songs`: `createdAt` (DESC) — phục vụ phân trang mặc định

## Cấu hình Cloudinary

1. Vào **Settings → Upload → Upload presets** và tạo một **unsigned upload preset**.
2. Điền `VITE_CLOUDINARY_CLOUD_NAME` và `VITE_CLOUDINARY_UPLOAD_PRESET` vào `.env`.

> File MP3 được upload với `resourceType="video"` (chuẩn Cloudinary cho audio), lyric `.lrc` dùng `resourceType="raw"`, ảnh dùng `resourceType="image"`.

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy dev server (Vite) |
| `npm run build` | Type-check (`tsc -b`) + build production |
| `npm run preview` | Preview bản build production |
| `npm run lint` | Chạy ESLint |

## Cấu trúc thư mục

```
src/
├── app/                # Khởi tạo app: App, providers (React Query), router, theme
├── config/             # Khởi tạo Firebase & Firestore
├── types/              # TypeScript interfaces (song, singer, category)
├── services/           # Tầng truy cập dữ liệu: Firestore CRUD & Cloudinary upload
├── hooks/              # React Query hooks (useSongs, useSingers, useCategories, useDashboard)
├── components/
│   ├── common/         # Component dùng chung (DataTable, FormDialog, CloudinaryUpload, ...)
│   ├── forms/          # Form bài hát / ca sĩ / thể loại
│   └── layout/         # AppLayout, Header, Sidebar
├── pages/              # Trang theo route (Dashboard, Songs, Singers, Categories)
└── utils/              # Tiện ích format & schema validation (Zod)
```

### Routes

| Đường dẫn | Trang |
|-----------|-------|
| `/` | Dashboard |
| `/songs` | Quản lý bài hát |
| `/singers` | Quản lý ca sĩ |
| `/categories` | Quản lý thể loại |
| `*` | Redirect về `/` |

## Mô hình dữ liệu

### Collection `songs`

| Trường | Kiểu | Ghi chú |
|--------|------|---------|
| `title` | `string` | Tên bài hát |
| `singerIds` | `string[]` | Danh sách id ca sĩ (nguồn dữ liệu chính) |
| `singerNames` | `string[]` | Danh sách tên ca sĩ (denormalized) |
| `singerId` | `string` | Ca sĩ đầu tiên — **giữ lại để tương thích ngược** |
| `singerName` | `string` | Tên ca sĩ đầu tiên — **giữ lại để tương thích ngược** |
| `categoryId` | `string` | Id thể loại |
| `categoryName` | `string` | Tên thể loại (denormalized) |
| `thumbnailUrl` | `string` | Ảnh bìa |
| `audioUrl` | `string` | File MP3 |
| `lyricUrl` | `string` | File lyric — **có thể rỗng** |
| `duration` | `number` | Thời lượng (giây) |
| `views` | `number` | Lượt xem, mặc định `0` |
| `createdAt` | `Timestamp` | Server timestamp |

> **Tương thích ngược:** bài hát cũ chỉ có `singerId`/`singerName` vẫn hiển thị bình thường — tầng service tự suy ra `singerIds`/`singerNames` từ trường cũ khi đọc. Bài hát mới lưu cả hai dạng.

### Collection `singers`

| Trường | Kiểu |
|--------|------|
| `name` | `string` |
| `avatarUrl` | `string` |
| `description` | `string` |

### Collection `categories`

| Trường | Kiểu |
|--------|------|
| `name` | `string` |

## Kiến trúc

Luồng dữ liệu theo các tầng rõ ràng:

```
Pages  →  Hooks (React Query)  →  Services  →  Firestore / Cloudinary
```

- **Services** (`src/services`) bọc toàn bộ truy cập Firestore và Cloudinary, đồng thời map document thô về interface type.
- **Hooks** (`src/hooks`) bọc service bằng React Query (`useQuery` / `useMutation`) và lo việc cache invalidation.
- **Pages** chỉ ghép UI và gọi hooks; **Forms** validate bằng Zod thông qua React Hook Form.
- Danh sách dùng **phân trang cursor** (`startAfter` + `limit`) thay vì offset để tối ưu Firestore.

## Lưu ý bảo mật

- App **không có đăng nhập** — chỉ dùng nội bộ / môi trường dev.
- `firestore.rules` hiện cho phép `read, write: if true` (mở hoàn toàn). **Tuyệt đối không deploy production** với rules này — hãy thay bằng rules có xác thực trước khi public.
- Credentials nằm trong `.env` và **không được commit** lên git (`.env.example` chỉ là mẫu).
