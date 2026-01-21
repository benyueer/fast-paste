import path from 'node:path'
import sharp from 'sharp'

/**
 * 将图片中的白色背景转换为透明
 * @param {string} inputPath 输入图片路径
 * @param {string} outputPath 输出图片路径
 * @param {number} threshold 阈值 (0-255)，默认为 240，表示大于该值的颜色会被视为白色
 */
async function removeWhiteBackground(inputPath, outputPath, threshold = 240) {
  try {
    const image = sharp(inputPath)
    const { data, info } = await image
      .ensureAlpha() // 确保有透明通道
      .raw()
      .toBuffer({ resolveWithObject: true })

    const { width, height, channels } = info

    // 遍历像素，处理白色背景
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // 如果 RGB 都大于阈值，则认为是白色，设置透明度为 0
      if (r > threshold && g > threshold && b > threshold) {
        data[i + 3] = 0
      }
    }

    // 将处理后的数据写回文件
    await sharp(data, {
      raw: {
        width,
        height,
        channels,
      },
    })
      .png() // 强制导出为 png 格式
      .toFile(outputPath)

    console.log(`处理完成：${inputPath} -> ${outputPath}`)
  }
  catch (error) {
    console.error('图片处理失败:', error)
  }
}

// 简单的命令行解析
const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('用法: node remove_white_background.js <input> <output> [threshold]')
  process.exit(1)
}

const input = path.resolve(args[0])
const output = path.resolve(args[1])
const threshold = args[2] ? Number.parseInt(args[2], 10) : 240

removeWhiteBackground(input, output, threshold)
