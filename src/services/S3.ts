import AWS from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3_BUCKET_NAME } from "../config/constants";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Configure Multer with S3
export const upload = multer({
  // storage: s3Storage()
  storage: multerS3({
    // @ts-expect-error: Type error in multer-s3 storage, will fix this later
    s3: s3,
    bucket: S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `videos/${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["video/mp4", "video/x-matroska", "video/webm"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only video files are allowed."));
    }
  },
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
}).single("file");
