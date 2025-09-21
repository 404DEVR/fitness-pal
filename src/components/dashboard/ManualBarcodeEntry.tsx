'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, X } from 'lucide-react';

interface ManualBarcodeEntryProps {
  onProductFound: (product: any) => void;
  onClose: () => void;
}

export function ManualBarcodeEntry({ onProductFound, onClose }: ManualBarcodeEntryProps) {
  const [barcode, setBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/barcode-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode: barcode.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        onProductFound(data);
      } else {
        setError(data.message || 'Product not found');
      }
    } catch (error) {
      setError('Failed to lookup barcode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Enter Barcode
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode Number</Label>
              <Input
                id="barcode"
                placeholder="Enter the barcode number"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading || !barcode.trim()} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  'Lookup Product'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>Tip: You can find the barcode number below the barcode lines on most products.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}