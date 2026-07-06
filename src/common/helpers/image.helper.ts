export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
    return cb(
      new Error("Chỉ chấp nhận file ảnh (jpg, jpeg, png, webp)"),
      false,
    );
  }
  cb(null, true);
};

export const imageFileOptions = {
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
};
