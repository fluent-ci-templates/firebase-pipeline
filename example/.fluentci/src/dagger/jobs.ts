import Client, { Directory, Secret } from "../../deps.ts";
import { connect } from "../../sdk/connect.ts";
import { getDirectory, getFirebaseToken } from "./lib.ts";

export enum Job {
  build = "build",
  deploy = "deploy",
}

export const exclude = ["node_modules"];

const NODE_VERSION = Deno.env.get("NODE_VERSION") || "18.16.1";
const BUN_VERSION = Deno.env.get("BUN_VERSION") || "1.0.3";

/**
 * @function
 * @description Build the project
 * @param src {string | Directory | undefined}
 * @returns {string}
 */
export async function build(src: string | Directory | undefined = ".") {
  await connect(async (client: Client) => {
    const context = getDirectory(client, src);
    const ctr = client
      .pipeline(Job.build)
      .container()
      .from("pkgxdev/pkgx:latest")
      .withExec(["apt-get", "update"])
      .withExec(["apt-get", "install", "-y", "ca-certificates"])
      .withExec([
        "pkgx",
        "install",
        `node@${NODE_VERSION}`,
        `bun@${BUN_VERSION}`,
      ])
      .withMountedCache(
        "/root/.bun/install/cache",
        client.cacheVolume("bun-cache")
      )
      .withMountedCache("/app/node_modules", client.cacheVolume("node_modules"))
      .withMountedCache("/app/dist", client.cacheVolume("firebase-public"))
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec(["bun", "install"])
      .withExec(["bun", "run", "build"]);

    await ctr.stdout();
  });
  return "Done";
}

/**
 * @function
 * @description Deploy to Firebase Hosting
 * @param src {string | Directory | undefined}
 * @param token {string | Secret | undefined}
 * @returns {string}
 */
export async function deploy(
  src: string | Directory | undefined = ".",
  token?: string | Secret
): Promise<string> {
  await connect(async (client: Client) => {
    const context = getDirectory(client, src);

    const secret = getFirebaseToken(client, token);
    if (!secret) {
      console.log("Firebase token is not set");
      Deno.exit(1);
    }

    const ctr = client
      .pipeline(Job.deploy)
      .container()
      .from("pkgxdev/pkgx:latest")
      .withExec(["apt-get", "update"])
      .withExec(["apt-get", "install", "-y", "ca-certificates"])
      .withExec(["pkgx", "install", "firebase"])
      .withMountedCache("/app/dist", client.cacheVolume("firebase-public"))
      .withDirectory("/app", context)
      .withWorkdir("/app")
      .withSecretVariable("FIREBASE_TOKEN", secret)
      .withExec([
        "bash",
        "-c",
        "firebase deploy --non-interactive --token $FIREBASE_TOKEN",
      ]);

    await ctr.stdout();
  });

  return "Done";
}

export type JobExec = (src?: string, token?: string) => Promise<string>;

export const runnableJobs: Record<Job, JobExec> = {
  [Job.build]: build,
  [Job.deploy]: deploy,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.build]: "Build the project",
  [Job.deploy]: "Deploy to Firebase Hosting",
};
