import got from "got";
import tar from "tar";
import { Stream } from "stream";
import { promisify } from "util";
import { join } from "path";
import { tmpdir } from "os";
import { createWriteStream, promises as fs } from "fs";

const pipeline = promisify(Stream.pipeline);

export type RepoInfo = {
  username: string;
  name: string;
  branch: string;
  filePath: string;
};

export async function isUrlOk(url: string): Promise<boolean> {
  const res = await got.head(url).catch((e) => e);
  return res.statusCode === 200;
}

export async function getRepoInfo(
  url: URL,
): Promise<RepoInfo | undefined> {
  const [, username, name, t, _branch, ...file] = url.pathname.split("/");
  const filePath = file.join("/");

  if (
    // Support repos whose entire purpose is to be a NextJS example, e.g.
    // https://github.com/:username/:my-cool-nextjs-example-repo-name.
    t === undefined ||
    // Support GitHub URL that ends with a trailing slash, e.g.
    // https://github.com/:username/:my-cool-nextjs-example-repo-name/
    // In this case "t" will be an empty string while the next part "_branch" will be undefined
    (t === "" && _branch === undefined)
  ) {
    const infoResponse = await got(
      `https://api.github.com/repos/${username}/${name}`
    ).catch((e) => e);
    if (infoResponse.statusCode !== 200) {
      return;
    }
    const info = JSON.parse(infoResponse.body);
    return { username, name, branch: info["default_branch"], filePath };
  }

  const branch = _branch;

  if (username && name && branch && t === "tree") {
    return { username, name, branch, filePath };
  }
}

export function hasRepo({
  username,
  name,
  branch,
  filePath,
}: RepoInfo): Promise<boolean> {
  const contentsUrl = `https://api.github.com/repos/${username}/${name}/contents`;
  const packagePath = `${filePath ? `/${filePath}` : ""}/package.json`;

  return isUrlOk(contentsUrl + packagePath + `?ref=${branch}`);
}

export function existsInRepo(nameOrUrl: string): Promise<boolean> {
  try {
    const url = new URL(nameOrUrl);
    return isUrlOk(url.href);
  } catch {
    return isUrlOk(nameOrUrl);
  }
}

async function downloadTar(url: string) {
  const tempFile = join(tmpdir(), `cwa.temp-${Date.now()}`);
  await pipeline(got.stream(url), createWriteStream(tempFile));
  return tempFile;
}

export async function downloadAndExtractRepo(
  root: string,
  { username, name }: RepoInfo
) {
  const tempFile = await downloadTar(
    `https://codeload.github.com/${username}/${name}/tar.gz/main`
  );

  console.log("tempFile", tempFile);

  await tar.x({
    file: tempFile,
    cwd: root,
    strip: 1,
    filter: (p) =>
      p.startsWith(
        name
      ),
  });

  await fs.unlink(tempFile);
}
