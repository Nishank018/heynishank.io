import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const allowedUser = process.env.AUTH_GITHUB_ALLOWED_USERNAME?.trim().toLowerCase();
    if (!session?.user || !allowedUser || session.user.name?.toLowerCase() !== allowedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No valid file uploaded" }, { status: 400 });
    }

    // Maximum file size: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds the 10MB limit" }, { status: 400 });
    }

    // Allowed file extensions and MIME types
    const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".pdf"]);
    const ALLOWED_MIME_TYPES = new Set([
      "image/png",
      "image/x-png",
      "image/jpeg",
      "image/pjpeg",
      "image/webp",
      "application/pdf",
      "application/octet-stream",
      "",
    ]);

    const originalExt = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(originalExt) || (file.type && !ALLOWED_MIME_TYPES.has(file.type))) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG, JPG, WEBP, and PDF files are allowed." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize base name
    const baseName = path
      .basename(file.name, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 30);

    const fileName = `${baseName || "file"}-${Date.now()}${originalExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/${fileName}`,
      success: true,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
