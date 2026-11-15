import React from 'react';

interface BrainToothLineArtIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * High-End Luxury Line-Art Icon:
 * Human brain hemisphere seamlessly merging with an anatomical molar tooth.
 * Fine-lined minimalist stroke in clean, elegant off-white/cream (#FAF8F3)
 * with subtle embossed depth for a premium medical-tech aesthetic.
 */
export const BrainToothLineArtIcon: React.FC<BrainToothLineArtIconProps> = ({
  className = 'w-8 h-8',
  style,
  ...props
}) => {
  return (
    <svg
      viewBox="98 88 316 354"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        background: 'transparent',
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Elegant Off-White / Cream Enamel Gradient */}
        <linearGradient id="creamStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FAF8F3" />
          <stop offset="100%" stopColor="#F0E8D8" />
        </linearGradient>

        {/* Soft Brushed Gold Accent Gradient */}
        <linearGradient id="goldSynapseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8E7" />
          <stop offset="50%" stopColor="#E9D18A" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>

        {/* Subtle Embossed 3D Drop Filter */}
        <filter id="embossedDepth" x="-15%" y="-15%" width="130%" height="135%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#1E2812" floodOpacity="0.5" />
          <feDropShadow dx="0" dy="-0.5" stdDeviation="0.4" floodColor="#FFFFFF" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter="url(#embossedDepth)">
        {/* Subtle translucent anatomical molar silhouette body */}
        <path
          d="M256,104
             C284,104 316,112 344,124
             C376,138 396,168 396,204
             C396,236 384,268 372,298
             C358,332 344,368 336,406
             C332,424 318,432 300,432
             C282,432 272,416 270,396
             C266,356 260,332 256,332
             C252,332 246,356 242,396
             C240,416 230,432 212,432
             C194,432 180,424 176,406
             C168,368 154,332 140,298
             C128,268 116,236 116,204
             C116,168 136,138 168,124
             C196,112 228,104 256,104 Z"
          fill="white"
          fillOpacity="0.14"
          stroke="url(#creamStrokeGrad)"
          strokeWidth="9.5"
          strokeLinejoin="round"
        />

        {/* Left Side: Neural Brain Gyri Line Art (Cerebral Cortex Hemispheres) */}
        <path
          d="M250,118
             C214,116 172,130 152,156
             C136,176 132,204 140,228
             C146,248 162,264 176,280
             C190,296 200,314 204,334"
          fill="none"
          stroke="url(#creamStrokeGrad)"
          strokeWidth="10.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M208,124
             C188,140 178,166 182,192
             C186,216 208,230 228,232
             C244,234 252,246 250,260
             C248,276 234,290 220,296"
          fill="none"
          stroke="url(#creamStrokeGrad)"
          strokeWidth="9.5"
          strokeLinecap="round"
        />

        <path
          d="M148,198
             C164,198 184,204 196,214
             C208,224 212,244 206,260
             C200,274 184,284 170,292"
          fill="none"
          stroke="url(#creamStrokeGrad)"
          strokeWidth="9"
          strokeLinecap="round"
        />

        <path
          d="M234,142
             C242,152 246,168 244,182
             C242,196 230,206 216,206"
          fill="none"
          stroke="url(#creamStrokeGrad)"
          strokeWidth="8.5"
          strokeLinecap="round"
        />

        {/* Central Cerebral Fissure / Meridian Fusion Axis */}
        <path
          d="M256,110 L256,330"
          fill="none"
          stroke="url(#creamStrokeGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="4 6"
          strokeOpacity="0.85"
        />

        {/* Right Side: Anatomical Molar Crown Contour & Occlusal Fissures */}
        <path
          d="M256,128
             C284,134 322,148 348,172
             C368,192 374,216 368,242
             C360,272 344,302 334,332
             C324,360 316,390 312,414"
          fill="none"
          stroke="url(#creamStrokeGrad)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        <path
          d="M280,188
             C302,192 334,206 342,228
             C348,246 338,266 322,274
             C306,282 292,278 280,266
             C268,254 268,236 274,218"
          fill="none"
          stroke="url(#creamStrokeGrad)"
          strokeWidth="9"
          strokeLinecap="round"
        />

        <path
          d="M294,248
             C312,254 330,272 328,296
             C326,316 308,332 290,336"
          fill="none"
          stroke="url(#creamStrokeGrad)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Dual Tooth Apex Root Canals */}
        <path
          d="M192,382 C196,400 200,414 204,422"
          fill="none"
          stroke="url(#creamStrokeGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <path
          d="M320,382 C316,400 312,414 308,422"
          fill="none"
          stroke="url(#creamStrokeGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />

        {/* Neural Synapse Nodes (Brushed Gold Accent Nodes) */}
        <circle cx="152" cy="156" r="6" fill="url(#goldSynapseGrad)" stroke="#FFFFFF" strokeWidth="1.8" />
        <circle cx="182" cy="192" r="5.5" fill="url(#goldSynapseGrad)" stroke="#FFFFFF" strokeWidth="1.8" />
        <circle cx="140" cy="228" r="6" fill="url(#goldSynapseGrad)" stroke="#FFFFFF" strokeWidth="1.8" />
        <circle cx="206" cy="260" r="5.5" fill="url(#goldSynapseGrad)" stroke="#FFFFFF" strokeWidth="1.8" />
        <circle cx="228" cy="232" r="5.5" fill="url(#goldSynapseGrad)" stroke="#FFFFFF" strokeWidth="1.8" />
        <circle cx="176" cy="280" r="5.5" fill="url(#goldSynapseGrad)" stroke="#FFFFFF" strokeWidth="1.8" />

        {/* Clean Clinical Sparkle on Tooth Cusp (Top Right) */}
        <g transform="translate(346, 126)">
          <path
            d="M0,-20
               C1,-8 8,-1 20,0
               C8,1 1,8 0,20
               C-1,8 -8,1 -20,0
               C-8,-1 -1,-8 0,-20 Z"
            fill="url(#creamStrokeGrad)"
          />
          <circle cx="0" cy="0" r="3.5" fill="url(#goldSynapseGrad)" />
        </g>
      </g>
    </svg>
  );
};
