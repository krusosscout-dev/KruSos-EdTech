import React from 'react';

/**
 * Cute Cartoon Student Avatar for Kru Sauce EdTech Suite
 * Renders high-quality, expressive vector cartoon characters (นักเรียนหญิง / นักเรียนชาย)
 * with celebratory accessories according to rank (Rank 1 Crown, Rank 2 Silver, Rank 3 Bronze)
 */
export const StudentCartoonAvatar = ({
  gender = 'ช',
  title = '',
  rank = 1,
  size = 'lg',
  showBadge = false,
  className = ''
}) => {
  // Determine if student is female or male based on gender or Thai title prefix
  const isFemale =
    gender === 'ญ' ||
    gender === 'female' ||
    gender === 'F' ||
    (title && title.includes('ญ'));

  // Size dimensions
  const isSmall = size === 'xs' || size === 'sm';
  const dimensionClass = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-20 h-20',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-28 h-28 sm:w-32 sm:h-32'
  }[size] || 'w-24 h-24 sm:w-28 sm:h-28';

  // Rank-specific styling & aura
  const rankConfig = (!isSmall && {
    1: {
      aura: 'from-amber-400/30 via-yellow-400/20 to-transparent',
      ring: 'ring-4 ring-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.6)]',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950',
      glow: '#fbbf24',
      balloonColor: '#f59e0b'
    },
    2: {
      aura: 'from-slate-300/30 via-slate-400/15 to-transparent',
      ring: 'ring-4 ring-slate-300/70 shadow-[0_0_20px_rgba(203,213,225,0.4)]',
      badgeBg: 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950',
      glow: '#cbd5e1',
      balloonColor: '#94a3b8'
    },
    3: {
      aura: 'from-amber-700/30 via-amber-800/15 to-transparent',
      ring: 'ring-4 ring-amber-600/70 shadow-[0_0_20px_rgba(217,119,6,0.4)]',
      badgeBg: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white',
      glow: '#d97706',
      balloonColor: '#b45309'
    }
  }[rank]) || {
    aura: '',
    ring: isSmall ? 'border border-slate-600 shadow-sm' : 'ring-2 ring-indigo-400/50',
    badgeBg: 'bg-indigo-600 text-white',
    glow: '#818cf8',
    balloonColor: '#6366f1'
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 aspect-square ${dimensionClass} ${className} select-none`}>
      {/* Background Circular Aura Glow (Podium only) */}
      {!isSmall && rankConfig.aura && (
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${rankConfig.aura} blur-md scale-110 pointer-events-none`}
        />
      )}

      {/* Main Avatar Bubble Container */}
      <div
        className={`relative w-full h-full aspect-square rounded-full bg-gradient-to-b from-slate-800 to-slate-900 ${rankConfig.ring} flex items-center justify-center overflow-hidden transition-transform duration-300 group`}
      >
        {/* Sky / Classroom Background inside avatar */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-indigo-950/40 to-slate-900 pointer-events-none" />

        {/* Vector SVG Student Character */}
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Skin Gradient */}
            <linearGradient id={`skinGrad_${rank}_${isFemale}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffeedd" />
              <stop offset="100%" stopColor="#fcd3b6" />
            </linearGradient>

            {/* Hair Gradient */}
            <linearGradient id={`hairGrad_${rank}_${isFemale}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#332520" />
              <stop offset="100%" stopColor="#1e130f" />
            </linearGradient>

            {/* Crown Gold Gradient */}
            <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {isFemale ? (
            /* ========================================================
               👧 CUTE FEMALE STUDENT (นักเรียนหญิง ด.ญ.)
               ======================================================== */
            <g>
              {/* Back Hair (Twin pigtails) */}
              <ellipse cx="28" cy="56" rx="14" ry="20" fill={`url(#hairGrad_${rank}_${isFemale})`} />
              <ellipse cx="92" cy="56" rx="14" ry="20" fill={`url(#hairGrad_${rank}_${isFemale})`} />

              {/* Hair Ribbon Ties */}
              <path
                d="M 24 45 C 18 42, 18 52, 25 50 C 20 54, 28 58, 28 50 Z"
                fill={rank === 1 ? '#fbbf24' : '#f43f5e'}
              />
              <path
                d="M 96 45 C 102 42, 102 52, 95 50 C 100 54, 92 58, 92 50 Z"
                fill={rank === 1 ? '#fbbf24' : '#f43f5e'}
              />

              {/* Shoulders & White Thai School Uniform Shirt */}
              <path
                d="M 28 120 C 30 92, 45 88, 60 88 C 75 88, 90 92, 92 120 Z"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />

              {/* Sailor Collar & Red/Navy Ribbon Tie */}
              <path
                d="M 46 88 L 60 102 L 74 88 L 68 84 L 60 92 L 52 84 Z"
                fill="#3b82f6"
              />
              <circle cx="60" cy="94" r="3.5" fill="#f43f5e" />
              <path d="M 58 96 L 54 108 L 60 105 L 66 108 L 62 96 Z" fill="#f43f5e" />

              {/* Neck */}
              <rect x="53" y="76" width="14" height="14" rx="4" fill={`url(#skinGrad_${rank}_${isFemale})`} />

              {/* Head / Face */}
              <ellipse cx="60" cy="54" rx="28" ry="26" fill={`url(#skinGrad_${rank}_${isFemale})`} />

              {/* Ears */}
              <circle cx="33" cy="55" r="5" fill={`url(#skinGrad_${rank}_${isFemale})`} />
              <circle cx="87" cy="55" r="5" fill={`url(#skinGrad_${rank}_${isFemale})`} />

              {/* Front Bangs Hair */}
              <path
                d="M 33 50 C 33 32, 44 26, 60 26 C 76 26, 87 32, 87 50 C 84 42, 78 38, 70 42 C 64 37, 56 37, 50 42 C 42 38, 36 42, 33 50 Z"
                fill={`url(#hairGrad_${rank}_${isFemale})`}
              />

              {/* Big Expressive Anime Sparkling Eyes */}
              {/* Left Eye */}
              <ellipse cx="49" cy="55" rx="5.5" ry="6.5" fill="#1e1b4b" />
              <circle cx="47.5" cy="53" r="2.2" fill="#ffffff" />
              <circle cx="51" cy="57.5" r="1.2" fill="#ffffff" />
              {/* Eyelash */}
              <path d="M 43 51 Q 48 48 54 51" stroke="#1e1b4b" strokeWidth="1.8" strokeLinecap="round" fill="none" />

              {/* Right Eye */}
              <ellipse cx="71" cy="55" rx="5.5" ry="6.5" fill="#1e1b4b" />
              <circle cx="69.5" cy="53" r="2.2" fill="#ffffff" />
              <circle cx="73" cy="57.5" r="1.2" fill="#ffffff" />
              {/* Eyelash */}
              <path d="M 66 51 Q 72 48 77 51" stroke="#1e1b4b" strokeWidth="1.8" strokeLinecap="round" fill="none" />

              {/* Cute Rosy Cheeks */}
              <ellipse cx="42" cy="61" rx="4.5" ry="2.8" fill="#fb7185" opacity="0.65" />
              <ellipse cx="78" cy="61" rx="4.5" ry="2.8" fill="#fb7185" opacity="0.65" />

              {/* Tiny Cute Nose */}
              <circle cx="60" cy="58" r="1" fill="#f43f5e" opacity="0.5" />

              {/* Cheerful Open Smile */}
              <path
                d="M 54 63 Q 60 70 66 63"
                stroke="#b91c1c"
                strokeWidth="2"
                strokeLinecap="round"
                fill="#f43f5e"
              />

              {/* Eyebrows */}
              <path d="M 44 47 Q 49 44 54 47" stroke="#451a03" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <path d="M 66 47 Q 71 44 76 47" stroke="#451a03" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            /* ========================================================
               👦 CUTE MALE STUDENT (นักเรียนชาย ด.ช.)
               ======================================================== */
            <g>
              {/* Shoulders & White Thai School Uniform Shirt */}
              <path
                d="M 26 120 C 28 92, 44 86, 60 86 C 76 86, 92 92, 94 120 Z"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />

              {/* School Shirt Collar & Button Placket */}
              <path
                d="M 48 86 L 60 98 L 72 86 L 66 83 L 60 90 L 54 83 Z"
                fill="#f1f5f9"
                stroke="#94a3b8"
                strokeWidth="1.2"
              />
              <line x1="60" y1="98" x2="60" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="60" cy="103" r="1.5" fill="#64748b" />
              <circle cx="60" cy="112" r="1.5" fill="#64748b" />

              {/* Neck */}
              <rect x="53" y="74" width="14" height="15" rx="3" fill={`url(#skinGrad_${rank}_${isFemale})`} />

              {/* Head / Face */}
              <ellipse cx="60" cy="53" rx="27" ry="26" fill={`url(#skinGrad_${rank}_${isFemale})`} />

              {/* Ears */}
              <circle cx="34" cy="54" r="5.5" fill={`url(#skinGrad_${rank}_${isFemale})`} />
              <circle cx="86" cy="54" r="5.5" fill={`url(#skinGrad_${rank}_${isFemale})`} />
              <path d="M 34 52 Q 36 54 34 56" stroke="#fca5a5" strokeWidth="1.2" fill="none" />
              <path d="M 86 52 Q 84 54 86 56" stroke="#fca5a5" strokeWidth="1.2" fill="none" />

              {/* Boy Styled Hair (Spiky & Neat bangs) */}
              <path
                d="M 33 50 C 32 30, 42 22, 60 22 C 78 22, 88 30, 87 50 C 85 41, 79 36, 73 40 C 67 33, 61 34, 57 39 C 51 34, 43 35, 39 42 C 35 44, 34 47, 33 50 Z"
                fill={`url(#hairGrad_${rank}_${isFemale})`}
              />
              {/* Hair Tuft highlights */}
              <path d="M 52 24 Q 60 17 68 25" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* Big Expressive Anime Sparkling Eyes */}
              {/* Left Eye */}
              <ellipse cx="49" cy="54" rx="5.2" ry="6.2" fill="#1e1b4b" />
              <circle cx="47.5" cy="52" r="2.2" fill="#ffffff" />
              <circle cx="51" cy="56.5" r="1.2" fill="#ffffff" />

              {/* Right Eye */}
              <ellipse cx="71" cy="54" rx="5.2" ry="6.2" fill="#1e1b4b" />
              <circle cx="69.5" cy="52" r="2.2" fill="#ffffff" />
              <circle cx="73" cy="56.5" r="1.2" fill="#ffffff" />

              {/* Rosy Cheeks */}
              <ellipse cx="42" cy="61" rx="4.5" ry="2.6" fill="#fb923c" opacity="0.6" />
              <ellipse cx="78" cy="61" rx="4.5" ry="2.6" fill="#fb923c" opacity="0.6" />

              {/* Tiny Nose */}
              <circle cx="60" cy="57" r="1" fill="#ea580c" opacity="0.5" />

              {/* Confident Wide Happy Smile */}
              <path
                d="M 53 62 Q 60 70 67 62"
                stroke="#991b1b"
                strokeWidth="2"
                strokeLinecap="round"
                fill="#ef4444"
              />

              {/* Boy Eyebrows */}
              <path d="M 44 46 Q 49 43 55 46" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M 65 46 Q 71 43 76 46" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* ========================================================
             👑 RANK 1: SHINING GOLDEN CHAMPION CROWN
             ======================================================== */}
          {rank === 1 && (
            <g className="animate-pulse">
              {/* Golden Crown */}
              <path
                d="M 42 22 L 46 32 L 60 25 L 74 32 L 78 22 L 72 36 L 48 36 Z"
                fill="url(#crownGrad)"
                stroke="#b45309"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Crown Jewels / Pearls */}
              <circle cx="42" cy="22" r="2.5" fill="#ef4444" />
              <circle cx="60" cy="25" r="3" fill="#3b82f6" />
              <circle cx="78" cy="22" r="2.5" fill="#ef4444" />
              <circle cx="60" cy="33" r="2" fill="#ffffff" />
            </g>
          )}

          {/* ========================================================
             🥈 RANK 2: SILVER STAR / RIBBON
             ======================================================== */}
          {rank === 2 && (
            <g>
              <circle cx="78" cy="30" r="7" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
              <path
                d="M 78 25 L 79.5 28.5 L 83 29 L 80.5 31.5 L 81 35 L 78 33 L 75 35 L 75.5 31.5 L 73 29 L 76.5 28.5 Z"
                fill="#38bdf8"
              />
            </g>
          )}

          {/* ========================================================
             🥉 RANK 3: BRONZE STAR / BADGE
             ======================================================== */}
          {rank === 3 && (
            <g>
              <circle cx="78" cy="30" r="7" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
              <path
                d="M 78 25 L 79.5 28.5 L 83 29 L 80.5 31.5 L 81 35 L 78 33 L 75 35 L 75.5 31.5 L 73 29 L 76.5 28.5 Z"
                fill="#fef08a"
              />
            </g>
          )}
        </svg>
      </div>

      {/* For Rank 1: Floating 3D Crown above head (Podium only) */}
      {rank === 1 && !isSmall && (
        <div className="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce">
          <span className="text-2xl sm:text-3xl filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.9)]">
            👑
          </span>
        </div>
      )}

      {/* Optional Rank Indicator Badge (Without #) */}
      {showBadge && (
        <div
          className={`absolute -bottom-1 -right-1 ${rankConfig.badgeBg} text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-lg border border-white/30 flex items-center gap-0.5 select-none`}
        >
          {rank === 1 && <span>⭐ ชนะเลิศ</span>}
          {rank === 2 && <span>✨ รองอันดับ 1</span>}
          {rank === 3 && <span>👍 รองอันดับ 2</span>}
        </div>
      )}
    </div>
  );
};
