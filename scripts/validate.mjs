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

await validateRepositoryEnums();
await validateManifestVariableTypes();
await validateManifestSettingTypes();

console.log(`Validated ${files.length} JSON contract files.`);

async function validateRepositoryEnums() {
  const repository = JSON.parse(await readFile(path.join(root, "repository.schema.json"), "utf8"));
  const permissions = JSON.parse(await readFile(path.join(root, "permissions.schema.json"), "utf8"));
  const capabilities = JSON.parse(await readFile(path.join(root, "capabilities.schema.json"), "utf8"));
  const scriptProperties = repository.$defs?.script?.properties;

  assertSameValues(
    "repository permissions",
    scriptProperties?.permissions?.items?.enum,
    permissions.properties?.declared_permissions?.items?.enum,
  );
  assertSameValues(
    "repository capabilities",
    scriptProperties?.capabilities?.items?.enum,
    capabilities.properties?.required_capabilities?.items?.enum,
  );
  assertSameValues(
    "repository target runtimes",
    scriptProperties?.target_runtimes?.items?.enum,
    capabilities.properties?.target_runtimes?.items?.enum,
  );
  assertSameValues(
    "repository risk levels",
    scriptProperties?.risk_level?.enum,
    permissions.properties?.risk_level?.enum,
  );
}

async function validateManifestVariableTypes() {
  const manifest = JSON.parse(await readFile(path.join(root, "manifest.schema.json"), "utf8"));
  const variable = manifest.properties?.variables?.items;
  const declaredTypes = variable?.properties?.type?.enum;
  const typedValues = variable?.oneOf?.map((entry) => entry.properties?.type?.const);

  assertSameValues("manifest variable types", declaredTypes, typedValues);
}

async function validateManifestSettingTypes() {
  const manifest = JSON.parse(await readFile(path.join(root, "manifest.schema.json"), "utf8"));
  const setting = manifest.properties?.settings?.items;
  const declaredTypes = setting?.properties?.type?.enum;
  const typedValues = setting?.allOf?.map(
    (entry) => entry.if?.properties?.type?.const,
  );

  assertSameValues("manifest setting types", declaredTypes, typedValues);
}

function assertSameValues(label, actual, expected) {
  if (!Array.isArray(actual) || !Array.isArray(expected)) {
    throw new Error(`${label} must be represented by arrays in both schemas.`);
  }
  if (JSON.stringify([...actual].sort()) !== JSON.stringify([...expected].sort())) {
    throw new Error(`${label} do not match their canonical contract.`);
  }
}

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
