/**
 * @module firebase
 * @description Build and deploy to Firebase Hosting
 */

import { Directory, Secret, dag } from "../../deps.ts";
import { getDirectory, getFirebaseToken } from "./lib.ts";

export enum Job {
  build = "build",
  deploy = "deploy",
}

export const exclude = ["node_modules"];

const NODE_VERSION = Deno.env.get("NODE_VERSION") || "18.16.1";
const BUN_VERSION = Deno.env.get("BUN_VERSION") || "1.0.25";

/**
 * @function
 * @description Build the project
 * @param src {string | Directory | undefined}
 * @returns {Promise<Directory | string>}
 */
export async function build(
  src: string | Directory | undefined = "."
): Promise<Directory | string> {
  const context = await getDirectory(dag, src);
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
  const id = await ctr.directory("/output").id();
  await ctr.directory("/output/dist").export("dist");
  return id;
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
  const context = await getDirectory(dag, src);

  const secret = await getFirebaseToken(dag, token);
  if (!secret) {
    console.log("Firebase token is not set");
    Deno.exit(1);
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

  const result = await ctr.stdout();
  return result;
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
