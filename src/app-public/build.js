/* eslint-env node */
import { series } from "async";
import { exec } from "child_process";
import { existsSync } from "fs";
import { rename, rmdir } from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log("📦 Started Building");

/**
 * Utility function wrapping the exec in a promise and logging the output
 * @param {string} command 
 * @param {object} options 
 * @returns {Promise} Resolves once the exec is done
 */
function execAsync (command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        // console.error(error);
        reject(new Error(`Error occurred during execution: '${command}'`));
      }
      console.log(stdout);
      if (stderr) {
        console.error(stderr);
      }
      resolve();
    });
  });
}

async function buildTarget ({ project, indexTargetName }) {
  console.log(`================== 🟡 Started '${project}' ==================`);

  const targetDistPath = path.join(__dirname, "dist", project);
  
  // Build
  const env = { BUILD_TARGET: project };
  await execAsync("vite build", { env });

  // move html to correct spot and rename
  const indexPath = path.join(targetDistPath, "src", project, "index.html");
  const targetPath = path.join(targetDistPath, indexTargetName);
  if (!existsSync(indexPath)) {
    throw new Error(`Could not find index.html for '${project}'`);
  }
  await rename(indexPath, targetPath);

  // clear folders
  await rmdir(path.join(targetDistPath, "src", project));
  await rmdir(path.join(targetDistPath, "src"));

  console.log(`================== 🟢 Done '${project}' ==================`);
}

let buildSuccessful = true;
try {
  await series([
    async () => {
      await execAsync("npm run type-check");
    },
    async () => {
      await buildTarget({ project: "public", indexTargetName: "index.html" });
    },
    async () => {
      await buildTarget({ project: "login", indexTargetName: "login.html" });
    },
    async () => {
      await buildTarget({ project: "app", indexTargetName: "app.html" });
    },
    async () => {
      await buildTarget({ project: "notFound", indexTargetName: "NotFound.html" });
    },
  ]);
} catch (err) {
  console.log(err.message);
  buildSuccessful = false;
}

if (buildSuccessful) {
  console.log("✅ Build successful");
} else {
  console.log("❌ Build failed");
}
