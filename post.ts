import * as core from '@actions/core'

import { LayerCache } from './src/LayerCache'
import { ImageDetector } from './src/ImageDetector'
import { assertType } from 'typescript-is'

const main = async () => {
  core.debug('0');
  if (JSON.parse(core.getInput('skip-save', { required: true }))) {
    core.info('Skipping save.')
    return
  }
  core.debug('1');

  const primaryKey = core.getInput('key', { required: true })
  core.debug('2');

  const restoredKey = JSON.parse(core.getState(`restored-key`))
  core.debug('3');
  const alreadyExistingImages = JSON.parse(core.getState(`already-existing-images`))
  core.debug('4');
  const restoredImages = JSON.parse(core.getState(`restored-images`))
  core.debug('5');

  assertType<string>(restoredKey)
  assertType<string[]>(alreadyExistingImages)
  assertType<string[]>(restoredImages)
  core.debug('6');

  const imageDetector = new ImageDetector()
  core.debug('7');

  const existingAndRestoredImages = alreadyExistingImages.concat(restoredImages)
  core.debug('8');
  const newImages = await imageDetector.getImagesShouldSave(existingAndRestoredImages)
  core.debug('9');
  if (newImages.length < 1) {
    core.info(`There is no image to save.`)
    return
  }
  core.debug('10')
  const imagesToSave = await imageDetector.getImagesShouldSave(alreadyExistingImages)
  core.debug('11')
  const layerCache = new LayerCache(imagesToSave)
  core.debug('12')
  layerCache.concurrency = parseInt(core.getInput(`concurrency`, { required: true }), 10)
  core.debug('13')

  await layerCache.store(primaryKey)
  core.debug('14')
  await layerCache.cleanUp()
  core.debug('15')
}

main().catch(e => {
  console.error(e)
  core.setFailed(e)
})
