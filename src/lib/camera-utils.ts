export async function requestCameraPermission(): Promise<boolean> {
  try {
    // Check if we're in a browser environment
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return false;
    }

    // Request camera permission
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment' // Use back camera for better barcode scanning
      } 
    });
    
    // Stop the stream immediately as we just wanted to check permission
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.error('Camera permission denied:', error);
    return false;
  }
}

export function isCameraSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

export function getBarcodeFromImage(imageData: string): Promise<string | null> {
  // This would integrate with a barcode detection library
  // For now, we'll return null and rely on the camera scanner
  return Promise.resolve(null);
}