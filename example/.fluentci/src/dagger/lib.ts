import Client, {
  Directory,
  DirectoryID,
  Secret,
  SecretID,
} from "../../deps.ts";

export const getDirectory = async (
  client: Client,
  src: string | Directory | undefined = "."
) => {
  if (src instanceof Directory) {
    return src;
  }
  if (typeof src === "string") {
    try {
      const directory = client.loadDirectoryFromID(src as DirectoryID);
      await directory.id();
      return directory;
    } catch (_) {
      return client.host
        ? client.host().directory(src)
        : client.currentModule().source().directory(src);
    }
  }
  return client.host
    ? client.host().directory(src)
    : client.currentModule().source().directory(src);
};

export const getFirebaseToken = async (
  client: Client,
  token?: string | Secret
) => {
  if (Deno.env.get("FIREBASE_TOKEN")) {
    return client.setSecret("FIREBASE_TOKEN", Deno.env.get("FIREBASE_TOKEN")!);
  }
  if (token && typeof token === "string") {
    try {
      const secret = client.loadSecretFromID(token as SecretID);
      await secret.id();
      return secret;
    } catch (_) {
      return client.setSecret("FIREBASE_TOKEN", token);
    }
  }
  if (token && token instanceof Secret) {
    return token;
  }
  return undefined;
};
