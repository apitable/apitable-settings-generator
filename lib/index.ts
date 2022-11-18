import { Generator } from "./generator.class";
import { createCommand } from "commander";
const program = createCommand();
import { name, version, description, homepage } from "../package.json";
import { IConfig } from "./config.interface";
const fs = require("fs");

program
  .name(name)
  .description(
    `
${name}
============================
${description}
${homepage}
  `
  )
  .version(version)
  .requiredOption("--config <config:string>", "Config JSON file [required]")
  .requiredOption("--token <token:string>", "API Token [required]")
  .option("--host <host:string>", "API Host URL, default: https://apitable.com/fusion/v1");

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse();

/**
 * generate, do it.
 */
 (async function main() {

  const options = program.opts();

  const configFilePath = options.config;
  const token = options.token;
  const host = options.host || undefined;

  const fileContent: string = await fs.readFileSync(configFilePath, 'utf-8');
  const settings: IConfig[] = JSON.parse(fileContent) as IConfig[];

  const gen = new Generator(settings,  token, host);

  await gen.generate();
})();

