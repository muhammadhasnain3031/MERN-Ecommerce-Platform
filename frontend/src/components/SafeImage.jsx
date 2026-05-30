import { useState, useEffect } from 'react';

export const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f1f5f9" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" font-size="70" text-anchor="middle" dy=".3em" fill="%2394a3b8"%3E📦%3C/text%3E%3C/svg%3E';

export default function SafeImage({ src, alt = '', style = {}, className = '', ...rest }) {
  const [img, setImg] = useState(PLACEHOLDER);
  useEffect(() => {
    const clean = (src && typeof src === 'string' && src.trim()) || '';
    if (!clean) { setImg(PLACEHOLDER); return; }
    let dead = false;
    const i = new Image();
    i.onload = () => { if (!dead) setImg(clean); };
    i.onerror = () => { if (!dead) setImg(PLACEHOLDER); };
    i.src = clean;
    return () => { dead = true; };
  }, [src]);
  return <img src={img} alt={alt} className={className} style={{ background: '#f1f5f9', ...style }} {...rest} />;
}
