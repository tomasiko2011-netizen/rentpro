import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Файл слишком большой (макс 5МБ)" }, { status: 400 });
  }

  // Only images
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Только изображения" }, { status: 400 });
  }

  try {
    const blob = await put(`rentpro/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Ошибка загрузки. Проверьте BLOB_READ_WRITE_TOKEN." }, { status: 500 });
  }
}
