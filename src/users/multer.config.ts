import * as fs from "fs";
import { extname } from "path";
import { diskStorage } from "multer";
import type { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export const MAX_USER_PICTURE_SIZE: number = 5 * 1024 * 1024;
const USER_PICTURE_UPLOAD_DIR = "./public/uploads/user";

export const userPictureUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(USER_PICTURE_UPLOAD_DIR, { recursive: true });
      cb(null, USER_PICTURE_UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
  limits: {
    fileSize: MAX_USER_PICTURE_SIZE,
  },
};
