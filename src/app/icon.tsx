import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 15,
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 900,
          borderRadius: 8,
          border: '1.5px solid #0284c7',
          letterSpacing: '-0.5px',
          fontFamily: 'sans-serif',
          boxShadow: '0 0 8px rgba(2, 132, 199, 0.4)',
        }}
      >
        ODS
      </div>
    ),
    { ...size }
  );
}
