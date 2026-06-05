# Music Admin

Website quản trị dữ liệu nhạc cho ứng dụng Android — React + TypeScript + Material UI + Firebase Firestore + Cloudinary.

## Công nghệ

- **Frontend:** React 19, Vite, TypeScript, MUI, React Query, React Router, React Hook Form, Zod, Axios
- **Database:** Firebase Firestore
- **Storage:** Cloudinary (unsigned upload preset)

## Cài đặt

```bash
npm install
cp .env.example .env
# Điền Firebase và Cloudinary credentials vào .env
npm run dev
```

## Cấu hình Firebase

Project: **music-c223e** — credentials đã có trong `.env` (file này không commit lên git).

1. Mở [Firebase Console → music-c223e](https://console.firebase.google.com/project/music-c223e)
2. **Build → Firestore Database → Create database** (chọn region gần bạn)
3. **Firestore → Rules** — paste nội dung `firestore.rules`, hoặc deploy:

```bash
npm install -g firebase-tools
firebase login
firebase use music-c223e
firebase deploy --only firestore:rules
```

4. Tạo composite index khi app/console báo lỗi (thường: `songs` + `title`, `songs` + `views` DESC)

## Cấu hình Cloudinary

1. Tạo **unsigned upload preset** (Settings → Upload → Upload presets)
2. Điền `VITE_CLOUDINARY_CLOUD_NAME` và `VITE_CLOUDINARY_UPLOAD_PRESET` vào `.env`

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run preview` | Preview build |
| `npm run lint` | ESLint |

## Cấu trúc thư mục

```
src/
├── app/           # Theme, providers, router
├── config/        # Firebase init
├── types/         # TypeScript interfaces
├── services/      # Firestore & Cloudinary API
├── hooks/         # React Query hooks
├── components/    # UI components
├── pages/         # Route pages
└── utils/         # Format & validation
```

## Lưu ý bảo mật

- Không có đăng nhập — chỉ dùng nội bộ/dev
- `firestore.rules` hiện cho phép read/write toàn bộ — **không deploy production** với rules này
