import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

async function getUploadDir() {
  const localDir = path.join(process.cwd(), "uploads");
  const tmpDir = path.join("/tmp", "uploads");

  try {
    await fs.mkdir(localDir, { recursive: true });
    return localDir;
  } catch (err) {
    await fs.mkdir(tmpDir, { recursive: true });
    return tmpDir;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const spaceId = formData.get("spaceId") as string | null;

    if (!file || !spaceId) {
      return NextResponse.json({ error: "File and spaceId are required" }, { status: 400 });
    }

    // Verify membership in space
    const membership = await prisma.membership.findUnique({
      where: {
        spaceId_userId: {
          spaceId,
          userId: session.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "You are not a member of this space" }, { status: 403 });
    }

    const uploadDir = await getUploadDir();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".jpg";
    const storageKey = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, storageKey);

    await fs.writeFile(filePath, buffer);

    const isVideo = file.type.startsWith("video/");
    const type = isVideo ? "VIDEO" : "IMAGE";
    const mediaUrl = `/api/media/${storageKey}`;

    const media = await prisma.media.create({
      data: {
        spaceId,
        uploaderId: session.id,
        storageKey,
        type,
        mimeType: file.type || (isVideo ? "video/mp4" : "image/jpeg"),
        size: file.size,
        url: mediaUrl,
      },
    });

    return NextResponse.json({ media });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
