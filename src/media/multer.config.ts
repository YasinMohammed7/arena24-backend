import { diskStorage } from "multer";
import { extname } from "path";
import * as fs from "fs";

// Uploaded files are streamed to a temp directory with a unique name.
// Their final location (uploads/<modelType>/<type>/) is resolved by
// MediaService AFTER the request body (DTO) has been validated — so no
// request-body reading happens inside multer's storage callbacks.
export const TEMP_UPLOAD_DIR = "./public/uploads/temp";
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const multerOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
      cb(null, TEMP_UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE },
};
