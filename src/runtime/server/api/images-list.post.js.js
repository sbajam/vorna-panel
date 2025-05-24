// src/runtime/server/api/images-list.post.js
import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import sharp from "sharp";
import { readMultipartFormData, createError, eventHandler } from "h3";
import { useRuntimeConfig } from "#imports";

export default eventHandler(async (event) => {
  // Check content type
  const contentType = event.node.req.headers["content-type"];
  if (!contentType || !contentType.includes("multipart/form-data")) {
    throw createError({
      statusCode: 400,
      message: "Content-Type باید multipart/form-data باشد",
    });
  }

  // 1. خواندن همه فیلدها و فایل‌ها
  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({
      statusCode: 400,
      message: "داده‌ای دریافت نشد",
    });
  }

  // Debug logging
  console.log("Received form data:", JSON.stringify(formData, null, 2));
  console.log("Number of parts:", formData?.length);

  // More detailed logging of each part
  formData?.forEach((part, index) => {
    console.log(`Part ${index}:`, {
      name: part.name,
      filename: part.filename,
      type: part.type,
      hasData: !!part.data,
    });
  });

  // Extract file and fields - updated check
  const file = formData?.find(
    (part) => part.name === "image" && part.data?.length > 0
  );
  const title =
    formData?.find((part) => part.name === "title")?.data?.toString() || "";

  if (!file || !file.data) {
    console.log(
      "File not found in request. Available parts:",
      formData?.map((p) => p.name)
    );
    throw createError({
      statusCode: 400,
      message: "فایل تصویر یافت نشد یا فرمت آن صحیح نیست",
    });
  }

  // Verify file is an image
  if (!file.type?.startsWith("image/")) {
    throw createError({
      statusCode: 400,
      message: "فایل باید از نوع تصویر باشد",
    });
  }

  // 3. آماده‌سازی مسیر آپلود
  const config = useRuntimeConfig();
  const rootDir = config.vornaPanel?.rootDir ?? process.cwd();
  const uploadDir = path.join(rootDir, "public", "uploads");
  console.log(uploadDir);
  await fs.mkdir(uploadDir, { recursive: true });

  // 4. تولید نام یکتا و تبدیل به webp
  const id = nanoid();
  const outName = `${id}.webp`;
  const outPath = path.join(uploadDir, outName);

  try {
    await sharp(file.data)
      .resize({ width: 1920 })
      .webp({ quality: 80 })
      .toFile(outPath);
  } catch (error) {
    console.error("Error processing image:", error);
    throw createError({
      statusCode: 500,
      message: "خطا در پردازش تصویر",
    });
  }

  // 5. ذخیره متادیتا در JSON
  const metaPath = path.join(uploadDir, "images.json");
  let list = [];
  try {
    list = JSON.parse(await fs.readFile(metaPath, "utf-8"));
  } catch {
    /* فایل ممکن است هنوز نباشد */
  }

  list.push({
    id,
    title,
    url: `/uploads/${outName}`,
    createdAt: Date.now(),
  });
  await fs.writeFile(metaPath, JSON.stringify(list, null, 2));

  // 6. برگرداندن پاسخ
  return { success: true, message: "تصویر با موفقیت بارگذاری شد" };
});
