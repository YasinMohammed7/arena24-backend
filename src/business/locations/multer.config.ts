import { diskStorage } from "multer";
import { extname, join } from "path";
import * as fs from "fs";
import type { Request } from "express";

export const MAX_LOCATION_COVER_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_LOCATION_GALLERY_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_LOCATION_GALLERY_FILES = 10;

const LOCATION_COVER_DIR = "./public/uploads/restaurants/covers";

export const locationCoverUploadOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(LOCATION_COVER_DIR, { recursive: true });
      cb(null, LOCATION_COVER_DIR);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
  limits: {
    fileSize: MAX_LOCATION_COVER_SIZE,
  },
};

export const locationGalleryUploadOptions = {
  storage: diskStorage({
    destination: (req: Request, _file, cb) => {
      const locationId = req.params.id;

      const uploadPath = join(
        process.cwd(),
        "public",
        "uploads",
        "restaurants",
        locationId,
        "gallery"
      );

      try {
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      } catch (error) {
        cb(error instanceof Error ? error : new Error(String(error)), "");
      }
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
  limits: {
    fileSize: MAX_LOCATION_GALLERY_IMAGE_SIZE,
    files: MAX_LOCATION_GALLERY_FILES,
  },
};
