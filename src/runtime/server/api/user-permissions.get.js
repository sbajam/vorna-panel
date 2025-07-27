import { defineEventHandler, getQuery } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { role } = getQuery(event);

  if (!role || typeof role !== "string") {
    return {
      status: false,
      message: "پارامتر role ارسال نشده یا نامعتبر است",
    };
  }

  try {
    const roleData = await prisma.role.findUnique({
      where: { name: role },
      include: {
        permissions: true,
      },
    });

    if (!roleData || !roleData.permissions) {
      return { status: false, message: "نقش یافت نشد یا دسترسی ندارد" };
    }

    return {
      status: true,
      data: roleData.permissions.map((p) => p.key),
    };
  } catch (error) {
    console.error("خطا در دریافت دسترسی‌ها:", error);
    return {
      status: false,
      message: "خطا در دریافت دسترسی‌ها",
      error: error.message,
    };
  }
});
