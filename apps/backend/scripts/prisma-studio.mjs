import net from "node:net";
import { spawn } from "node:child_process";

const DEFAULT_PORT = Number(process.env.PRISMA_STUDIO_PORT ?? 5555);

async function isPortFree(port) {
  return await new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port);
  });
}

async function findFreePort(startPort) {
  for (let port = startPort; port < startPort + 50; port += 1) {
    if (await isPortFree(port)) {
      return port;
    }
  }

  throw new Error(`No free port found starting at ${startPort}`);
}

const port = await findFreePort(DEFAULT_PORT);

console.log(`Starting Prisma Studio on http://localhost:${port}`);

const child = spawn(
  "pnpm",
  ["exec", "prisma", "studio", "--port", String(port), "--browser", "none"],
  {
    stdio: "inherit",
    shell: true,
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.exitCode = 1;
    return;
  }

  process.exitCode = code ?? 0;
});
