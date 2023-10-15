import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";

import { fileURLToPath } from "node:url";

// Is there an official way to get the path to another packages binary?
const __dirname = dirname(fileURLToPath(import.meta.url));
const binPath = resolve(
  __dirname,
  "../",
  `nginx-dist-${process.platform}-${process.arch}`,
  "nginx",
);

export default async () => {
  const healthWaitTime = 5000
  let isClosed = false;
  const proc = spawn(binPath);

  proc.stdout.on("data", (data) => console.log(data.toString()));
  proc.stderr.on("data", (data) => console.error(data.toString()));
  proc.on("close", (code) => {
    console.warn("nginxShutdown", code);
    isClosed = true;
  });

  await new Promise((resolve, reject) => {
    const processCloseTimeout = setTimeout(() => {
      if (isClosed) {
        reject(new Error("Nginx didn't start properly"));
      } else {
        reject(new Error("Nginx didn't respond"));
        proc.kill("SIGKILL");
      }
    }, healthWaitTime);

    let backoff = 50;
    async function checkIfNginxRunning() {
      const result = await fetch(`http://127.0.0.1:8080/health_check`)
        .then((res) => res.status < 499)
        .catch(
          () => null,
        );
      if (result) {
        clearTimeout(processCloseTimeout);
        resolve();
      } else {
        setTimeout(checkIfNginxRunning, backoff);
        backoff = Math.min(backoff + 50, 250);
      }
    }
    checkIfNginxRunning();
  });

  return {
    proc,
    stop: async () => {
      proc.stdout.destroy();
      proc.stderr.destroy();
      proc.kill("SIGKILL");
    },
  };
};
