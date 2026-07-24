"use client";

import React, { useEffect } from 'react';

// isTestMode sekarang default-nya mendeteksi lingkungan secara otomatis
export default function AdBanner({ dataAdSlot, isTestMode = process.env.NODE_ENV === 'development' }) {
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const enableAds = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true';

  useEffect(() => {
    // Hanya dorong iklan jika bukan mode test dan iklan diaktifkan
    if (!isTestMode && enableAds) {
      try {
        if (typeof window !== 'undefined') {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, [isTestMode, enableAds]);

  // 1. TAMPILAN MOCKUP (Di komputer Anda / Localhost)
  if (isTestMode) {
    return (
      <div className="w-full flex justify-center my-6">
        <div className="w-full max-w-3xl h-[100px] md:h-[250px] border-2 border-dashed border-primary/40 bg-primary/5 rounded-xl flex flex-col items-center justify-center text-primary/60 transition-all hover:bg-primary/10">
          <span className="font-bold text-lg tracking-wider uppercase">Ruang Iklan</span>
          <span className="text-xs mt-2 font-mono">Test Mode (Localhost)</span>
          <span className="text-xs font-mono">Slot ID: {dataAdSlot || 'Belum di-set'}</span>
        </div>
      </div>
    );
  }

  // Jika fitur iklan dimatikan dari .env, sembunyikan kotak sepenuhnya
  if (!enableAds || !adClientId) return null;

  // 2. TAMPILAN ASLI (Di Production / Web Live)
  return (
    <div className="w-full flex justify-center my-6 overflow-hidden min-h-[100px]">
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={adClientId} // Mengambil dari .env.local
        data-ad-slot={dataAdSlot}   // Mengambil dari prop (bebas diisi apa saja per posisi)
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}