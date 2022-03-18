import execa from "execa";
import { resolve } from "path";
import { Config, Context } from "semantic-release";
import { UserConfig } from "./UserConfig";

export const prepare = async (pluginConfig: Config & UserConfig, context: Context): Promise<void> => {
  const dotnet = pluginConfig.dotnet || "dotnet";

  try {
    for (const projectPath of pluginConfig.projectPath as string[]) {
      const project = resolve(projectPath);

      const cliArgs = ["pack", project, "-c", "Release", "-o", "out"];
      if (pluginConfig.includeSource === true) {
        cliArgs.push("--include-source");
      }
      if (pluginConfig.includeSymbols === true) {
        cliArgs.push("--include-symbols", "-p:SymbolPackageFormat=snupkg");
      }

      if (pluginConfig.usePackageVersion === true) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cliArgs.push(`-p:PackageVersion=${context.nextRelease!.version}`);
      }

      context.logger.log(`running command "${dotnet} ${cliArgs.join(" ")}" ...`);

      await execa(dotnet, cliArgs, { stdio: "inherit" });
    }
  } catch (err) {
    context.logger.error(`${dotnet} pack failed: ${(err as Error).message}`);
    throw err;
  }
};
