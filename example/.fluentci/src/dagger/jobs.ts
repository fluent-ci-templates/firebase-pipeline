/**
 * @module firebase
 * @description Build and deploy to Firebase Hosting
 */

import { Directory, Secret, dag, exit, env } from "../../deps.ts";
import { getDirectory, getFirebaseToken } from "./lib.ts";

export enum Job {
  build = "build",
  deploy = "deploy",
}

export const exclude = ["node_modules"];

const NODE_VERSION = env.get("NODE_VERSION") || "18.16.1";
const BUN_VERSION = env.get("BUN_VERSION") || "1.0.25";

/**
 * @function
 * @description Build the project
 * @param src {string | Directory | undefined}
 * @returns {Promise<Directory | string>}
 */
export async function build(
  src: string | Directory | undefined = "."
): Promise<Directory | string> {
  const context = await getDirectory(src);
  const ctr = dag
    .pipeline(Job.build)
    .container()
    .from("pkgxdev/pkgx:latest")
    .withExec(["apt-get", "update"])
    .withExec(["apt-get", "install", "-y", "ca-certificates"])
    .withExec(["pkgx", "install", `node@${NODE_VERSION}`, `bun@${BUN_VERSION}`])
    .withMountedCache("/root/.bun/install/cache", dag.cacheVolume("bun-cache"))
    .withMountedCache("/app/node_modules", dag.cacheVolume("node_modules"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["bun", "install"])
    .withExec(["bun", "run", "build"])
    .withExec(["mkdir", "-p", "/output"])
    .withExec(["cp", "-r", "dist", "/output"]);

  await ctr.stdout();
  await ctr.directory("/output/dist").export("dist");
  return ctr.directory("/output").id();
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
  const context = await getDirectory(src);

  const secret = await getFirebaseToken(token);
  if (!secret) {
    console.log("Firebase token is not set");
    exit(1);
    return "";
  }

  const ctr = dag
    .pipeline(Job.deploy)
    .container()
    .from("pkgxdev/pkgx:latest")
    .withExec(["apt-get", "update"])
    .withExec(["apt-get", "install", "-y", "ca-certificates"])
    .withExec(["pkgx", "install", "firebase"])
    .withDirectory("/app", context)
    .withWorkdir("/app")
    .withSecretVariable("FIREBASE_TOKEN", secret)
    .withExec([
      "bash",
      "-c",
      "firebase deploy --non-interactive --token $FIREBASE_TOKEN",
    ]);

  return ctr.stdout();
}

export type JobExec = (
  src?: string,
  token?: string
) => Promise<Directory | string>;

export const runnableJobs: Record<Job, JobExec> = {
  [Job.build]: build,
  [Job.deploy]: deploy,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.build]: "Build the project",
  [Job.deploy]: "Deploy to Firebase Hosting",
};
