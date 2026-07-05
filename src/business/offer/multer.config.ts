import { diskStorage } from "multer";
import { extname } from "path";
import * as fs from "fs";

export const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5 MB
const COVER_DIR = "./public/uploads/offers/image";

export const coverUploadOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(COVER_DIR, { recursive: true });
      cb(null, COVER_DIR);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
  limits: { fileSize: MAX_COVER_SIZE },
};
