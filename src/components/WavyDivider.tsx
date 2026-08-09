// src/components/WavyDivider.tsx
import React from 'react';

export const WavyDivider: React.FC = () => {
  return (
    <div className="hidden md:block absolute -top-16 right-[-8.5vw] bottom-0 w-[9vw] h-[calc(100%+4rem)] pointer-events-none z-30 overflow-hidden">
      <svg
        className="h-full w-full"
        viewBox="0 0 100 1200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Layer 4 (BACKMOST): Outer Soft Edge */}
        <path
          d="M0,0 
             C 50,25   80,45   80,80 
             C 80,105  45,130  45,150 
             C 45,200  95,230  95,310 
             C 95,380  55,430  55,510 
             C 55,590 100,640 100,720 
             C 100,800 60,850  60,930 
             C 60,1010 100,1060 100,1140 
             C 100,1175 65,1195 0,1200 
             L0,0 Z"
          fill="#94A3B8"
          opacity="0.25"
        />

        {/* Layer 3: Light Blue/Grey Translucent Step */}
        <path
          d="M0,0 
             C 40,22  65,40  65,72 
             C 65,95  35,120 35,140 
             C 35,185 80,215 80,290 
             C 80,360 40,410 40,490 
             C 40,570 85,620 85,700 
             C 85,780 45,830 45,910 
             C 45,990 90,1040 90,1120 
             C 90,1165 50,1190 0,1200 
             L0,0 Z"
          fill="#5E6470"
          opacity="0.45"
        />

        {/* Layer 2: Deep Blue Translucent Step */}
        <path
          d="M0,0 
             C 30,20  50,38  50,68 
             C 50,90  25,110 25,130 
             C 25,175 65,200 65,275 
             C 65,345 25,395 25,475 
             C 25,555 70,605 70,685 
             C 70,765 30,815 30,895 
             C 30,975 75,1025 75,1105 
             C 75,1155 35,1185 0,1200 
             L0,0 Z"
          fill="#172B66"
          opacity="0.75"
        />

        {/* Layer 1 (FRONTMOST): Solid Navy Base */}
        <path
          d="M0,0 
             C 20,18  35,35  35,62 
             C 35,82  10,100 10,120 
             C 10,165 45,190 45,260 
             C 45,330 10,380 10,460 
             C 10,540 50,590 50,670 
             C 50,750 15,800 15,880 
             C 15,960 55,1010 55,1090 
             C 55,1145 20,1175 0,1200 
             L0,0 Z"
          fill="#021438"
        />
      </svg>
    </div>
  );
};