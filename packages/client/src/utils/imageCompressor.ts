/**
 * 压缩图片
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns 压缩后的 Blob 对象
 */
export interface CompressOptions {
  maxWidth?: number; // 最大宽度
  maxHeight?: number; // 最大高度
  quality?: number; // 压缩质量 0-1
  maxSizeMB?: number; // 目标最大文件大小（MB）
  outputType?: string; // 输出类型 'image/jpeg' | 'image/png' | 'image/webp'
}

export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.7,
    maxSizeMB = 1,
    outputType = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          // 创建 canvas 进行压缩
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("无法获取 canvas 上下文"));
            return;
          }

          // 计算压缩后的尺寸
          let { width, height } = calculateAspectRatioFit(
            img.width,
            img.height,
            maxWidth,
            maxHeight,
          );

          // 设置 canvas 尺寸
          canvas.width = width;
          canvas.height = height;

          // 填充白色背景（针对 PNG 透明背景）
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, width, height);

          // 绘制图片
          ctx.drawImage(img, 0, 0, width, height);

          // 第一次压缩
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error("图片压缩失败"));
                return;
              }

              // 如果文件仍然太大，进一步压缩
              if (blob.size > maxSizeMB * 1024 * 1024) {
                const furtherCompressed = await compressToTargetSize(
                  canvas,
                  blob,
                  maxSizeMB,
                  outputType,
                );
                resolve(furtherCompressed);
              } else {
                resolve(blob);
              }
            },
            outputType,
            quality,
          );
        };

        img.onerror = () => {
          reject(new Error("图片加载失败"));
        };
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("文件读取失败"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 计算保持宽高比的合适尺寸
 */
function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio,
  };
}

/**
 * 压缩到目标文件大小
 */
async function compressToTargetSize(
  canvas: HTMLCanvasElement,
  initialBlob: Blob,
  maxSizeMB: number,
  outputType: string,
): Promise<Blob> {
  const targetSize = maxSizeMB * 1024 * 1024;
  let quality = 0.7;
  let blob = initialBlob;

  // 逐步降低质量直到达到目标大小
  while (blob.size > targetSize && quality > 0.1) {
    quality -= 0.1;

    const compressedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, outputType, quality);
    });

    if (compressedBlob) {
      blob = compressedBlob;
    } else {
      break;
    }
  }

  return blob;
}

/**
 * 批量压缩图片
 */
export async function compressImages(
  files: File[],
  options?: CompressOptions,
): Promise<File[]> {
  const compressedFiles: File[] = [];

  for (const file of files) {
    try {
      const compressedBlob = await compressImage(file, options);

      // 将 Blob 转换为 File 对象
      const compressedFile = new File(
        [compressedBlob],
        `compressed_${file.name}`,
        {
          type: compressedBlob.type,
          lastModified: Date.now(),
        },
      );

      compressedFiles.push(compressedFile);
    } catch (error) {
      compressedFiles.push(file);
    }
  }

  return compressedFiles;
}

/**
 * 预览压缩效果（可选）
 */
export function previewCompression(
  originalFile: File,
  compressedBlob: Blob,
): Promise<{ original: string; compressed: string }> {
  return new Promise((resolve) => {
    const reader1 = new FileReader();
    const reader2 = new FileReader();

    reader1.onload = () => {
      reader2.onload = () => {
        resolve({
          original: reader1.result as string,
          compressed: reader2.result as string,
        });
      };
      reader2.readAsDataURL(compressedBlob);
    };

    reader1.readAsDataURL(originalFile);
  });
}
