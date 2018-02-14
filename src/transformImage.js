import sharp from 'sharp'

/*
  CROP GRAVITY:
  sharp.strategy.entropy,
  'north',
  'northeast',
  'east',
  'southeast',
  'south',
  'southwest',
  'west',
  'northwest',
  'center'
*/

export const transformImage = (src, options) => {
  const sImg = sharp(src);
  // default height and width to null for auto scale
  console.log('transformImage options',options);

  sImg.resize(options.width || null, options.height || null)

  // rotate iamge
  if (options.rotate) {
    sImg.rotate(options.rotate)
  }

  // if a ratio has been defined
  if (options.ratio) {
    switch (options.ratio) {
      case 'min':
        sImg.min()
        break
      case 'stretch':
        sImg.ignoreAspectRatio()
        break
      default:
        sImg.max()
        break
    }
  } else {
    sImg.max()
  }
  // add background
  if (options.embed) {
    sImg.background(options.background ? '#' + options.background : '#fff')
    sImg.embed()
  }
  // crop image
  if (options.crop) {
    const cropOption = (options.crop === 'entropy') ? sharp.strategy.entropy : options.crop

    sImg.max()
    sImg.crop(cropOption)
  }

  // jpeg compression
  if (options.quality && (options.format === 'jpg' || options.format === 'jpeg')) {
    sImg.jpeg({ quality: options.quality })
  }

  //TODO add png compression.
  // if (options.compression && options.format === 'png') {
  //   sImg.png({ compressionLevel: options.compression })
  // }

  // output
  return sImg.toBuffer()
}
