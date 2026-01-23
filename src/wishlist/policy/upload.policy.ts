import path from "node:path";
import type { RequestHandler } from "express";
import { BadRequestException } from "../../errors/error";

export const validateImageFile: RequestHandler = (req, res, next) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const rawFiles = (req.files ?? {}) as Record<string, Express.Multer.File[]>;
  const fileObjects = Object.values(rawFiles);
  if (fileObjects.length === 0) return next();
  const files = [
    ...(req.file ? [req.file] : []),
    ...Object.values(
      (req.files ?? {}) as Record<string, Express.Multer.File[]>,
    ).flat(),
  ];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const allowedMimetypes = ["image/jpeg", "image/png", "image/webp"];
  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      !allowedExtensions.includes(ext) ||
      !allowedMimetypes.includes(file.mimetype)
    )
      return next(
        new BadRequestException(
          "NOT_ALLOWED_FILE_EXTENSION",
          "허용되지 않은 파일 형식 입니다.",
        ),
      );
    if (file.size > MAX_FILE_SIZE)
      return next(
        new BadRequestException(
          "NOT_ALLOWED_FILE_SIZE",
          "5MB를 초과하는 파일은 업로드 할 수 없습니다.",
        ),
      );
  }
  next();
};
