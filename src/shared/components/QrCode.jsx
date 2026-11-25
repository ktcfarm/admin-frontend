import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode as QrCodeIcon } from 'lucide-react';
import { Button } from './Button.jsx';
import { cn } from '../utils/cn.js';

function triggerDownload(href, filename) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function QrCode({
  value = '',
  size = 180,
  title,
  subtitle,
  fgColor = '#0E4B2E',
  bgColor = '#FFFFFF',
  level = 'M',
  showDownload = false,
  downloadFileName = 'ktc-qr-code.png',
  className = ''
}) {
  const containerRef = useRef(null);

  const handleDownload = () => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement || !value) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const isSvgTarget = downloadFileName.toLowerCase().endsWith('.svg');

    if (isSvgTarget) {
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      triggerDownload(svgUrl, downloadFileName);
      URL.revokeObjectURL(svgUrl);
      return;
    }

    const svgBase64 = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
    const image = new Image();
    image.onload = () => {
      const padding = 24;
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = (size + padding * 2) * scale;
      canvas.height = (size + padding * 2) * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size + padding * 2, size + padding * 2);
      ctx.drawImage(image, padding, padding, size, size);

      const pngUrl = canvas.toDataURL('image/png');
      const normalizedName = downloadFileName.toLowerCase().endsWith('.png')
        ? downloadFileName
        : `${downloadFileName}.png`;
      triggerDownload(pngUrl, normalizedName);
    };
    image.src = svgBase64;
  };

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center text-center rounded-xl border border-gray-200 bg-white p-4 shadow-xs',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-3 max-w-full">
          {title && (
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {title}
            </h4>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5 break-words">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="p-2.5 rounded-lg border border-gray-100 flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        {value ? (
          <QRCodeSVG
            value={value}
            size={size}
            fgColor={fgColor}
            bgColor={bgColor}
            level={level}
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex flex-col items-center justify-center bg-gray-50 text-gray-400 rounded-md gap-2"
          >
            <QrCodeIcon className="w-8 h-8" />
            <span className="text-xs">No QR payload</span>
          </div>
        )}
      </div>

      {showDownload && value && (
        <div className="mt-3 w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={Download}
            onClick={handleDownload}
            className="w-full"
          >
            Download QR
          </Button>
        </div>
      )}
    </div>
  );
}

export default QrCode;
