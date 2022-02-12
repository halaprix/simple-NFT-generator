#!/usr/bin/env ts-node
import * as fs from "fs";
import { program } from "commander";

import { generateConfigurations } from "./commands/generateConfigurations";

import log from "loglevel";
import { createMetadataFiles } from "./helpers/metadata";
import { createGenerativeArt } from "./commands/createArt";
const CACHE_PATH = './.cache';

program.version("0.0.2");


if (!fs.existsSync(CACHE_PATH)) {
  fs.mkdirSync(CACHE_PATH);
}
log.setLevel(log.levels.INFO);


program
  .command("generate_art_configurations")
  .argument(
    "<directory>",
    "Directory containing traits named from 0-n",
    (val) => fs.readdirSync(`${val}`)
  )
  .action(async (files: string[]) => {
    log.info("creating traits configuration file");
    const startMs = Date.now();
    const successful = await generateConfigurations(files);
    const endMs = Date.now();
    const timeTaken = new Date(endMs - startMs).toISOString().substr(11, 8);
    if (successful) {
      log.info("traits-configuration.json has been created!");
      log.info(
        `ended at: ${new Date(endMs).toISOString()}. time taken: ${timeTaken}`
      );
    } else {
      log.info("The art configuration file was not created");
    }
  });

program
  .command("create_generative_art")
  .option(
    "-n, --number-of-images <string>",
    "Number of images to be generated",
    "100"
  )
  .option(
    "-c, --config-location <string>",
    "Location of the traits configuration file",
    "./traits-configuration.json"
  )
  .option(
    "-o, --output-location <string>",
    "If you wish to do image generation elsewhere, skip it and dump randomized sets to file"
  )
  .option(
    "-ta, --treat-attributes-as-file-names <string>",
    "If your attributes are filenames, trim the .png off if set to true"
  )
  .action(async (directory, cmd) => {
    const {
      numberOfImages,
      configLocation,
      outputLocation,
      treatAttributesAsFileNames,
    } = cmd.opts();

    log.info("Loaded configuration file");

    // 1. generate the metadata json files
    const randomSets = await createMetadataFiles(
      numberOfImages,
      configLocation,
      treatAttributesAsFileNames == "true"
    );

    log.info("JSON files have been created within the assets directory");

    // 2. piecemeal generate the images
    if (!outputLocation) {
      await createGenerativeArt(configLocation, randomSets);
      log.info("Images have been created successfully!");
    } else {
      fs.writeFileSync(outputLocation, JSON.stringify(randomSets));

      log.info("Traits written!");
    }
  });

function programCommand(name: string) {
  return program
    .command(name)
    .option(
      "-e, --env <string>",
      "Solana cluster env name",
      "devnet" //mainnet-beta, testnet, devnet
    )
    .requiredOption("-k, --keypair <path>", `Solana wallet location`)
    .option("-l, --log-level <string>", "log level", setLogLevel)
    .option("-c, --cache-name <string>", "Cache file name", "temp");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setLogLevel(value:any, prev:any) {
  if (value === undefined || value === null) {
    return;
  }
  log.info("setting the log value to: " + value);
  log.setLevel(value);
}

program.parse(process.argv);
