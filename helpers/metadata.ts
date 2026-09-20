import fs from 'fs';
import log from 'loglevel';
import _ from 'lodash';
import {
  generateRandomSet,
  getMetadata,
  readJsonFile,
  shuffle,
} from './various';

const { writeFile, mkdir } = fs.promises;

export const ASSETS_DIRECTORY = './assets';
export const TRAITS_DIRECTORY = './traits';

export async function createMetadataFiles(
  numberOfImages: string,
  configLocation: string,
  treatAttributesAsFileNames: boolean,
): Promise<any[]> {
  let numberOfFilesCreated: number = 0;
  const randomizedSets = [];

  if (!fs.existsSync(ASSETS_DIRECTORY)) {
    try {
      await mkdir(ASSETS_DIRECTORY);
    } catch (err) {
      log.error('unable to create assets directory', err);
    }
  }

  const {
    breakdown,
    name,
    symbol,
    creators,
    description,
    seller_fee_basis_points,
    collection,
    dnp,
    premadeCustoms,
  } = await readJsonFile(configLocation);

  while (numberOfFilesCreated < premadeCustoms.length) {
    randomizedSets.push(premadeCustoms[numberOfFilesCreated]);
    numberOfFilesCreated += 1;
  }

  // The number of unique sets is limited by the number of
  // combinations of the traits in the breakdown. Cap the number of
  // images at that total so we don't loop forever when more images
  // are requested than unique combinations that exist.
  const totalUniqueSets = Object.values(breakdown).reduce(
    (total: number, traits: any) => total * Object.keys(traits).length,
    1,
  );
  const requestedImages = parseInt(numberOfImages, 10);
  const maxImages = Math.min(requestedImages, totalUniqueSets);

  if (maxImages < requestedImages) {
    log.warn(
      `Only ${totalUniqueSets} unique trait combinations exist. ` +
        `Generating ${maxImages} images instead of ${requestedImages}.`,
    );
  }

  while (numberOfFilesCreated < maxImages) {
    const randomizedSet = generateRandomSet(breakdown, dnp);

    if (!_.some(randomizedSets, randomizedSet)) {
      randomizedSets.push(randomizedSet);
      numberOfFilesCreated += 1;
    }
  }

  const shuffled = shuffle(randomizedSets);

  for (let i = 0; i < shuffled.length; i++) {
    const metadata = getMetadata(
      name,
      symbol,
      i,
      creators,
      description,
      seller_fee_basis_points,
      shuffled[i],
      collection,
      treatAttributesAsFileNames,
    );

    try {
      await writeFile(
        `${ASSETS_DIRECTORY}/${i}.json`,
        JSON.stringify(metadata),
      );
    } catch (err) {
      log.error(`${numberOfFilesCreated} failed to get created`, err);
    }
  }

  // map through after because IDs would make sets unique
  const randomSetWithIds = shuffled.map((item, index) => ({
    id: index + 1,
    ...item,
  }));

  return randomSetWithIds;
}
