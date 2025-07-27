import { prisma } from "../utils/db";
import { safeJson } from "../utils/json";
import { readBody } from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, permissions } = body;

  if (!name || !Array.isArray(permissions)) {
    return { status: false, message: "Invalid role data" };
  }

  try {
    // تبدیل keyها به ID واقعی
    const existingPermissions = await prisma.permission.findMany({
      where: { key: { in: permissions } },
      select: { id: true },
    });

    const role = await prisma.role.create({
      data: {
        name,
        permissions: {
          connect: existingPermissions.map((p) => ({ id: p.id })),
        },
      },
      include: { permissions: true },
    });

    return { status: true, data: safeJson(role) };
  } catch (e) {
    return { status: false, message: e.message };
  }
});
