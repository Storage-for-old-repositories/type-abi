import * as fs from "fs/promises";
import * as Path from "path";

export const scanAbis = async (
  rootPath: string,
  exclude?: (name: string, path: string) => boolean
) => {
  const abis = [] as Array<{
    path: string;
    filepath: string;
    paths: string[];
    filename: string;
  }>;

  const stackScanner = [rootPath];

  while (stackScanner.length > 0) {
    const path = stackScanner.pop()!;
    const files = await fs.readdir(path, { withFileTypes: true });

    for (const file of files) {
      if (file.isDirectory()) {
        const folder = Path.resolve(path, "./", file.name);
        stackScanner.push(folder);
        continue;
      }
      if (
        !file.isFile() ||
        !file.name.endsWith(".json") ||
        exclude?.(file.name, file.path)
      ) {
        continue;
      }

      const filename = Path.basename(file.name, Path.extname(file.name));
      const paths = path.slice(rootPath.length).split("\\").slice(1);

      abis.push({
        path,
        filepath: `${path}\\${filename}.json`,
        filename,
        paths,
      });
    }
  }

  return abis;
};

export const loadAbis = async (
  rootPath: string,
  exclude?: (name: string, path: string) => boolean
) => {
  const abis = await scanAbis(rootPath, exclude);
  const promises = abis.map(async (info) => {
    const abi = await fs.readFile(info.filepath, { encoding: "utf-8" });
    const json = JSON.parse(abi);
    return {
      abi: json,
      ...info,
    };
  });
  return await Promise.all(promises);
};
