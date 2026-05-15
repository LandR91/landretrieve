import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { extname } from "path";
import { nanoid } from "nanoid";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".pdf"]);
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

@Injectable()
export class UploadsService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private config: ConfigService) {
    this.bucket = config.get<string>("R2_BUCKET", "landretrieve");
    this.publicUrl = config.get<string>("R2_PUBLIC_URL", "");

    this.s3 = new S3Client({
      region: "auto",
      endpoint: config.get<string>("R2_ENDPOINT", "https://placeholder.r2.cloudflarestorage.com"),
      credentials: {
        accessKeyId: config.get<string>("R2_ACCESS_KEY_ID", "placeholder"),
        secretAccessKey: config.get<string>("R2_SECRET_ACCESS_KEY", "placeholder"),
      },
    });
  }

  async uploadAttachment(file: Express.Multer.File): Promise<{ url: string; name: string; type: string; size: number }> {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException("Formato non supportato. Sono accettati: JPEG, JPG, PNG, WebP, PDF.");
    }

    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      throw new BadRequestException("Formato non supportato. Sono accettati: JPEG, JPG, PNG, WebP, PDF.");
    }

    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException("File troppo grande. Dimensione massima: 20 MB.");
    }

    const key = `attachments/${nanoid(16)}-${Date.now()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentDisposition: `inline; filename="${file.originalname}"`,
      }),
    );

    return {
      url: `${this.publicUrl}/${key}`,
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
    };
  }
}
