// combineReactFiles.js
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, "src"); // only include files from /src
const OUTPUT_FILE = "combined_code_for_appendix.txt";
const VALID_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".css", ".scss"];

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, fileList);
    } else if (VALID_EXTENSIONS.includes(path.extname(fullPath))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function writeCombinedFile(filePaths) {
  const writeStream = fs.createWriteStream(OUTPUT_FILE, { flags: "w" });

  filePaths.forEach((filePath) => {
    const content = fs.readFileSync(filePath, "utf-8");
    const relativePath = path.relative(ROOT_DIR, filePath);
    writeStream.write(`\n\n// --- File: src/${relativePath} ---\n\n`);
    writeStream.write(content);
  });

  writeStream.end(() => {
    console.log(`✅ Combined code written to ${OUTPUT_FILE}`);
  });
}

const allFiles = walk(ROOT_DIR);
writeCombinedFile(allFiles);
