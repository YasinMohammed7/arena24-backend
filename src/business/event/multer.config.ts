import { diskStorage } from "multer";
import { extname } from "path";
import * as fs from "fs";
import type { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export const MAX_EVENT_COVER_SIZE: number = 5 * 1024 * 1024;

const EVENT_COVER_DIR = "./public/uploads/events/cover";

export const eventCoverUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(EVENT_COVER_DIR, { recursive: true });
      cb(null, EVENT_COVER_DIR);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
  limits: {
    fileSize: MAX_EVENT_COVER_SIZE,
  },
};
