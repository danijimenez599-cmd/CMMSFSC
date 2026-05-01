import React from 'react';

interface BrandingProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const VersaIcon = ({ size = 40, className, ...props }: BrandingProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <title>VersaMaint — Ícono / Engranaje</title>
    <g id="Gear">
      <polygon 
        id="gear-teeth" 
        points="29.24,16.17 33.73,17.27 33.73,22.73 29.24,23.83 31.63,27.75 27.75,31.63 23.83,29.24 22.73,33.73 17.27,33.73 16.17,29.24 12.25,31.63 8.37,27.75 10.76,23.83 6.27,22.73 6.27,17.27 10.76,16.17 8.37,12.25 12.25, 8.37 16.17,10.76 17.27, 6.27 22.73, 6.27 23.83,10.76 27.75, 8.37 31.63,12.25" 
        fill="#1B6FF8"
      />
      <circle id="gear-hole" cx="20" cy="20" r="5.5" fill="#FFFFFF"/>
      <circle id="gear-center" cx="20" cy="20" r="2.2" fill="#00C8B8"/>
    </g>
  </svg>
);

export const VersaLogo = ({ width = 310, height = 72, className, ...props }: BrandingProps) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 310 72" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <title>VersaMaint — Logo Horizontal</title>
    <g id="Symbol-Slash">
      <polygon id="slash-primary" points="0,8 14,8 36,56 22,56" fill="#1B6FF8"/>
      <polygon id="slash-secondary" points="22,8 36,8 58,56 44,56" fill="#1B6FF8" opacity="0.45"/>
      <polygon id="slash-ghost" points="36,8 50,8 28,56 14,56" fill="currentColor" opacity="0.07"/>
    </g>
    <g id="Symbol-Gear" transform="translate(70,36) scale(1.15) translate(-20,-20)">
      <polygon 
        id="gear-teeth" 
        points="29.24,16.17 33.73,17.27 33.73,22.73 29.24,23.83 31.63,27.75 27.75,31.63 23.83,29.24 22.73,33.73 17.27,33.73 16.17,29.24 12.25,31.63 8.37,27.75 10.76,23.83 6.27,22.73 6.27,17.27 10.76,16.17 8.37,12.25 12.25, 8.37 16.17,10.76 17.27, 6.27 22.73, 6.27 23.83,10.76 27.75, 8.37 31.63,12.25" 
        fill="#1B6FF8"
      />
      <circle id="gear-hole" cx="20" cy="20" r="5.5" fill="#FFFFFF"/>
      <circle id="gear-center" cx="20" cy="20" r="2.2" fill="#00C8B8"/>
    </g>
    <g id="Wordmark">
      <text 
        id="brand-name" 
        x="96" 
        y="38" 
        fontFamily="'Space Grotesk', 'Helvetica Neue', Arial, sans-serif" 
        fontWeight="700" 
        fontSize="26" 
        fill="currentColor" 
        letterSpacing="-0.3"
      >
        VersaMaint
      </text>
      <text 
        id="tagline" 
        x="97" 
        y="57" 
        fontFamily="'Space Grotesk', 'Helvetica Neue', Arial, sans-serif" 
        fontWeight="300" 
        fontSize="10" 
        fill="#4B8EFA" 
        letterSpacing="3.5"
      >
        CMMS · INDUSTRIAL
      </text>
    </g>
  </svg>
);
