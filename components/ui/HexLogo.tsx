interface HexLogoProps {
  variant?: 'default' | 'white';
  width?: number;
  height?: number;
}

export default function HexLogo({ variant = 'default', width = 32, height = 36 }: HexLogoProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 1L30 9V27L16 35L2 27V9L16 1Z"
        stroke="#C8952C"
        strokeWidth={variant === 'white' ? '1.8' : '2'}
        fill={variant === 'white' ? 'rgba(200,149,44,0.08)' : 'none'}
      />
      <path d="M16 8L24 12.5V21.5L16 26L8 21.5V12.5L16 8Z" fill="#C8952C" opacity="0.15" />
      <text
        x={variant === 'white' ? '11.5' : '11'}
        y={variant === 'white' ? '21.5' : '21'}
        fill="#C8952C"
        fontSize={variant === 'white' ? '10' : '11'}
        fontWeight="bold"
        fontFamily="system-ui"
      >
        P
      </text>
    </svg>
  );
}
