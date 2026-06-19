import { diskStorage } from "multer";
import { extname } from "path";
import * as fs from "fs";

export const createMulterConfig = (modelType?: string, type?: string) => ({
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Try to get from req.body first, then fall back to passed parameters
      const body = req.body as { modelType?: string; type?: string };
      const bodyModelType = body?.modelType || modelType;
      const bodyType = body?.type || type;

      if (!bodyModelType || !bodyType) {
        return cb(new Error("modelType and type are required"), "");
      }

      const uploadPath = `./public/uploads/${bodyModelType}/${bodyType}`;
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
});

// Keep the original export for backward compatibility, but it may have issues
export const multerConfig = createMulterConfig();
