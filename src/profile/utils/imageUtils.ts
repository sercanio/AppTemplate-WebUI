/**
 * Compresses an image file to reduce its size
 * @param file The image file to compress
 * @param maxSizeMB Maximum size in MB
 * @returns A promise that resolves to the compressed file
 */
export async function compressImage(file: File, maxSizeMB = 1): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate the width and height, preserving the aspect ratio
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Adjust quality based on file size
        let quality = 0.7; // Default quality
        const originalSizeMB = file.size / (1024 * 1024);

        if (originalSizeMB > maxSizeMB * 2) {
          quality = 0.5;
        } else if (originalSizeMB > maxSizeMB) {
          quality = 0.6;
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob conversion failed"));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            // If still too large, compress again with lower quality
            if (compressedFile.size > maxSizeMB * 1024 * 1024) {
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error("Canvas to Blob conversion failed"));
                    return;
                  }

                  const finalFile = new File([blob], file.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });

                  resolve(finalFile);
                },
                "image/jpeg",
                0.4,
              );
            } else {
              resolve(compressedFile);
            }
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = (error) => {
        reject(error);
      };
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
}

/**
 * Validates if a file is an image and within size limits
 * @param file The file to validate
 * @param maxSizeMB Maximum size in MB
 * @returns An object with isValid and errorMessage properties
 */
export function validateImageFile(file: File, maxSizeMB = 3): { isValid: boolean; errorMessage: string } {
  // Check if file is an image
  if (!file.type.startsWith("image/")) {
    return {
      isValid: false,
      errorMessage: "Please select an image file (JPEG, PNG, etc.)",
    };
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return {
      isValid: false,
      errorMessage: `Image size must be less than ${maxSizeMB}MB. Current size: ${fileSizeMB.toFixed(2)}MB`,
    };
  }

  return {
    isValid: true,
    errorMessage: "",
  };
}
