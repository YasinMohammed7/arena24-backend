import { diskStorage } from "multer";
import { extname } from "path";
import * as fs from "fs";

export const MAX_ICON_SIZE = 2 * 1024 * 1024; // 2 MB
const ICON_DIR = "./public/uploads/amenities/icons";

// Shared config for the amenity icon upload (fixed destination, unique name).
export const iconUploadOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(ICON_DIR, { recursive: true });
      cb(null, ICON_DIR);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
  limits: { fileSize: MAX_ICON_SIZE },
};
