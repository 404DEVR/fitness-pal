'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, X, Scan, Loader2, Package } from 'lucide-react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

interface ScannedProduct {
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  category: string;
  image_url?: string;
  barcode: string;
  serving_size: string;
  source: string;
}

interface BarcodeScannerProps {
  onProductScanned: (product: ScannedProduct) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onProductScanned, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);

  const handleScan = async (barcode: string) => {
    if (!barcode || isLoading) return;

    setIsLoading(true);
    setError('');
    setIsScanning(false);

    try {
      console.log('Scanned barcode:', barcode);
      
      const response = await fetch('/api/barcode-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode }),
      });

      const data = await response.json();

      if (response.ok) {
        setScannedProduct(data);
      } else {
        setError(data.message || 'Product not found in our database');
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
      setError('Failed to scan barcode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLookup = async () => {
    if (!manualBarcode.trim()) return;
    await handleScan(manualBarcode.trim());
  };

  const handleUseProduct = () => {
    if (scannedProduct) {
      onProductScanned(scannedProduct);
      onClose();
    }
  };

  const resetScanner = () => {
    setScannedProduct(null);
    setError('');
    setIsScanning(true);
    setManualBarcode('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Scan Barcode
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Looking up product...</p>
            </div>
          )}

          {/* Scanned Product Display */}
          {scannedProduct && !isLoading && (
            <div className="space-y-4">
              <div className="text-center">
                {scannedProduct.image_url && (
                  <img 
                    src={scannedProduct.image_url} 
                    alt={scannedProduct.name}
                    className="w-24 h-24 object-cover rounded-lg mx-auto mb-3"
                  />
                )}
                <h3 className="font-semibold text-lg">{scannedProduct.name}</h3>
                {scannedProduct.brand && (
                  <p className="text-sm text-muted-foreground">{scannedProduct.brand}</p>
                )}
                <Badge variant="outline" className="mt-2">
                  {scannedProduct.source}
                </Badge>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <div className="text-sm font-medium mb-2">
                  Nutrition per {scannedProduct.serving_size}:
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Calories: <span className="font-medium">{scannedProduct.calories}</span></div>
                  <div>Protein: <span className="font-medium">{scannedProduct.protein}g</span></div>
                  <div>Carbs: <span className="font-medium">{scannedProduct.carbs}g</span></div>
                  <div>Fat: <span className="font-medium">{scannedProduct.fat}g</span></div>
                  {scannedProduct.fiber && scannedProduct.fiber > 0 && (
                    <div>Fiber: <span className="font-medium">{scannedProduct.fiber}g</span></div>
                  )}
                  {scannedProduct.sugar && scannedProduct.sugar > 0 && (
                    <div>Sugar: <span className="font-medium">{scannedProduct.sugar}g</span></div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUseProduct} className="flex-1">
                  <Package className="h-4 w-4 mr-2" />
                  Use This Product
                </Button>
                <Button variant="outline" onClick={resetScanner}>
                  Scan Another
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && !scannedProduct && (
            <div className="text-center py-4">
              <div className="text-red-500 text-sm mb-4">{error}</div>
              <Button variant="outline" onClick={resetScanner}>
                Try Again
              </Button>
            </div>
          )}

          {/* Camera Scanner */}
          {isScanning && !isLoading && !scannedProduct && (
            <div className="space-y-4">
              <div className="relative">
                <div className="aspect-square bg-black rounded-lg overflow-hidden">
                  <BarcodeScannerComponent
                    width="100%"
                    height="100%"
                    onUpdate={(err, result) => {
                      if (result) {
                        handleScan(result.getText());
                      }
                    }}
                  />
                </div>
                <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-48 h-48 border-2 border-primary rounded-lg opacity-50"></div>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                Point your camera at the barcode
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-barcode">Barcode Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="manual-barcode"
                    placeholder="Enter barcode number"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualLookup()}
                  />
                  <Button onClick={handleManualLookup} disabled={!manualBarcode.trim()}>
                    Lookup
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}