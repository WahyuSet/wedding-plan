import { randomUUID } from "node:crypto";
import { mkdir, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import sharp from "sharp";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { ProfileRequest } from "../types/index.js";

export const uploadRoot = path.resolve(env.UPLOAD_DIR);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const MAX_FILES_PER_PROFILE = 30;
const MAX_BYTES_PER_PROFILE = 100 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1920;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AUDIO_BYTES, files: 1 },
});

export const singleFileUpload = (req: Request, res: Response, next: NextFunction): void => {
  upload.single("file")(req, res, (err: unknown) => {
    if (!err) return next();
    const tooLarge = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE";
    res.status(tooLarge ? 413 : 400).json({
      success: false,
      message: tooLarge ? "Ukuran file terlalu besar." : "Upload gagal. Kirim satu file pada field 'file'.",
    });
  });
};

type DetectedKind = "image" | "audio" | null;

// Jenis file ditentukan dari isi (magic bytes), bukan dari nama atau header klien.
export const detectKind = (buf: Buffer): DetectedKind => {
  if (buf.length < 12) return null;
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isPng = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp = buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
  if (isJpeg || isPng || isWebp) return "image";
  const isId3 = buf.subarray(0, 3).toString("ascii") === "ID3";
  const isMpegFrame = buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0;
  if (isId3 || isMpegFrame) return "audio";
  return null;
};

const publicBase = (req: Request): string =>
  (env.API_PUBLIC_URL ?? `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");

const toUrl = (req: Request, relPath: string): string => `${publicBase(req)}/uploads/${relPath}`;

export const uploadAsset = async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: "File tidak ditemukan pada permintaan." });
      return;
    }

    const kind = detectKind(file.buffer);
    if (!kind) {
      res.status(400).json({ success: false, message: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau MP3." });
      return;
    }
    if (kind === "image" && file.buffer.length > MAX_IMAGE_BYTES) {
      res.status(413).json({ success: false, message: "Ukuran foto maksimal 5 MB." });
      return;
    }

    let data: Buffer;
    let ext: string;
    if (kind === "image") {
      try {
        data = await sharp(file.buffer, { limitInputPixels: 50_000_000 })
          .rotate()
          .resize({ width: MAX_IMAGE_DIMENSION, height: MAX_IMAGE_DIMENSION, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
      } catch {
        res.status(400).json({ success: false, message: "Foto tidak dapat diproses. Pastikan file tidak rusak." });
        return;
      }
      ext = "webp";
    } else {
      data = file.buffer;
      ext = "mp3";
    }

    const usage = await prisma.invitationAsset.aggregate({
      where: { profileId },
      _count: true,
      _sum: { size: true },
    });
    if (usage._count >= MAX_FILES_PER_PROFILE || (usage._sum.size ?? 0) + data.length > MAX_BYTES_PER_PROFILE) {
      res.status(413).json({
        success: false,
        message: "Kuota unggahan penuh. Hapus file lama yang tidak dipakai terlebih dahulu.",
      });
      return;
    }

    const relPath = `${profileId}/${randomUUID()}.${ext}`;
    const absPath = path.join(uploadRoot, relPath);
    await mkdir(path.dirname(absPath), { recursive: true });
    await writeFile(absPath, data);

    const asset = await prisma.invitationAsset.create({
      data: { profileId, path: relPath, kind, size: data.length },
    });

    res.status(201).json({
      success: true,
      message: "File berhasil diunggah.",
      data: { id: asset.id, kind, size: asset.size, url: toUrl(req, relPath) },
    });
  } catch (error) {
    console.error("UploadAsset Error:", error);
    res.status(500).json({ success: false, message: "Gagal mengunggah file." });
  }
};

export const listAssets = async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const assets = await prisma.invitationAsset.findMany({ where: { profileId }, orderBy: { createdAt: "desc" } });
    const totalBytes = assets.reduce((sum, a) => sum + a.size, 0);
    res.json({
      success: true,
      data: {
        assets: assets.map((a) => ({
          id: a.id,
          kind: a.kind,
          size: a.size,
          createdAt: a.createdAt,
          url: toUrl(req, a.path),
        })),
        usage: { count: assets.length, bytes: totalBytes, maxCount: MAX_FILES_PER_PROFILE, maxBytes: MAX_BYTES_PER_PROFILE },
      },
    });
  } catch (error) {
    console.error("ListAssets Error:", error);
    res.status(500).json({ success: false, message: "Gagal memuat daftar file." });
  }
};

export const deleteAsset = async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const profileId = req.user!.profileId;
    const asset = await prisma.invitationAsset.findFirst({ where: { id: req.params.assetId, profileId } });
    if (!asset) {
      res.status(404).json({ success: false, message: "File tidak ditemukan." });
      return;
    }
    await prisma.invitationAsset.delete({ where: { id: asset.id } });
    await unlink(path.join(uploadRoot, asset.path)).catch(() => {});
    res.json({ success: true, message: "File berhasil dihapus." });
  } catch (error) {
    console.error("DeleteAsset Error:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus file." });
  }
};

export const removeProfileUploads = async (profileId: string): Promise<void> => {
  await rm(path.join(uploadRoot, profileId), { recursive: true, force: true }).catch(() => {});
};
