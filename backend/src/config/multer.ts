import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = process.env.UPLOAD_DIR || 'uploads'
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  file.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('Only PDF files allowed'))
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
})

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const imageFileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  IMAGE_MIME_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPEG, PNG, or WEBP images allowed'))
}

// For company logo / cover image uploads.
export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: Number(process.env.MAX_IMAGE_SIZE) || 3 * 1024 * 1024 },
})
