import { defineEventHandler } from "h3";
import { promises as fs } from "fs";
import path from "path";
import { useRuntimeConfig } from "#imports";

export default defineEventHandler(async (event) => {
  // Determine the project root directory (set via middleware)
  const config = useRuntimeConfig();
  const rootDir = config.vornaPanel?.rootDir ?? process.cwd();
  const metaPath = path.join(rootDir, "public", "uploads", "images.json");
  try {
    const list = JSON.parse(await fs.readFile(metaPath, "utf-8"));
    return {
      status: true,
      data: {
        images: list,
      },
    };
  } catch (error) {
    return {
      status: true,
      data: {
        images: [],
      },
    };
  }
});
