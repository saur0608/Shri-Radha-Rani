'use client';

import React, { useState } from 'react';

interface ProductGalleryProps {
  images: Array<{ id?: string; url: string; altText?: string; isPrimary?: boolean }>;
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(
    images.find((img) => img.isPrimary)?.url || images[0]?.url || ''
  );

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Frame */}
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border-2 border-gold-200 dark:border-zinc-800 shadow-md">
        <img
          src={selectedImage}
          alt={productName}
          className="w-full h-full object-cover object-center transition-all duration-300"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(img.url)}
              className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                selectedImage === img.url
                  ? 'border-radha-600 ring-2 ring-radha-400 shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-700 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt={`${productName} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
