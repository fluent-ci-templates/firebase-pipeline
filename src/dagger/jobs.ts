import Client, { connect } from "../../deps.ts";

export enum Job {
  deploy = "deploy",
}

export const exclude = ["node_modules"];

export const deploy = async (src = ".", directory?: string, token?: string) => {
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
        "--only",
        directory || ".",
        "--non-interactive",
      ]);

    await ctr.stdout();
  });

  return "";
};

export type JobExec = (
  src?: string,
  directory?: string,
  token?: string
) => Promise<string>;

export const runnableJobs: Record<Job, JobExec> = {
  [Job.deploy]: deploy,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.deploy]: "Deploy to Firebase Hosting",
};
