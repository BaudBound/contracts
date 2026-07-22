import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const files = await collectJsonFiles(root);

if (files.length === 0) {
  throw new Error("No JSON contracts were found.");
}

for (const file of files) {
  JSON.parse(await readFile(file, "utf8"));
}

const manifest = JSON.parse(await readFile(path.join(root, "contract.json"), "utf8"));
if (manifest.format !== "baudbound.contracts" || manifest.format_version !== 1) {
  throw new Error("contract.json does not identify BaudBound contract format 1.");
}

console.log(`Validated ${files.length} JSON contract files.`);

async function collectJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const itemPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectJsonFiles(itemPath)));
    if (entry.isFile() && entry.name.endsWith(".json")) files.push(itemPath);
  }
  return files.sort();
}
