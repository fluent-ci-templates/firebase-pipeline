import Client, { connect } from "../../deps.ts";

export enum Job {
  build = "build",
  deploy = "deploy",
}

export const exclude = ["node_modules"];

const NODE_VERSION = Deno.env.get("NODE_VERSION") || "18.16.1";
const BUN_VERSION = Deno.env.get("BUN_VERSION") || "1.0.3";

export const build = async (src = ".") => {
  await connect(async (client: Client) => {
    const context = client.host().directory(src);
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
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec(["bun", "install"])
      .withExec(["bun", "run", "build"])
      .withExec(["mkdir", "-p", "dist", "build"]);

    await ctr.stdout();

    await ctr.directory("/app/dist").export("./dist");
    await ctr.directory("/app/build").export("./build");
  });
  return "Done";
};

export const deploy = async (src = ".", token?: string) => {
  await connect(async (client: Client) => {
    const context = client.host().directory(src);
    const ctr = client
      .pipeline(Job.deploy)
      .container()
      .from("pkgxdev/pkgx:latest")
      .withExec(["apt-get", "update"])
      .withExec(["apt-get", "install", "-y", "ca-certificates"])
      .withExec(["pkgx", "install", "firebase"])
      .withDirectory("/app", context)
      .withWorkdir("/app")
      .withEnvVariable(
        "FIREBASE_TOKEN",
        Deno.env.get("FIREBASE_TOKEN") || token!
      )
      .withExec([
        "firebase",
        "deploy",
        "--non-interactive",
        "--token",
        Deno.env.get("FIREBASE_TOKEN") || token!,
      ]);

    await ctr.stdout();
  });

  return "Done";
};

export type JobExec = (src?: string, token?: string) => Promise<string>;

export const runnableJobs: Record<Job, JobExec> = {
  [Job.build]: build,
  [Job.deploy]: deploy,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.build]: "Build the project",
  [Job.deploy]: "Deploy to Firebase Hosting",
};
