"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

type Banner = {
  id?: number | string;
  attributes?: {
    title?: string;
    url?: string;
    image?: { data?: { attributes?: { url?: string } } } | { url?: string };
    type?: 'affiliate' | 'ad' | string;
    width?: number;
    height?: number;
  }
}

type Props = {
  position?: 'top' | 'between' | 'sidebar' | 'footer' | 'affiliate'
}

export default function BannerSlots({ position = 'top' }: Props) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const ENV = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || '';
  const STRAPI = (() => {
    const prd = process.env.NEXT_PUBLIC_STRAPI_PRD?.replace(/\/admin$/, '').replace(/\/$/, '');
    const dev = process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, '');
    // Prefer PRD when on a secure origin or when explicitly in production env
    if (typeof window !== 'undefined') {
      if (window.location.protocol === 'https:' && prd) return prd;
    }
    if (ENV === 'production' && prd) return prd;
    return dev || '';
  })();

  const ENABLE_BANNERS = (process.env.NEXT_PUBLIC_ENABLE_BANNERS || 'false') === 'true';

  useEffect(() => {
    let mounted = true;
    const fetchBanners = async () => {
      if (!ENABLE_BANNERS) return; // disabled via env
      if (!STRAPI) return;
      try {
        const url = `${STRAPI.replace(/\/$/, '')}/api/banners?populate=*`;
        const headers: Record<string,string> = {};
        const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_PRD_TOKEN || '';
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`fetch banners failed: ${res.status}`);
        const json = await res.json();
        const data = json.data || [];
        if (mounted) setBanners(data);
      } catch (err) {
        // log to console for easier debugging in the browser
        // eslint-disable-next-line no-console
        console.error('BannerSlots: failed to fetch banners:', err);
      }
    }
    fetchBanners();
    return () => { mounted = false };
  }, [STRAPI]);

  const renderImage = (b: Banner, fallbackText: string, w: string | number = '100%', h: string | number = 'auto') => {
    try {
      const image = b.attributes?.image;
      const raw =
        (image && 'data' in image && image.data?.attributes?.url) ||
        (image && 'url' in image && image.url) ||
        null;
      if (!raw) {
        return (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: typeof h === 'number' ? `${h}px` : h, color: '#fff' }}>{fallbackText}</div>);
      }
      const src = raw.startsWith('http') ? raw : `${STRAPI?.replace(/\/$/, '')}${raw}`;

      // If we have numeric dimensions, use Next Image with width/height
      const numericW = typeof w === 'number' ? w : (b.attributes?.width || null);
      const numericH = typeof h === 'number' ? h : (b.attributes?.height || null);

      if (numericW && numericH) {
        return (
          <div style={{ width: numericW, height: numericH, position: 'relative' }}>
            <Image src={src} alt={b.attributes?.title || 'banner'} width={Number(numericW)} height={Number(numericH)} style={{ objectFit: 'cover' }} unoptimized />
          </div>
        );
      }

      // Fallback to a simple img when dimensions are not reliable
      return (
        <div style={{ width: typeof w === 'number' ? `${w}px` : w, height: typeof h === 'number' ? `${h}px` : h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={src} alt={b.attributes?.title || 'banner'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
        </div>
      );
    } catch (e) {
      return (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: typeof h === 'number' ? `${h}px` : h, color: '#fff' }}>{fallbackText}</div>);
    }
  }

  // Filter banners by type if available, else fallback by position
  const getForPosition = () => {
    if (banners.length === 0) return null;
    if (position === 'sidebar') return banners.find(b => b.attributes?.type === 'sidebar' || b.attributes?.type === 'ad') || banners[0];
    if (position === 'affiliate') return banners.filter(b => b.attributes?.type === 'affiliate');
    if (position === 'top') return banners.filter(b => b.attributes?.type === 'leaderboard' || b.attributes?.type === 'top');
    if (position === 'between') return banners.find(b => b.attributes?.type === 'medium') || banners[0];
    if (position === 'footer') return banners.find(b => b.attributes?.type === 'footer') || banners[0];
    return null;
  }

  const slot = getForPosition();

  // Render
  return (
    <div className={`banner-slot banner-${position}`}>
      {/* If banner(s) fetched from Strapi, render them */}
      {banners.length > 0 ? (
        position === 'affiliate' ? (
          <div className="affiliate-row">
            {Array.isArray(slot) ? slot.map((b:any) => (
              <a key={b.id} href={b.attributes?.url || '#'} target="_blank" rel="noopener noreferrer" className="aff-link">
                {renderImage(b, b.attributes?.title || 'Affiliate', 140, 60)}
              </a>
            )) : (slot ? (
              <a href={slot.attributes?.url || '#'} target="_blank" rel="noopener noreferrer">{renderImage(slot, slot.attributes?.title || 'Affiliate', 140, 60)}</a>
            ) : null)}
          </div>
        ) : (
          // single banner
          (slot && !Array.isArray(slot)) ? (
            <a href={slot.attributes?.url || '#'} target="_blank" rel="noopener noreferrer" className="banner-single">
              {renderImage(slot, slot.attributes?.title || 'Banner', position === 'sidebar' ? 300 : '100%', position === 'sidebar' ? 600 : (position === 'top' ? 92 : 260))}
            </a>
          ) : (
            // fallback placeholders
            <div className="leaderboard">{position === 'top' ? 'Leaderboard (728x90)' : (position === 'sidebar' ? 'Sidebar (300x600)' : 'Banner')}</div>
          )
        )
      ) : (
        // no banners loaded yet: show placeholders
        position === 'top' ? (
          <>
            <div className="leaderboard">Leaderboard (728x90) - Espacio publicitario</div>
            <div className="affiliate-row">
              <div className="aff">BetOne</div>
              <div className="aff">Betano</div>
              <div className="aff">Partner</div>
            </div>
          </>
        ) : position === 'sidebar' ? (
          <div className="sidebar">Sidebar Banner (300x600) - Afiliado</div>
        ) : position === 'between' ? (
          <div className="medium">Banner Mediano (300x250) - Venta / Afiliado</div>
        ) : (
          <div className="footer">Footer Banner (970x90) - Espacio publicitario</div>
        )
      )}

      <style jsx>{`
        .banner-slot{width:100%;display:block;margin:18px 0}
        .leaderboard{height:92px;background:linear-gradient(90deg,#1b223e,#0d1124);border:1px dashed rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;border-radius:8px}
        .affiliate-row{display:flex;gap:12px;justify-content:center;margin-top:10px}
        .aff{background:rgba(255,255,255,0.06);padding:8px 14px;border-radius:8px;color:#fff;font-weight:600}
        .medium{height:260px;background:linear-gradient(180deg,#0f1530,#151931);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;border:1px dashed rgba(255,255,255,0.05)}
        .sidebar{height:600px;background:linear-gradient(180deg,#091124,#0f1630);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;border:1px dashed rgba(255,255,255,0.05)}
        .footer{height:90px;background:linear-gradient(90deg,#0b122b,#10142b);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;border:1px dashed rgba(255,255,255,0.05)}
        .banner-single{display:block}
        .aff-link{display:block}

        @media (max-width:900px){
          .leaderboard{height:80px}
          .medium{height:140px}
          .sidebar{height:180px}
          .aff{padding:6px 10px;font-size:0.9rem}
        }
      `}</style>
    </div>
  );
}
