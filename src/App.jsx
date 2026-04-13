import { useState, useEffect, useRef, useCallback } from 'react'

// ─────────────────────────────────────────────
// VIEWPORT SCALING — makes the scene fit any screen
// Design reference: 1440 × 810
// ─────────────────────────────────────────────
function useViewport() {
  const get = () => ({
    scale:   Math.min(1, window.innerWidth / 1440, window.innerHeight / 810),
    // only flag portrait on small screens (real mobile), not narrow desktop windows
    portrait: window.innerHeight > window.innerWidth && window.innerWidth < 1024,
  })
  const [v, setV] = useState(get)
  useEffect(() => {
    const onResize = () => setV(get())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return v
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const MAX_CIG_PUFFS = 88 // puffs before cig is done

const WEIRD_MESSAGES = [
  'DOG SMEALE PAE PAE',
  'SCABIES IS MY FRIEND',
  'UNCLE JACK NEEDS HELP WITH THE HORSE LATER',
  'ClOUDS ARE FAKE',
  'MOTH VOMIT',
  'I NEED OTHER CHEMICALS TOO',
  'HEHE',
  'I AM HAPPI',
  'WEEEEENUS',
  "I'M SCARED OF ALMOST EVERYTHING",
  'SHOULD WASH MY NECK',
  'FEELING WACKY',
  'LIPS',
  "I'M GLAD I PUSHED THAT POLICEMIN INTO THAT VOLCANO",
  "Up'ere",
  'MY BONES ARE FREEZING',
  "I'M SHAVED I'M READY FOR BATTLE",
  'CAVE OF WINDS 2 COMES OUT TONIGHT',
]

const MILESTONE_MSGS = {
  10:  '>>> THEY NOTICED YOU <<<',
  25:  '>>> SIGNAL ACQUIRED <<<',
  50:  '>>> FULL TRANSMISSION <<<',
  75:  '>>> YOU ARE FREQUENCY <<<',
}

// ─────────────────────────────────────────────
// SMOKE PARTICLE
// ─────────────────────────────────────────────
function SmokeParticle({ x, y, big, onDone }) {
  const size   = big ? Math.random() * 18 + 10 : Math.random() * 8 + 4
  const drift  = (Math.random() - 0.5) * (big ? 100 : 50)
  const dur    = big ? 2.8 : 2.2
  const delay  = Math.random() * 0.3

  useEffect(() => {
    const t = setTimeout(onDone, (dur + delay) * 1000 + 100)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line

  return (
    <div
      style={{
        position: 'fixed',
        left:  x - size / 2,
        top:   y - size / 2,
        width: size,
        height: size,
        background: `rgba(210,210,210,${(Math.random() * 0.35 + 0.25).toFixed(2)})`,
        imageRendering: 'pixelated',
        animation: `smokeRise ${dur}s ease-out ${delay}s forwards`,
        '--drift': `${drift}px`,
        pointerEvents: 'none',
        zIndex: 15,
      }}
    />
  )
}

// ─────────────────────────────────────────────
// HAND — 3D SVG with bezier curves + gradients
// ─────────────────────────────────────────────
// SVG viewBox 400×640, displayed at 400px wide.
// Cigarette centre-line: x=168, tip at y=28, filter at y=262.
// Ember screen offset: vw/2 - 32,  vh - 460
function Hand({ handPhase, puffCount, onClick }) {
  const isInhaling = handPhase === 'inhale'
  const burnFrac = Math.min(puffCount / MAX_CIG_PUFFS, 1)
  // Visible cig body = tip(y28) → filter(y262) = 234px total
  const ashLen  = burnFrac * 180          // ash grows from tip downward
  const bodyY   = 28 + ashLen             // white body starts here
  const bodyLen = Math.max(0, 234 - ashLen) // remaining white

  const animStyle =
    handPhase === 'inhale'  ? { animation: 'handInhale 0.38s ease-out forwards' } :
    handPhase === 'return'  ? { animation: 'handReturn 1.2s cubic-bezier(0.22,1,0.36,1) forwards' } :
    { animation: 'handBob 3s ease-in-out infinite' }

  return (
    <div style={{
      position: 'fixed',
      bottom: '-150px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '400px',
      pointerEvents: 'auto',
      cursor: 'crosshair',
      zIndex: 25,
      filter: 'contrast(1.08) saturate(0.88)',
      ...animStyle,
    }} onClick={onClick}>
      <svg width="400" height="640" viewBox="0 0 400 640" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          {/* ── Skin tone gradients — left=highlight, right=shadow ── */}
          <linearGradient id="gFront" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#f8cc96" />
            <stop offset="28%"  stopColor="#e8a868" />
            <stop offset="62%"  stopColor="#c07840" />
            <stop offset="100%" stopColor="#854018" />
          </linearGradient>
          <linearGradient id="gMid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#edb878" />
            <stop offset="30%"  stopColor="#d09050" />
            <stop offset="68%"  stopColor="#a86030" />
            <stop offset="100%" stopColor="#6c3010" />
          </linearGradient>
          <linearGradient id="gBack" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#d49860" />
            <stop offset="40%"  stopColor="#b07038" />
            <stop offset="100%" stopColor="#6a2e08" />
          </linearGradient>
          <linearGradient id="gThumb" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%"   stopColor="#f0c080" />
            <stop offset="35%"  stopColor="#d08848" />
            <stop offset="100%" stopColor="#7a3810" />
          </linearGradient>
          <linearGradient id="gPalm" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%"   stopColor="#d89058" />
            <stop offset="35%"  stopColor="#b87040" />
            <stop offset="70%"  stopColor="#986030" />
            <stop offset="100%" stopColor="#6e3810" />
          </linearGradient>
          {/* Cigarette */}
          <linearGradient id="gCigW" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#fafaf0" />
            <stop offset="45%"  stopColor="#f2f0e0" />
            <stop offset="80%"  stopColor="#d8d4c0" />
            <stop offset="100%" stopColor="#b8b498" />
          </linearGradient>
          <linearGradient id="gFilter" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#eeaa44" />
            <stop offset="50%"  stopColor="#c88020" />
            <stop offset="100%" stopColor="#8c5000" />
          </linearGradient>
          <linearGradient id="gAsh" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#dddddd" />
            <stop offset="55%"  stopColor="#aaaaaa" />
            <stop offset="100%" stopColor="#888888" />
          </linearGradient>
          <linearGradient id="gNail" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#f8e8cc" stopOpacity="0.88"/>
            <stop offset="60%"  stopColor="#e0c898" stopOpacity="0.65"/>
            <stop offset="100%" stopColor="#c8a878" stopOpacity="0.40"/>
          </linearGradient>
          {/* Drop shadow on whole hand */}
          <filter id="handShadow" x="-15%" y="-10%" width="135%" height="130%">
            <feDropShadow dx="5" dy="8" stdDeviation="7" floodColor="#00000060"/>
          </filter>
          {/* Soft inter-finger shadow */}
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="2.5"/>
          </filter>
        </defs>

        <g filter="url(#handShadow)">

          {/* ══════════════════════════════════
              PALM — back of hand, dorsal view
          ══════════════════════════════════ */}
          <path fill="url(#gPalm)"
            d="M 90 348
               C 82 395 78 445 80 498
               C 81 548 86 595 94 640
               L 320 640
               C 326 595 329 548 328 498
               C 329 445 325 395 316 348
               C 292 332 262 324 235 321
               C 208 318 178 318 158 321
               C 135 325 108 336 90 348 Z"/>

          {/* Palm highlight ridge (knuckle row) */}
          <path fill="none" stroke="#f0b868" strokeWidth="1.8" strokeOpacity="0.35"
            d="M 95 340 Q 140 322 190 318 Q 232 316 272 324 Q 304 330 318 342"/>

          {/* Wrist tendon lines */}
          <path fill="none" stroke="#7a3810" strokeWidth="1.4" strokeOpacity="0.32"
            d="M 158 600 Q 160 510 162 460"/>
          <path fill="none" stroke="#7a3810" strokeWidth="1.4" strokeOpacity="0.28"
            d="M 205 610 Q 206 515 207 462"/>
          <path fill="none" stroke="#7a3810" strokeWidth="1.2" strokeOpacity="0.25"
            d="M 252 605 Q 251 515 250 462"/>

          {/* ══════════ PINKY ══════════ */}
          <path fill="url(#gBack)"
            d="M 261 350
               C 257 322 255 286 256 256
               C 257 230 260 208 265 194
               Q 271 182 278 185
               Q 285 189 286 203
               C 287 222 285 248 283 272
               C 281 304 279 330 278 350 Z"/>
          {/* Pinky nail */}
          <path fill="url(#gNail)"
            d="M 266 197 Q 272 183 278 186 Q 284 190 284 202 Q 280 190 270 191 Z"/>
          {/* Pinky knuckle shadows */}
          <ellipse cx="270" cy="278" rx="10" ry="4.5" fill="#6a2e08" fillOpacity="0.28"/>
          <ellipse cx="267" cy="233" rx="9"  ry="4"   fill="#6a2e08" fillOpacity="0.22"/>

          {/* ══════════ RING FINGER ══════════ */}
          <path fill="url(#gMid)"
            d="M 212 348
               C 210 316 209 272 210 232
               C 211 194 215 160 223 135
               Q 230 118 238 120
               Q 247 124 249 140
               C 251 162 250 200 250 238
               C 249 278 248 320 248 348 Z"/>
          {/* Ring nail */}
          <path fill="url(#gNail)"
            d="M 224 139 Q 230 119 238 121 Q 246 125 248 140 Q 244 127 231 126 Z"/>
          {/* Ring knuckle */}
          <ellipse cx="231" cy="250" rx="11" ry="5"   fill="#6a2e08" fillOpacity="0.28"/>
          <ellipse cx="228" cy="194" rx="10" ry="4.5" fill="#6a2e08" fillOpacity="0.22"/>
          <ellipse cx="225" cy="152" rx="9"  ry="4"   fill="#6a2e08" fillOpacity="0.18"/>

          {/* ══════════ THUMB (left side) ══════════ */}
          <path fill="url(#gThumb)"
            d="M 94 380
               C 82 362 74 336 70 308
               C 67 286 68 266 74 252
               Q 82 240 93 244
               C 104 250 110 270 113 296
               C 116 322 114 355 110 380 Z"/>
          {/* Thumb nail */}
          <path fill="url(#gNail)"
            d="M 75 256 Q 83 241 93 244 Q 102 249 104 262 Q 98 249 82 251 Z"/>
          {/* Thumb knuckle */}
          <ellipse cx="93" cy="330" rx="10" ry="4.5" fill="#6a2e08" fillOpacity="0.22"/>

          {/* ══════════ CIGARETTE ══════════ */}
          {/* Ash (burned portion, grows from tip) */}
          {ashLen > 1 && (
            <rect x="161" y="28" width="14" height={ashLen}
              fill="url(#gAsh)" rx="1"/>
          )}
          {/* White body */}
          {bodyLen > 1 && (
            <rect x="161" y={bodyY} width="14" height={bodyLen}
              fill="url(#gCigW)" rx="1"/>
          )}
          {/* Paper edge line for realism */}
          {bodyLen > 1 && (
            <line x1="162" y1={bodyY} x2="162" y2={bodyY + bodyLen}
              stroke="#c8c4a8" strokeWidth="0.8" strokeOpacity="0.6"/>
          )}
          {/* Filter */}
          <rect x="160" y="262" width="16" height="52" fill="url(#gFilter)" rx="1.5"/>
          <line x1="160" y1="262" x2="176" y2="262" stroke="#f0b840" strokeWidth="1.5"/>

          {/* ══════════ MIDDLE FINGER (right of cig) ══════════ */}
          <path fill="url(#gFront)"
            d="M 183 344
               C 180 312 179 264 180 220
               C 181 178 185 140 192 106
               Q 198 80 207 78
               Q 216 77 221 94
               C 225 116 224 156 222 200
               C 221 240 219 292 218 344 Z"/>
          {/* Middle nail */}
          <path fill="url(#gNail)"
            d="M 193 110 Q 199 81 207 78 Q 215 78 220 94 Q 215 81 201 83 Z"/>
          {/* Middle knuckle shadows */}
          <ellipse cx="200" cy="242" rx="12" ry="5.5" fill="#7a3010" fillOpacity="0.28"/>
          <ellipse cx="197" cy="178" rx="11" ry="5"   fill="#7a3010" fillOpacity="0.22"/>
          <ellipse cx="194" cy="134" rx="10" ry="4.5" fill="#7a3010" fillOpacity="0.18"/>

          {/* ══════════ INDEX FINGER (left of cig) ══════════ */}
          <path fill="url(#gFront)"
            d="M 116 340
               C 113 308 112 260 113 216
               C 114 175 118 138 126 108
               Q 132 85 141 83
               Q 151 82 155 98
               C 159 120 159 160 157 204
               C 156 246 153 298 151 340 Z"/>
          {/* Index nail */}
          <path fill="url(#gNail)"
            d="M 127 112 Q 133 86 141 83 Q 150 83 154 98 Q 149 85 136 87 Z"/>
          {/* Index knuckle shadows */}
          <ellipse cx="135" cy="234" rx="12" ry="5.5" fill="#7a3010" fillOpacity="0.30"/>
          <ellipse cx="132" cy="170" rx="11" ry="5"   fill="#7a3010" fillOpacity="0.24"/>
          <ellipse cx="129" cy="128" rx="10" ry="4.5" fill="#7a3010" fillOpacity="0.18"/>

          {/* ══════════ INTER-FINGER WEB SHADOWS ══════════ */}
          <path fill="#6a2e08" fillOpacity="0.18"
            d="M 218 344 L 212 348 L 214 334 Q 216 330 220 334 Z"/>
          <path fill="#6a2e08" fillOpacity="0.15"
            d="M 248 348 L 261 350 L 263 337 Q 256 332 247 337 Z"/>

          {/* ══════════ KNUCKLE HIGHLIGHTS ══════════ */}
          <ellipse cx="136" cy="332" rx="14" ry="5"   fill="#7a3010" fillOpacity="0.32"/>
          <ellipse cx="200" cy="328" rx="15" ry="5.5" fill="#7a3010" fillOpacity="0.30"/>
          <ellipse cx="231" cy="334" rx="13" ry="5"   fill="#7a3010" fillOpacity="0.26"/>
          <ellipse cx="268" cy="342" rx="11" ry="4.5" fill="#7a3010" fillOpacity="0.22"/>

          {/* Dorsal vein arcs */}
          <path fill="none" stroke="#8a3c14" strokeWidth="1.3" strokeOpacity="0.25"
            d="M 134 332 Q 138 420 141 500"/>
          <path fill="none" stroke="#8a3c14" strokeWidth="1.3" strokeOpacity="0.22"
            d="M 200 328 Q 202 418 204 500"/>
          <path fill="none" stroke="#8a3c14" strokeWidth="1.1" strokeOpacity="0.20"
            d="M 230 332 Q 231 420 232 500"/>

          {/* ══════════ HAND HAIR ══════════ */}
          <g fill="none" stroke="#4a2006" strokeLinecap="round">
            {/* ── palm / metacarpal — thick bushy coverage ── */}
            <path strokeWidth="1.2" strokeOpacity="0.42" d="M 140 396 Q 143 379 140 364"/>
            <path strokeWidth="1.0" strokeOpacity="0.36" d="M 148 410 Q 151 392 149 376"/>
            <path strokeWidth="1.1" strokeOpacity="0.38" d="M 156 400 Q 159 382 157 366"/>
            <path strokeWidth="0.9" strokeOpacity="0.32" d="M 163 415 Q 165 397 164 381"/>
            <path strokeWidth="1.2" strokeOpacity="0.40" d="M 171 404 Q 174 385 172 369"/>
            <path strokeWidth="1.0" strokeOpacity="0.34" d="M 179 418 Q 182 400 180 384"/>
            <path strokeWidth="0.8" strokeOpacity="0.28" d="M 186 407 Q 188 391 187 376"/>
            <path strokeWidth="1.1" strokeOpacity="0.38" d="M 196 412 Q 199 394 197 378"/>
            <path strokeWidth="1.0" strokeOpacity="0.35" d="M 207 402 Q 210 384 208 368"/>
            <path strokeWidth="0.9" strokeOpacity="0.31" d="M 216 416 Q 219 398 217 382"/>
            <path strokeWidth="1.1" strokeOpacity="0.37" d="M 224 406 Q 227 388 225 373"/>
            <path strokeWidth="1.0" strokeOpacity="0.33" d="M 233 418 Q 236 400 234 384"/>
            <path strokeWidth="0.9" strokeOpacity="0.30" d="M 242 405 Q 245 388 243 372"/>
            <path strokeWidth="1.0" strokeOpacity="0.34" d="M 251 412 Q 253 395 252 379"/>
            <path strokeWidth="0.8" strokeOpacity="0.28" d="M 260 400 Q 262 385 261 370"/>
            <path strokeWidth="1.1" strokeOpacity="0.36" d="M 268 414 Q 270 398 269 382"/>
            {/* wiry strays that go the wrong way (very trashy) */}
            <path strokeWidth="0.8" strokeOpacity="0.30" d="M 152 388 Q 147 375 150 362"/>
            <path strokeWidth="0.7" strokeOpacity="0.25" d="M 220 396 Q 215 382 218 369"/>
            <path strokeWidth="0.9" strokeOpacity="0.28" d="M 244 390 Q 248 378 245 366"/>
            {/* ── index finger — hairs all the way up ── */}
            <path strokeWidth="1.0" strokeOpacity="0.34" d="M 125 312 Q 128 299 126 286"/>
            <path strokeWidth="0.9" strokeOpacity="0.30" d="M 133 318 Q 136 305 134 292"/>
            <path strokeWidth="0.8" strokeOpacity="0.26" d="M 141 310 Q 143 298 142 285"/>
            <path strokeWidth="0.9" strokeOpacity="0.28" d="M 128 270 Q 131 258 129 246"/>
            <path strokeWidth="0.7" strokeOpacity="0.22" d="M 136 275 Q 138 263 137 250"/>
            <path strokeWidth="0.8" strokeOpacity="0.24" d="M 143 268 Q 145 257 144 245"/>
            <path strokeWidth="0.7" strokeOpacity="0.20" d="M 131 234 Q 133 224 132 213"/>
            {/* ── middle finger ── */}
            <path strokeWidth="1.0" strokeOpacity="0.32" d="M 191 294 Q 194 281 192 268"/>
            <path strokeWidth="0.9" strokeOpacity="0.28" d="M 200 300 Q 203 287 201 274"/>
            <path strokeWidth="0.8" strokeOpacity="0.26" d="M 208 292 Q 210 280 209 267"/>
            <path strokeWidth="0.9" strokeOpacity="0.26" d="M 193 252 Q 196 240 194 228"/>
            <path strokeWidth="0.8" strokeOpacity="0.22" d="M 202 256 Q 204 244 203 232"/>
            <path strokeWidth="0.7" strokeOpacity="0.20" d="M 196 214 Q 198 204 197 193"/>
            {/* ── ring finger ── */}
            <path strokeWidth="1.0" strokeOpacity="0.30" d="M 221 300 Q 224 287 222 274"/>
            <path strokeWidth="0.9" strokeOpacity="0.26" d="M 230 306 Q 232 293 231 280"/>
            <path strokeWidth="0.8" strokeOpacity="0.24" d="M 238 298 Q 240 286 239 273"/>
            <path strokeWidth="0.8" strokeOpacity="0.24" d="M 224 260 Q 226 249 225 237"/>
            <path strokeWidth="0.7" strokeOpacity="0.20" d="M 232 264 Q 234 253 233 241"/>
            {/* ── pinky — scraggly lil hairs ── */}
            <path strokeWidth="1.0" strokeOpacity="0.32" d="M 259 320 Q 262 309 260 297"/>
            <path strokeWidth="0.9" strokeOpacity="0.28" d="M 267 326 Q 269 315 268 303"/>
            <path strokeWidth="0.8" strokeOpacity="0.24" d="M 274 318 Q 276 308 275 296"/>
            <path strokeWidth="0.8" strokeOpacity="0.24" d="M 261 280 Q 263 270 262 259"/>
            <path strokeWidth="0.7" strokeOpacity="0.20" d="M 268 284 Q 270 274 269 263"/>
            {/* ── thumb — hairy knuckle ── */}
            <path strokeWidth="1.0" strokeOpacity="0.32" d="M 78 294 Q 82 282 80 270"/>
            <path strokeWidth="0.9" strokeOpacity="0.28" d="M 86 300 Q 89 288 87 276"/>
            <path strokeWidth="0.8" strokeOpacity="0.24" d="M 93 292 Q 96 281 94 269"/>
            <path strokeWidth="0.9" strokeOpacity="0.26" d="M 80 258 Q 83 247 81 236"/>
          </g>

          {/* ══════════ TATTOO — big trashy skull ══════════ */}
          <g transform="translate(0, 10)">
          {/* blurred shadow */}
          <g transform="rotate(-5, 200, 462)" opacity="0.30" filter="url(#softBlur)">
            <rect x={180} y={418} width={40} height={80} fill="#100818"/>
            <rect x={165} y={433} width={70} height={60} fill="#100818"/>
            <rect x={160} y={494} width={80} height={22} fill="#100818"/>
          </g>
          {/* main ink — u=5, skull 14 cols wide (70px), center x=200 → left edge x=165 */}
          <g transform="rotate(-5, 200, 462)" opacity="0.56" style={{ mixBlendMode: 'multiply' }}>
            {/* ── dome ── */}
            <rect x={180} y={418} width={40} height={5} fill="#120820"/>
            <rect x={175} y={423} width={50} height={5} fill="#120820"/>
            <rect x={170} y={428} width={60} height={5} fill="#120820"/>
            <rect x={165} y={433} width={70} height={5} fill="#120820"/>
            <rect x={165} y={438} width={70} height={5} fill="#120820"/>
            {/* ── eye rows (3 rows) — left block | L-socket gap | nose bridge | R-socket gap | right block ── */}
            {[443, 448, 453].map(y => (
              <g key={y}>
                <rect x={165} y={y} width={10} height={5} fill="#120820"/>
                <rect x={190} y={y} width={20} height={5} fill="#120820"/>
                <rect x={225} y={y} width={10} height={5} fill="#120820"/>
              </g>
            ))}
            {/* X in left socket (x=175–189) */}
            <rect x={175} y={443} width={5} height={5} fill="#120820"/>
            <rect x={185} y={443} width={5} height={5} fill="#120820"/>
            <rect x={180} y={448} width={5} height={5} fill="#120820"/>
            <rect x={175} y={453} width={5} height={5} fill="#120820"/>
            <rect x={185} y={453} width={5} height={5} fill="#120820"/>
            {/* X in right socket (x=210–224) */}
            <rect x={210} y={443} width={5} height={5} fill="#120820"/>
            <rect x={220} y={443} width={5} height={5} fill="#120820"/>
            <rect x={215} y={448} width={5} height={5} fill="#120820"/>
            <rect x={210} y={453} width={5} height={5} fill="#120820"/>
            <rect x={220} y={453} width={5} height={5} fill="#120820"/>
            {/* ── cheekbone + jaw ── */}
            <rect x={165} y={458} width={70} height={5} fill="#120820"/>
            <rect x={170} y={463} width={60} height={5} fill="#120820"/>
            <rect x={175} y={468} width={50} height={5} fill="#120820"/>
            <rect x={175} y={473} width={50} height={5} fill="#120820"/>
            {/* ── teeth — uneven and trashy ── */}
            <rect x={175} y={478} width={10} height={8} fill="#120820"/>
            <rect x={190} y={478} width={15} height={8} fill="#120820"/>
            <rect x={210} y={478} width={5}  height={8} fill="#120820"/>
            <rect x={220} y={478} width={5}  height={5} fill="#120820"/>
            {/* bottom jaw */}
            <rect x={175} y={486} width={50} height={5} fill="#120820"/>
            {/* ── skull crack ── */}
            <rect x={197} y={421} width={4} height={14} fill="#120820" opacity="0.65"/>
            <rect x={193} y={432} width={6} height={5}  fill="#120820" opacity="0.45"/>
            {/* ── side crosses ── */}
            <rect x={142} y={449} width={18} height={4} fill="#120820"/>
            <rect x={148} y={443} width={6}  height={18} fill="#120820"/>
            <rect x={234} y={449} width={18} height={4} fill="#120820"/>
            <rect x={240} y={443} width={6}  height={18} fill="#120820"/>
            {/* tiny 3-dot motif beside each cross */}
            {[-1, 0, 1].map(d => <rect key={d} x={136} y={465 + d*6} width={3} height={3} fill="#120820"/>)}
            {[-1, 0, 1].map(d => <rect key={d} x={255} y={465 + d*6} width={3} height={3} fill="#120820"/>)}
            {/* ── SLURPN text ── */}
            <text
              x={204} y={515}
              textAnchor="middle"
              fontFamily="'Press Start 2P', monospace"
              fontSize="17"
              fill="#120820"
              style={{ letterSpacing: '1px' }}
            >SLURPN</text>
          </g>
          </g>{/* end tattoo translate */}

          {/* ══════════ WATCH — at the very bottom of the hand ══════════ */}
          <g transform="translate(0, 58)">
          {/* band left side */}
          <rect x={82}  y={508} width={75}  height={52} rx={5} fill="#1a0c04"/>
          <rect x={86}  y={512} width={67}  height={44} rx={4}
            fill="none" stroke="#3d1e08" strokeWidth={1.2} strokeOpacity={0.65} strokeDasharray="5,4"/>

          {/* band right side + buckle */}
          <rect x={247} y={508} width={82}  height={52} rx={5} fill="#1a0c04"/>
          <rect x={251} y={512} width={74}  height={44} rx={4}
            fill="none" stroke="#3d1e08" strokeWidth={1.2} strokeOpacity={0.65} strokeDasharray="5,4"/>
          {/* buckle bar */}
          <rect x={322} y={524} width={10} height={20} rx={4} fill="#666"/>
          <rect x={324} y={526} width={6}  height={16} rx={3} fill="#999"/>
          <rect x={326} y={531} width={5}  height={6}  rx={2} fill="#bbb"/>

          {/* watch case — thick metal bezel */}
          <rect x={148} y={496} width={108} height={76} rx={9} fill="#606060"/>
          <rect x={151} y={499} width={102} height={70} rx={8} fill="#c0c0c0"/>
          {/* case top highlight */}
          <rect x={152} y={500} width={100} height={14} rx={7} fill="#ffffff" opacity={0.25}/>
          {/* crown buttons right side */}
          <rect x={255} y={516} width={9}  height={14} rx={4} fill="#888"/>
          <rect x={256} y={518} width={7}  height={10} rx={3} fill="#aaa"/>
          <rect x={255} y={536} width={9}  height={10} rx={4} fill="#888"/>
          <rect x={256} y={537} width={7}  height={8}  rx={3} fill="#aaa"/>

          {/* watch face — dark LCD screen */}
          <rect x={155} y={503} width={94} height={62} rx={5} fill="#040804"/>
          <rect x={155} y={503} width={94} height={62} rx={5} fill="#002800" opacity={0.4}/>
          {/* screen inner glow */}
          <rect x={157} y={505} width={90} height={10} rx={3} fill="#004400" opacity={0.3}/>

          {/* LCD time display */}
          <text x={202} y={541} textAnchor="middle"
            fontFamily="'Press Start 2P', monospace" fontSize={18}
            fill="#00ff44"
            style={{ filter: 'drop-shadow(0 0 4px #00ff44) drop-shadow(0 0 8px #00cc33)' }}>
            8:88
          </text>
          {/* AM label */}
          <text x={233} y={554} textAnchor="middle"
            fontFamily="'Press Start 2P', monospace" fontSize={6}
            fill="#00bb33" opacity={0.85}>AM</text>
          </g>{/* end watch translate */}

          {/* ══════════ EMBER ══════════ */}
          <g style={{ animation: isInhaling ? 'emberBright 0.12s ease-in-out infinite' : 'emberPulse 0.85s ease-in-out infinite' }}>
            <ellipse cx="168" cy="32" rx="16" ry="14" fill="#ff7700" fillOpacity="0.28"/>
            <ellipse cx="168" cy="31" rx="10" ry="9"  fill="#ff5500" fillOpacity="0.60"/>
            <ellipse cx="168" cy="30" rx="6"  ry="5"  fill="#ffcc00"/>
            <ellipse cx="167" cy="29" rx="3"  ry="2.5" fill="#ffffff" fillOpacity="0.85"/>
          </g>

        </g>{/* end handShadow group */}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────
// FROWNY FACE  (pixel art SVG)
// ─────────────────────────────────────────────
const FROWNY_COLORS = [
  '#ff00ff', '#00ffff', '#ff4400', '#ffff00',
  '#00ff88', '#ff0088', '#8800ff', '#ff8800',
]

function FrownyFace({ x, y, size, color, dur, delay, spin }) {
  const s = size
  return (
    <div style={{
      position: 'fixed',
      left: x,
      top: y,
      width: s,
      height: s,
      pointerEvents: 'none',
      zIndex: 45,
      animation: `${spin ? 'frownyDrift' : 'frownyFloat'} ${dur}s ease-in-out ${delay}s infinite`,
    }}>
      <svg
        width={s} height={s}
        viewBox="0 0 32 32"
        shapeRendering="crispEdges"
        style={{ imageRendering: 'pixelated', animation: `frownyPulse ${(dur * 0.4).toFixed(1)}s ease-in-out infinite` }}
      >
        {/* face circle — built from rects for pixel look */}
        <rect x="10" y="2"  width="12" height="2" fill={color}/>
        <rect x="6"  y="4"  width="4"  height="2" fill={color}/>
        <rect x="22" y="4"  width="4"  height="2" fill={color}/>
        <rect x="4"  y="6"  width="2"  height="18" fill={color}/>
        <rect x="26" y="6"  width="2"  height="18" fill={color}/>
        <rect x="6"  y="26" width="4"  height="2"  fill={color}/>
        <rect x="22" y="26" width="4"  height="2"  fill={color}/>
        <rect x="10" y="28" width="12" height="2"  fill={color}/>
        {/* eyes */}
        <rect x="9"  y="10" width="4" height="4" fill={color}/>
        <rect x="19" y="10" width="4" height="4" fill={color}/>
        {/* frown */}
        <rect x="10" y="22" width="12" height="2" fill={color}/>
        <rect x="8"  y="20" width="2"  height="2" fill={color}/>
        <rect x="22" y="20" width="2"  height="2" fill={color}/>
        <rect x="10" y="18" width="2"  height="2" fill={color}/>
        <rect x="20" y="18" width="2"  height="2" fill={color}/>
        {/* glow fill */}
        <rect x="6" y="6" width="20" height="20" fill={color} opacity="0.07"/>
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────
// WEIRD SCREEN FILTERS
// ─────────────────────────────────────────────
function WeirdFilters({ puffCount }) {
  // tier 1: 15+ puffs — soft pink wash
  // tier 2: 25+ puffs — green vomit
  // tier 3: 40+ puffs — cycling hue rotation
  // tier 4: 60+ puffs — full psycho

  if (puffCount < 15) return null

  const tier2 = puffCount >= 25
  const tier3 = puffCount >= 40
  const tier4 = puffCount >= 60

  return (
    <>
      {/* Base color wash — changes per tier */}
      <div style={{
        position: 'fixed', inset: 0,
        zIndex: 35,
        pointerEvents: 'none',
        mixBlendMode: 'color',
        background: tier4
          ? 'transparent'   // hue-shift handles it at tier4
          : tier3
          ? 'rgba(180, 0, 255, 0.35)'
          : tier2
          ? 'rgba(0, 200, 80, 0.28)'
          : 'rgba(255, 40, 120, 0.22)',
        animation: tier3 ? 'filterPulse 1.2s ease-in-out infinite' : 'filterPulse 2.5s ease-in-out infinite',
      }} />

      {/* Tier 3+: hue cycling overlay */}
      {tier3 && (
        <div style={{
          position: 'fixed', inset: 0,
          zIndex: 36,
          pointerEvents: 'none',
          animation: `hueShift ${tier4 ? '2s' : '5s'} linear infinite`,
          opacity: tier4 ? 0.55 : 0.3,
          background: 'linear-gradient(135deg, rgba(255,0,100,0.4), rgba(0,255,200,0.4), rgba(100,0,255,0.4))',
          mixBlendMode: 'screen',
        }} />
      )}

      {/* Tier 4: heavy distortion bars */}
      {tier4 && (
        <div style={{
          position: 'fixed', inset: 0,
          zIndex: 37,
          pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(255,0,200,0.08) 6px, rgba(255,0,200,0.08) 8px)',
          animation: 'scanline 1.5s linear infinite',
        }} />
      )}
    </>
  )
}

// ─────────────────────────────────────────────
// FROWNY FACE LAYER
// ─────────────────────────────────────────────
// Faces are seeded once so they don't jump around on re-render
const FACE_SEEDS = Array.from({ length: 20 }, (_, i) => ({
  x:     (((i * 137 + 41) % 85) + 3),   // % of vw
  y:     (((i * 97  + 17) % 75) + 5),   // % of vh
  size:  24 + (i * 13) % 40,
  color: FROWNY_COLORS[i % FROWNY_COLORS.length],
  dur:   3.5 + (i * 0.7) % 4,
  delay: (i * 0.45) % 3,
  spin:  i % 3 === 0,
}))

function FrownyLayer({ puffCount }) {
  // how many faces to show based on puffs
  const count =
    puffCount >= 60 ? 20 :
    puffCount >= 40 ? 12 :
    puffCount >= 25 ? 7  :
    puffCount >= 15 ? 3  : 0

  if (count === 0) return null

  return (
    <>
      {FACE_SEEDS.slice(0, count).map((f, i) => (
        <FrownyFace
          key={i}
          x={`${f.x}vw`}
          y={`${f.y}vh`}
          size={f.size}
          color={f.color}
          dur={f.dur}
          delay={f.delay}
          spin={f.spin}
        />
      ))}
    </>
  )
}

// ─────────────────────────────────────────────
// STREET DOG
// ─────────────────────────────────────────────
function StreetDog() {
  const [visible,   setVisible]   = useState(false)
  const [x,         setX]         = useState(-100)
  const [dir,       setDir]       = useState(1)
  const [barkWord,  setBarkWord]  = useState('')
  const rafRef      = useRef(null)
  const xRef        = useRef(-100)
  const timerRef    = useRef(null)

  const makeBark = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      ;[0, 0.2].forEach(offset => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(380, ctx.currentTime + offset)
        osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + offset + 0.13)
        gain.gain.setValueAtTime(0.28, ctx.currentTime + offset)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.15)
        osc.start(ctx.currentTime + offset)
        osc.stop(ctx.currentTime + offset + 0.16)
      })
    } catch(e) {}
  }, [])

  const spawnDog = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    const goRight  = Math.random() > 0.5
    const startX   = goRight ? -100 : window.innerWidth + 20
    const direction = goRight ? 1 : -1
    xRef.current   = startX
    setDir(direction)
    setX(startX)
    setVisible(true)

    const words = ['WOOF!', 'ARF!', 'WOOF!']
    words.forEach((word, i) => {
      setTimeout(() => {
        makeBark()
        setBarkWord(word)
        setTimeout(() => setBarkWord(''), 800)
      }, 1400 + i * 2000)
    })

    const speed = 105
    let last = null
    const step = (ts) => {
      if (!last) last = ts
      const dt = Math.min((ts - last) / 1000, 0.05)
      last = ts
      xRef.current += direction * speed * dt
      setX(xRef.current)
      const offscreen = direction === 1
        ? xRef.current > window.innerWidth + 20
        : xRef.current < -100
      if (offscreen) {
        setVisible(false)
        timerRef.current = setTimeout(spawnDog, 20000 + Math.random() * 15000)
      } else {
        rafRef.current = requestAnimationFrame(step)
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [makeBark])

  useEffect(() => {
    timerRef.current = setTimeout(spawnDog, 5000 + Math.random() * 4000)
    return () => {
      clearTimeout(timerRef.current)
      cancelAnimationFrame(rafRef.current)
    }
  }, [spawnDog])

  if (!visible) return null

  const flipped = dir === -1

  return (
    <div style={{
      position: 'absolute',
      left: x,
      bottom: '13%',
      width: 150,
      zIndex: 3,
      pointerEvents: 'none',
    }}>
      {barkWord && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: flipped ? 'auto' : 24,
          right: flipped ? 24 : 'auto',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 11,
          color: '#fff',
          background: '#111',
          border: '1.5px solid #ccc',
          padding: '2px 5px',
          whiteSpace: 'nowrap',
          marginBottom: 3,
          animation: 'dogBarkPop 0.8s ease forwards',
          transform: flipped ? 'scaleX(-1)' : 'none',
        }}>
          {barkWord}
        </div>
      )}
      <svg
        width="150" height="98"
        viewBox="0 0 80 52"
        style={{ display: 'block', transform: flipped ? 'scaleX(-1)' : 'none', imageRendering: 'pixelated' }}
      >
        {/* Tail */}
        <g style={{ transformOrigin: '10px 24px', animation: 'dogTailWag 0.38s ease-in-out infinite' }}>
          <rect x="2" y="16" width="12" height="7" rx="3" fill="#7A5A10" />
          <rect x="0" y="12" width="8" height="6" rx="2" fill="#6B4F0E" />
        </g>

        {/* Body */}
        <rect x="8" y="22" width="40" height="15" rx="3" fill="#8B6B14" />

        {/* Belly highlight */}
        <rect x="12" y="30" width="28" height="5" rx="2" fill="#A07830" opacity="0.5" />

        {/* Collar */}
        <rect x="41" y="27" width="7" height="5" rx="1" fill="#cc1100" />
        <rect x="43" y="32" width="4" height="4" rx="1" fill="#ffcc00" />

        {/* Head */}
        <rect x="44" y="13" width="23" height="19" rx="3" fill="#8B6B14" />

        {/* Floppy ear */}
        <rect x="49" y="7" width="11" height="15" rx="4" fill="#6B5010" />

        {/* Snout */}
        <rect x="63" y="22" width="13" height="7" rx="2" fill="#A07830" />
        <rect x="72" y="23" width="4" height="3" rx="1" fill="#222" />

        {/* Mouth line */}
        <rect x="66" y="27" width="8" height="1" rx="0" fill="#6B4F0E" />

        {/* Eye */}
        <rect x="56" y="17" width="5" height="5" rx="1" fill="#111" />
        <rect x="57" y="18" width="2" height="2" rx="0" fill="#fff" />

        {/* Back legs */}
        <g style={{ transformOrigin: '14px 37px', animation: 'dogLegA 0.36s ease-in-out infinite' }}>
          <rect x="10" y="35" width="7" height="15" rx="2" fill="#7A5A10" />
          <rect x="9"  y="48" width="9" height="3"  rx="1" fill="#5A4008" />
        </g>
        <g style={{ transformOrigin: '24px 37px', animation: 'dogLegB 0.36s ease-in-out infinite' }}>
          <rect x="20" y="35" width="7" height="15" rx="2" fill="#7A5A10" />
          <rect x="19" y="48" width="9" height="3"  rx="1" fill="#5A4008" />
        </g>

        {/* Front legs */}
        <g style={{ transformOrigin: '34px 37px', animation: 'dogLegB 0.36s ease-in-out infinite' }}>
          <rect x="30" y="35" width="7" height="15" rx="2" fill="#7A5A10" />
          <rect x="29" y="48" width="9" height="3"  rx="1" fill="#5A4008" />
        </g>
        <g style={{ transformOrigin: '44px 37px', animation: 'dogLegA 0.36s ease-in-out infinite' }}>
          <rect x="40" y="35" width="7" height="15" rx="2" fill="#7A5A10" />
          <rect x="39" y="48" width="9" height="3"  rx="1" fill="#5A4008" />
        </g>
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────
// SCENE — background + decorative elements
// ─────────────────────────────────────────────
function Scene({ isInhaling, puffCount, onEnterDoor }) {
  const trippy = puffCount >= 40
  const buzzed  = puffCount >= 25
  const [doorHovered, setDoorHovered] = useState(false)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>

      {/* ── Background photo ── */}
      <img
        src="/images/stationbg.jpg"
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 60%',
          imageRendering: 'pixelated',
          filter: isInhaling
            ? 'brightness(1.05) saturate(1.3) contrast(1.3) sepia(0.15)'
            : puffCount >= 60
            ? 'brightness(0.6) saturate(3) contrast(1.6)'
            : trippy
            ? 'brightness(0.7) saturate(2) hue-rotate(25deg) contrast(1.5)'
            : puffCount >= 15
            ? 'brightness(0.75) saturate(0.9) contrast(1.4) sepia(0.15)'
            : 'brightness(0.7) saturate(0.6) contrast(1.35) sepia(0.25)',
          transition: 'filter 0.5s ease',
          animation: trippy ? 'glitch 2s infinite' : 'none',
        }}
      />

      {/* ── Door hitbox — adjust left/top/width/height to line up with the door ── */}
      <div
        onMouseEnter={() => setDoorHovered(true)}
        onMouseLeave={() => setDoorHovered(false)}
        onClick={onEnterDoor}
        style={{
          position: 'absolute',
          left: '68%',
          top: '22%',
          width: '8%',
          height: '46%',
          cursor: doorHovered ? 'pointer' : 'default',
          border: doorHovered ? '2px solid rgba(255,160,30,0.7)' : '2px solid transparent',
          background: doorHovered ? 'rgba(255,140,0,0.10)' : 'transparent',
          boxShadow: doorHovered ? 'inset 0 0 24px rgba(255,140,0,0.18), 0 0 12px rgba(255,140,0,0.25)' : 'none',
          transition: 'all 0.15s ease',
          zIndex: 2,
        }}
      />

      {/* ── Pixelation / dither grid overlay ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(transparent 3px, rgba(0,0,0,0.06) 3px), ' +
          'linear-gradient(90deg, transparent 3px, rgba(0,0,0,0.06) 3px)',
        backgroundSize: '4px 4px',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* ── Dirt / grain texture ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background:
          'repeating-linear-gradient(17deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* ── SLURPN title — beaten up, half-dead neon ── */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '30px',
        letterSpacing: '5px',
        color: '#dd0044',
        textShadow: '0 0 6px #ff0055, 0 0 18px #aa0033, 3px 3px 0 #440011',
        animation: 'neonFlicker 3.5s infinite 0.3s',
        zIndex: 6,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        opacity: 0.9,
      }}>
        SLURPN
      </div>

      {/* ── RIGHT COLUMN: TV + text stacked, flush to corner ── */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '2%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 0,
        zIndex: 5,
        width: '192px',
      }}>
        {/* TV monitor */}
        <div style={{
          width: '100%',
          height: '144px',
          background: '#050505',
          border: '8px solid #1a1a1a',
          outline: '3px solid #333',
          boxShadow: '0 0 0 2px #111, 0 0 18px rgba(80,200,80,0.18), inset 0 0 16px rgba(0,0,0,0.9)',
          imageRendering: 'pixelated',
          position: 'relative',
          flexShrink: 0,
        }}>
          <video
            src="https://pub-db102f8987b746139ff040a15b163a4e.r2.dev/gasclips.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              imageRendering: 'pixelated',
              filter: buzzed
                ? 'saturate(0) contrast(1.6) brightness(0.8) hue-rotate(90deg) sepia(0.5)'
                : 'saturate(0.15) contrast(1.5) brightness(0.75) sepia(0.3)',
              opacity: 0.9,
            }}
          />
          {/* CRT scanlines */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.28) 2px, rgba(0,0,0,0.28) 4px)',
            pointerEvents: 'none',
          }} />
          {/* Phosphor tint */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,40,0,0.22)',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }} />
        </div>

        {/* CAM label bar */}
        <div style={{
          background: 'rgba(0,10,0,0.9)',
          border: '2px solid #1a331a',
          borderTop: 'none',
          padding: '4px 8px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '7px',
          color: '#44bb44',
          textShadow: '0 0 5px #44bb44',
          animation: 'neonFlicker2 7s infinite 2s',
          textAlign: 'center',
          letterSpacing: 1,
        }}>CAM 01 — LIVE</div>

        {/* Text sign below — same width as the TV */}
        <div style={{
          marginTop: '10px',
          background: 'rgba(4,4,4,0.88)',
          border: '3px solid #2a2200',
          outline: '1px solid #443300',
          padding: '10px 12px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '11px',
          lineHeight: '2.4',
          color: '#bb8800',
          textShadow: '0 0 6px #996600',
          animation: 'neonFlicker2 5s infinite 0.8s',
          userSelect: 'none',
          boxSizing: 'border-box',
        }}>
          <div>HOT DOGS</div>
          <div style={{ color: '#887700' }}>$1.00</div>
          <div style={{ marginTop: 4, color: '#665500' }}>LOTTO INSIDE</div>
          <div style={{ marginTop: 8, color: '#883300', animation: 'weirdSign 4s infinite' }}>
            NO ESCAPE<br/>NO RETURNS<br/>THEY SEE ALL
          </div>
        </div>
      </div>

      {/* ── LEFT: Busted price board ── */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '2%',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '11px',
        color: '#cc5500',
        textShadow: '0 0 5px #cc3300',
        lineHeight: '2.4',
        zIndex: 5,
        animation: 'neonFlicker 9s infinite 1s',
        userSelect: 'none',
        background: 'rgba(4,4,4,0.85)',
        border: '3px solid #331100',
        outline: '1px solid #551100',
        padding: '10px 9px',
        boxShadow: '0 0 10px rgba(180,40,0,0.2)',
      }}>
        <div style={{ marginBottom: 4, color: '#ff7700', letterSpacing: 2 }}>CLOWN EGGS</div>
        <div style={{ color: '#994400' }}>REG  $26.66</div>
        <div style={{ color: '#994400' }}>MID  $47.21</div>
        <div style={{ color: '#994400' }}>PRE  $88.88</div>
        <div style={{ marginTop: 8, fontSize: '10px', color: '#661100', animation: 'blink 2s step-end infinite' }}>CASH ONLY</div>
        <div style={{ fontSize: '10px', color: '#880000', animation: 'blink 0.9s step-end infinite' }}>NO REFUNDS</div>
      </div>

      {/* ── Spinning weird object (UFO/orb) if trippy ── */}
      {trippy && (
        <div style={{
          position: 'absolute',
          top: '35%',
          left: '20%',
          width: '40px',
          height: '16px',
          background: '#00ffff',
          boxShadow: '0 0 20px #00ffff, 0 0 40px #0088ff',
          imageRendering: 'pixelated',
          animation: 'floatBuilding 1.5s ease-in-out infinite, weirdSign 2s infinite',
          zIndex: 6,
        }} />
      )}

      {/* ── Sky dither gradient ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.25) 100%)',
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      <StreetDog />
    </div>
  )
}

// ─────────────────────────────────────────────
// CRT OVERLAY
// ─────────────────────────────────────────────
function CRTOverlay({ flashing, flashKey }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, pointerEvents: 'none' }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
      }} />
      {/* Moving scanline sweep */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        height: '4px',
        background: 'rgba(255,255,255,0.04)',
        animation: 'scanline 8s linear infinite',
      }} />
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.72) 100%)',
      }} />
      {/* Flash on inhale — key forces animation restart each click */}
      {flashing && (
        <div
          key={flashKey}
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255, 160, 60, 0.18)',
            animation: 'screenFlash 0.5s ease-out forwards',
          }}
        />
      )}
      {/* Chromatic aberration hint */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(255,0,0,0.012) 0%, rgba(0,255,0,0.012) 50%, rgba(0,0,255,0.012) 100%)',
        mixBlendMode: 'screen',
      }} />
    </div>
  )
}

// ─────────────────────────────────────────────
// HUD
// ─────────────────────────────────────────────
function HUD({ puffCount, sipCount, message, msgKey, cigDone }) {
  const T = { fontFamily: "'Press Start 2P', monospace" }

  return (
    <>
      {/* Puff counter */}
      <div style={{
        ...T,
        position: 'fixed',
        top: 16,
        left: 16,
        zIndex: 80,
        pointerEvents: 'none',
        lineHeight: 2,
      }}>
        <div style={{ fontSize: 9, color: '#ff8800', textShadow: '0 0 8px #ff8800' }}>PUFFS</div>
        <div style={{ fontSize: 22, color: '#ffcc00', textShadow: '0 0 14px #ffcc00' }}>
          {String(puffCount).padStart(3, '0')}
        </div>
      </div>

      {/* Sip counter */}
      <div style={{
        ...T,
        position: 'fixed',
        top: 16,
        left: 100,
        zIndex: 80,
        pointerEvents: 'none',
        lineHeight: 2,
      }}>
        <div style={{ fontSize: 9, color: '#00cc44', textShadow: '0 0 8px #00cc44' }}>SIPS</div>
        <div style={{ fontSize: 22, color: '#00ff88', textShadow: '0 0 14px #00ff88' }}>
          {String(sipCount).padStart(3, '0')}
        </div>
      </div>

      {/* Cig done warning */}
      {cigDone && (
        <div style={{
          ...T,
          position: 'fixed',
          top: 80,
          left: 16,
          fontSize: 8,
          color: '#ff0000',
          textShadow: '0 0 10px #ff0000',
          animation: 'blink 0.6s step-end infinite',
          zIndex: 80,
          pointerEvents: 'none',
        }}>
          CLICK TO<br/>LIGHT UP
        </div>
      )}

      {/* Floating message */}
      {message && (
        <div
          key={msgKey}
          style={{
            ...T,
            position: 'fixed',
            bottom: 260,
            left: '50%',
            fontSize: 9,
            color: '#00ffcc',
            textShadow: '0 0 12px #00ffcc, 0 0 24px #00aa88',
            animation: 'messageFloat 7s ease-out forwards',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 80,
          }}
        >
          {message}
        </div>
      )}

      {/* First-time hint */}
      {puffCount === 0 && (
        <div style={{
          ...T,
          position: 'fixed',
          bottom: 230,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 8,
          color: '#ffffff',
          textShadow: '0 0 8px #ffffff',
          animation: 'blink 1.2s step-end infinite',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 80,
        }}>
          [ CLICK TO SMOKE ]
        </div>
      )}
    </>
  )
}

// ─────────────────────────────────────────────
// EXHALE CLOUD (small burst at ember on click)
// ─────────────────────────────────────────────
function ExhaleCloud({ x, y, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line

  return (
    <div style={{
      position: 'fixed',
      left: x, top: y,
      width: 60, height: 60,
      borderRadius: 0,
      background: 'rgba(230,230,230,0.55)',
      filter: 'blur(6px)',
      pointerEvents: 'none',
      zIndex: 16,
      animation: 'exhaleCloud 1.4s ease-out forwards',
    }} />
  )
}

// ─────────────────────────────────────────────
// BIG EXHALE BLOB — one wisp of the exhale cloud
// ─────────────────────────────────────────────
function ExhaleBlob({ cx, cy, size, driftX, driftY, dur, delay, opacity, animName = 'bigExhale', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, (dur + delay) * 1000 + 100)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line

  return (
    <div
      style={{
        position: 'fixed',
        left: cx,
        top:  cy,
        width:  size,
        height: size,
        background: `rgba(215,215,215,${opacity.toFixed(2)})`,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 60,
        '--drift-x': `${driftX}px`,
        '--drift-y': `${driftY}px`,
        animation: `${animName} ${dur}s ease-out ${delay}s both`,
      }}
    />
  )
}

// ─────────────────────────────────────────────
// SIP MESSAGES
// ─────────────────────────────────────────────
const SIP_MESSAGES = [
  'THE FUTURE AINT WHAT IT USED TO BE',
  'MY MENTOR HAS JAUNDICE',
  'I OWE GUTNIK MONEY',
  'IMMA WHOOP YA ASS',
  'MY LEFT PENIS HURTS',
  'BEEF BIRD 2 IS OUT NEXT WEEK',
  'SLEEP IS FOR THE WEAK',
  'MY GRIP IS EXCELLENT',
  'GOT A HEAD LIKE A LAMP',
  'I LOVE CHEMICALS',
  'NO MORE CRYING FOR ME',
  "HAVE YOU EVER STOPPED — TRULY STOPPED, LET YOUR BONES GO QUIET — TO WATCH A BLUEBIRD DROP FROM A DTREEM AND TAKE TO THE DAMN AIR? HAVE YOU WATCHED IT FALL UPWARD INTO THE BELOW-SKY, ITS WINGS MADE OF SOMEONE ELSE'S TEETH, ITS SONG A TELEPHONE NUMBER YOU KEEP ALMOST REMEMBERING? THE DTREEM DOES NOT MISS IT. THE DTREEM HAS FORTY-SEVEN MOUTHS AND NONE OF THEM ARE SPEAKING TO YOU ANYMORE. THE BIRD IS NOT FLYING. THE BIRD HAS NEVER FLOWN. THE BIRD IS A DOOR THAT OPENS INTO ANOTHER BIRD. THERE IS ALWAYS ANOTHER BIRD. YOU HAVE BEEN STANDING IN THIS FIELD FOR ELEVEN YEARS AND YOUR SHADOW IS POINTING THE WRONG DIRECTION AND THE AIR THE DAMN AIR TASTES LIKE A WEDNESDAY FROM A LIFE YOU DID NOT LIVE AND THE BLUEBIRD LOOKS BACK AT YOU AND IT HAS YOUR MOTHER'S HANDWRITING AND IT SAYS YOUR NAME BUT SPELLED INCORRECTLY IN A WAY THAT FEELS MORE ACCURATE AND YOU CANNOT MOVE BECAUSE YOU UNDERSTAND NOW THAT YOU WERE NEVER WATCHING THE BIRD — THE BIRD HAS BEEN WATCHING THE THING STANDING BEHIND YOU THIS WHOLE TIME.",
  'IM A SHORTSLEEVED CREATURE',
  'HERMAN CAIN MAXIMUM PAIN',
  'MANAPUMPER',
  "CAN'T BELIEVE I UNLOCK HIGH SCEPTOR",
]

// ─────────────────────────────────────────────
// FIZZ BUBBLE
// ─────────────────────────────────────────────
function FizzBubble({ x, y, onDone }) {
  const size  = Math.random() * 10 + 5
  const drift = (Math.random() - 0.5) * 44
  const dur   = Math.random() * 0.6 + 0.8
  const delay = Math.random() * 0.35

  useEffect(() => {
    const t = setTimeout(onDone, (dur + delay) * 1000 + 100)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line

  return (
    <div style={{
      position: 'fixed',
      left: x - size / 2,
      top:  y - size / 2,
      width: size,
      height: size,
      borderRadius: '50%',
      background: `rgba(180,255,200,${(Math.random() * 0.3 + 0.5).toFixed(2)})`,
      pointerEvents: 'none',
      zIndex: 15,
      '--drift': `${drift}px`,
      animation: `fizzRise ${dur}s ease-out ${delay}s forwards`,
    }} />
  )
}

// ─────────────────────────────────────────────
// LEFT HAND — gripping energy drink can
// Reference: handref.png
//   C-shape grip: thumb left, knuckles right,
//   palm wraps below, can sits in front
// ─────────────────────────────────────────────
function LeftHand({ leftHandPhase, onClick }) {
  const animStyle =
    leftHandPhase === 'sip'    ? { animation: 'leftHandSip 0.20s ease-out forwards' } :
    leftHandPhase === 'return' ? { animation: 'leftHandReturn 0.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards' } :
    { animation: 'leftHandBob 3.8s ease-in-out 0.9s infinite' }

  return (
    <div style={{
      position: 'fixed',
      bottom: '-110px',
      left: '-30px',
      width: '280px',
      zIndex: 25,
      transform: 'rotate(25deg)',
      transformOrigin: 'bottom center',
      pointerEvents: 'none',
    }}>
      <div style={{
        pointerEvents: 'auto',
        cursor: 'crosshair',
        filter: 'contrast(1.08) saturate(0.88)',
        ...animStyle,
      }} onClick={onClick}>
        <svg width="260" height="560" viewBox="0 0 260 560"
          style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id="LcanBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#1a1a1a"/>
              <stop offset="22%"  stopColor="#242424"/>
              <stop offset="55%"  stopColor="#111111"/>
              <stop offset="100%" stopColor="#060606"/>
            </linearGradient>
            <linearGradient id="LcanRim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#888"/>
              <stop offset="35%"  stopColor="#ddd"/>
              <stop offset="65%"  stopColor="#aaa"/>
              <stop offset="100%" stopColor="#666"/>
            </linearGradient>
            {/* knuckle tops — slightly darker, side-lit */}
            <linearGradient id="LgKnuckle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#d09050"/>
              <stop offset="50%"  stopColor="#e8aa68"/>
              <stop offset="100%" stopColor="#f0c080"/>
            </linearGradient>
            {/* thumb — dorsal surface, top-lit */}
            <linearGradient id="LgThumb" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#fce8c0"/>
              <stop offset="45%"  stopColor="#e8aa68"/>
              <stop offset="100%" stopColor="#9a4c18"/>
            </linearGradient>
            <filter id="LhandShadow" x="-20%" y="-10%" width="155%" height="130%">
              <feDropShadow dx="-4" dy="9" stdDeviation="7" floodColor="#00000070"/>
            </filter>
          </defs>

          <g filter="url(#LhandShadow)">

            {/* ══ 3. FOUR KNUCKLE BUMPS — right side, behind can ══
                Ellipses centered just past the can's right edge (x≈188).
                The can (drawn next) covers their left halves automatically. */}
            {/* Index knuckle */}
            <ellipse cx={192} cy={170} rx={38} ry={20} fill="url(#LgKnuckle)"/>
            <ellipse cx={208} cy={163} rx={14} ry={9}  fill="#f8e0b0" opacity={0.50}/>

            {/* Middle knuckle */}
            <ellipse cx={194} cy={214} rx={40} ry={20} fill="url(#LgKnuckle)"/>
            <ellipse cx={210} cy={207} rx={15} ry={9}  fill="#f8e0b0" opacity={0.46}/>

            {/* Ring knuckle */}
            <ellipse cx={192} cy={256} rx={37} ry={19} fill="url(#LgKnuckle)"/>
            <ellipse cx={207} cy={249} rx={14} ry={8}  fill="#f8e0b0" opacity={0.42}/>

            {/* Pinky knuckle */}
            <ellipse cx={186} cy={294} rx={30} ry={16} fill="url(#LgKnuckle)"/>
            <ellipse cx={199} cy={287} rx={11} ry={7}  fill="#f8e0b0" opacity={0.38}/>

            {/* shadow trenches between knuckles */}
            <path fill="#2a0a00" fillOpacity={0.38}
              d="M 155 191 Q 195 188 230 194 Q 195 198 155 195 Z"/>
            <path fill="#2a0a00" fillOpacity={0.33}
              d="M 153 232 Q 194 229 232 236 Q 194 240 153 237 Z"/>
            <path fill="#2a0a00" fillOpacity={0.28}
              d="M 155 272 Q 193 269 226 275 Q 193 279 155 276 Z"/>

            {/* ══ 4. CAN — drawn on top, clips inner hand naturally ══ */}
            {/* bottom dome */}
            <ellipse cx={130} cy={342} rx={42} ry={11} fill="url(#LcanRim)"/>
            {/* cylinder body */}
            <rect x={88} y={96} width={84} height={248} fill="url(#LcanBody)"/>
            {/* neck */}
            <path fill="url(#LcanRim)"
              d="M 88 96 C 88 82 106 72 130 72 C 154 72 172 82 172 96 Z"/>
            {/* top rim ellipse */}
            <ellipse cx={130} cy={72} rx={42} ry={10} fill="url(#LcanRim)"/>
            {/* pull tab */}
            <ellipse cx={130} cy={72} rx={20} ry={5.5} fill="#bbbbbb"/>
            <rect x={121} y={65} width={18} height={10} rx={5}   fill="#999"/>
            <rect x={127} y={61} width={7}  height={8}  rx={3.5} fill="#ccc"/>
            {/* left-edge highlight */}
            <rect x={90} y={98} width={8} height={244} rx={3} fill="#ffffff" opacity={0.07}/>
            {/* specular oval (like ref image) */}
            <ellipse cx={106} cy={215} rx={9} ry={28} fill="#ffffff" opacity={0.09}/>
            {/* top green stripe */}
            <rect x={88} y={120} width={84} height={10} fill="#00ff44"/>
            {/* label band */}
            <rect x={88} y={130} width={84} height={168} fill="#080808"/>
            {/* bottom green stripe */}
            <rect x={88} y={298} width={84} height={10} fill="#00ff44"/>
            {/* ABSOLUTE CRAP */}
            <text x={130} y={163} textAnchor="middle"
              fontFamily="'Press Start 2P', monospace" fontSize={7}
              fill="#00ff44" style={{letterSpacing:'0.5px'}}>ABSOLUTE</text>
            <text x={130} y={175} textAnchor="middle"
              fontFamily="'Press Start 2P', monospace" fontSize={7}
              fill="#00ff44" style={{letterSpacing:'0.5px'}}>CRAP</text>
            {/* ENERGY */}
            <text x={130} y={187} textAnchor="middle"
              fontFamily="'Press Start 2P', monospace" fontSize={6}
              fill="#00cc33">ENERGY</text>
            {/* pixel lightning bolt */}
            <rect x={122} y={194} width={5}  height={5} fill="#00ff44"/>
            <rect x={118} y={199} width={5}  height={5} fill="#00ff44"/>
            <rect x={122} y={204} width={10} height={5} fill="#00ff44"/>
            <rect x={118} y={209} width={5}  height={5} fill="#00ff44"/>
            <rect x={122} y={214} width={5}  height={5} fill="#00ff44"/>
            {/* poop emoji */}
            <g>
              {/* swirl top — tiny tip */}
              <rect x={128} y={228} width={4}  height={2}  fill="#5c3317"/>
              <rect x={126} y={230} width={8}  height={2}  fill="#5c3317"/>
              <rect x={124} y={232} width={12} height={3}  fill="#6b3d1e"/>
              {/* swirl mid */}
              <rect x={120} y={235} width={20} height={4}  fill="#7a4520"/>
              <rect x={118} y={239} width={24} height={4}  fill="#6b3d1e"/>
              {/* base — widest */}
              <rect x={116} y={243} width={28} height={4}  fill="#7a4520"/>
              <rect x={118} y={247} width={24} height={3}  fill="#6b3d1e"/>
              <rect x={120} y={250} width={20} height={2}  fill="#5c3317"/>
              {/* eyes — white sclera + black pupils */}
              <rect x={121} y={237} width={4}  height={4}  fill="#ffffff"/>
              <rect x={135} y={237} width={4}  height={4}  fill="#ffffff"/>
              <rect x={122} y={238} width={2}  height={2}  fill="#111111"/>
              <rect x={136} y={238} width={2}  height={2}  fill="#111111"/>
              {/* smile */}
              <rect x={122} y={244} width={2}  height={2}  fill="#3a1e08"/>
              <rect x={124} y={246} width={2}  height={2}  fill="#3a1e08"/>
              <rect x={126} y={247} width={6}  height={2}  fill="#3a1e08"/>
              <rect x={132} y={246} width={2}  height={2}  fill="#3a1e08"/>
              <rect x={134} y={244} width={2}  height={2}  fill="#3a1e08"/>
              {/* shine highlight */}
              <rect x={130} y={230} width={3}  height={2}  fill="#9b5e30" opacity={0.6}/>
            </g>
            {/* 666 ML */}
            <text x={130} y={272} textAnchor="middle"
              fontFamily="'Press Start 2P', monospace" fontSize={5}
              fill="#006622" opacity={0.9}>666 ML</text>
            {/* condensation drops */}
            {[
              [94,130],[102,168],[92,210],[98,252],[96,280],
              [164,124],[162,164],[166,204],[164,248],[162,276],
              [116,140],[148,154],[118,234],[146,244],[130,116],[128,278],
            ].map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r={1.4} fill="#ffffff" opacity={0.18}/>
            ))}

            {/* ══ 5. THUMB — drawn IN FRONT of can, wide flat oval ══ */}
            {/* main thumb body */}
            <ellipse cx={122} cy={210} rx={58} ry={23} fill="url(#LgThumb)"/>
            {/* top highlight — bright strip along upper curve */}
            <ellipse cx={118} cy={200} rx={48} ry={10} fill="#fdf0d8" opacity={0.38}/>
            {/* bottom shadow edge */}
            <ellipse cx={122} cy={228} rx={52} ry={8}  fill="#6a3008" opacity={0.22}/>
            {/* knuckle fold crease */}
            <path fill="none" stroke="#8a4820" strokeWidth={1.4} strokeOpacity={0.30}
              d="M 74 204 Q 122 198 170 205"/>
            {/* thumbnail — right side of thumb, pulled inward from tip */}
            <ellipse cx={163} cy={208} rx={13} ry={10} fill="#e8d8b8" opacity={0.90}/>
            <ellipse cx={163} cy={206} rx={11} ry={8}  fill="#f5edd8" opacity={0.80}/>
            <ellipse cx={163} cy={205} rx={8}  ry={5}  fill="#ffffff" opacity={0.55}/>
            {/* nail base shadow */}
            <path fill="none" stroke="#8a6040" strokeWidth={1.2} strokeOpacity={0.35}
              d="M 156 212 Q 163 216 170 212"/>
            {/* thumb hair */}
            <g fill="none" stroke="#4a2006" strokeLinecap="round">
              <path strokeWidth="0.9" strokeOpacity="0.18" d="M 96 196 Q 102 187 106 196"/>
              <path strokeWidth="0.8" strokeOpacity="0.16" d="M 116 193 Q 122 184 126 193"/>
              <path strokeWidth="0.8" strokeOpacity="0.15" d="M 138 194 Q 144 185 148 194"/>
            </g>

            {/* ══ 6. DETAILS — knuckle hair ══ */}
            <g fill="none" stroke="#4a2006" strokeLinecap="round">
              <path strokeWidth="0.8" strokeOpacity="0.20" d="M 198 158 Q 206 147 204 136"/>
              <path strokeWidth="0.7" strokeOpacity="0.18" d="M 200 202 Q 208 191 206 180"/>
              <path strokeWidth="0.7" strokeOpacity="0.18" d="M 197 243 Q 205 232 203 221"/>
              <path strokeWidth="0.7" strokeOpacity="0.16" d="M 192 280 Q 200 270 198 259"/>
            </g>

          </g>
        </svg>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// INSIDE SCENE
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// HANGOVER GUY
// ─────────────────────────────────────────────
function HangoverGuy({ onClicked }) {
  const [intro, setIntro] = useState(true)
  const [ugh, setUgh] = useState(false)
  const [ughKey, setUghKey] = useState(0)
  const [sad, setSad] = useState(false)
  const [spraying, setSpraying] = useState(false)
  const sadTimer = useRef(null)
  const clickCountRef = useRef(0)

  const SPRAY_PARTICLES = [
    { dx: '-55vw', dy: '-85vh' },
    { dx: '-28vw', dy: '-92vh' },
    { dx:   '0vw', dy: '-95vh' },
    { dx:  '28vw', dy: '-92vh' },
    { dx:  '55vw', dy: '-85vh' },
    { dx: '-60vw', dy: '-55vh' },
    { dx:  '60vw', dy: '-55vh' },
    { dx: '-45vw', dy: '-25vh' },
    { dx:  '45vw', dy: '-25vh' },
    { dx: '-20vw', dy: '-70vh' },
    { dx:  '20vw', dy: '-70vh' },
    { dx:   '8vw', dy: '-88vh' },
  ]

  const handleClick = useCallback(() => {
    const sounds = ['/sounds/poodleaudio.ogg', '/sounds/madepoop.ogg', '/sounds/lifeaspoodleistough.ogg', '/sounds/mediumpoop.ogg', '/sounds/iwillnotpoop.ogg', '/sounds/letstalktopoodle.ogg']
    const volumes = { '/sounds/iwillnotpoop.ogg': 0.35 }
    const src = sounds[Math.floor(Math.random() * sounds.length)]
    const audio = new Audio(src)
    audio.volume = volumes[src] ?? 0.8
    audio.play().catch(() => {})
    setSad(true)
    clearTimeout(sadTimer.current)
    sadTimer.current = setTimeout(() => setSad(false), 6000)

    clickCountRef.current += 1
    if (clickCountRef.current % 3 === 0) {
      setSpraying(true)
      setTimeout(() => setSpraying(false), 2000)
    }

    onClicked()
  }, [onClicked])

  // Show intro speech on mount, then start random ughs after it's done
  useEffect(() => {
    const introDuration = 6000
    const introTimer = setTimeout(() => setIntro(false), introDuration)

    const schedule = () => {
      const delay = 4000 + Math.random() * 5000
      return setTimeout(() => {
        setUghKey(k => k + 1)
        setUgh(true)
        setTimeout(() => setUgh(false), 2800)
        schedule()
      }, delay)
    }
    const ughTimer = setTimeout(() => schedule(), introDuration + 1000)

    return () => {
      clearTimeout(introTimer)
      clearTimeout(ughTimer)
    }
  }, [])

  const ughs = ['ugh...', 'oohhh...', 'my head...', 'never again', 'bleeugh']

  return (
    <div style={{
      position: 'absolute',
      left: '52%',
      bottom: '14%',
      transform: 'translateX(-50%)',
      zIndex: 4,
      pointerEvents: 'auto',
      width: 180,
      cursor: 'pointer',
    }} onClick={handleClick}>
      {/* Intro speech bubble */}
      {intro && (
        <div style={{
          position: 'absolute',
          bottom: '105%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 10,
          color: '#eee',
          background: '#111',
          border: '2px solid #888',
          padding: '12px 14px',
          width: 300,
          lineHeight: 2.2,
          textAlign: 'center',
          boxShadow: '0 0 12px rgba(0,0,0,0.8)',
        }}>
          my name is Poodle im so sorry about the smell it was not made from me
          {/* speech bubble tail */}
          <div style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '10px solid #888',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -7,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '8px solid #111',
          }} />
        </div>
      )}

      {/* Sad speech bubble */}
      {sad && (
        <div style={{
          position: 'absolute',
          bottom: '105%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 10,
          color: '#99ccff',
          background: '#0a0a1a',
          border: '2px solid #4466aa',
          padding: '12px 14px',
          width: 280,
          lineHeight: 2.2,
          textAlign: 'center',
          boxShadow: '0 0 16px rgba(80,120,255,0.3)',
          animation: 'ughFloat 6s ease-out forwards',
        }}>
          ...i didnt do anything wrong
          <div style={{
            position: 'absolute',
            bottom: -10, left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '10px solid #4466aa',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -7, left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '8px solid #0a0a1a',
          }} />
        </div>
      )}

      {/* Poop spray — every 3 clicks */}
      {spraying && SPRAY_PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: '48%',
          bottom: '2%',
          pointerEvents: 'none',
          '--dx': p.dx,
          '--dy': p.dy,
          animation: 'poopSpray 1.6s ease-out forwards',
          animationDelay: `${i * 35}ms`,
          zIndex: 10,
        }}>
          <svg width="28" height="24" viewBox="0 0 52 44" style={{ display:'block', imageRendering:'pixelated' }}>
            <ellipse cx="26" cy="38" rx="22" ry="7"  fill="#3d1f00" />
            <ellipse cx="26" cy="32" rx="16" ry="9"  fill="#5a2d00" />
            <ellipse cx="26" cy="22" rx="11" ry="8"  fill="#6b3600" />
            <ellipse cx="26" cy="14" rx="7"  ry="7"  fill="#7a3e00" />
            <ellipse cx="26" cy="9"  rx="4"  ry="5"  fill="#7a3e00" />
            <ellipse cx="28" cy="5"  rx="3"  ry="3"  fill="#8a4800" />
            <ellipse cx="22" cy="30" rx="4"  ry="2"  fill="#7a4a10" opacity="0.5" />
          </svg>
        </div>
      ))}

      {/* UGH float text */}
      {!sad && ugh && (
        <div key={ughKey} style={{
          position: 'absolute',
          top: -28,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 8,
          color: '#88cc44',
          textShadow: '0 0 8px #88cc44',
          whiteSpace: 'nowrap',
          animation: 'ughFloat 2.8s ease-out forwards',
        }}>
          {ughs[ughKey % ughs.length]}
        </div>
      )}

      <svg
        width="180" height="270"
        viewBox="0 0 100 150"
        style={{ display: 'block', imageRendering: 'pixelated' }}
      >
        {/* ── Dizzy stars spinning above head ── */}
        <g style={{ transformOrigin: '50px 10px', animation: 'dizzySpin 1.4s linear infinite' }}>
          <text x="32" y="14" fontSize="9" fill="#ffdd00" fontFamily="monospace">★</text>
          <text x="52" y="8" fontSize="7" fill="#ff8800" fontFamily="monospace">✦</text>
          <text x="64" y="14" fontSize="9" fill="#ffdd00" fontFamily="monospace">★</text>
        </g>

        {/* ── Whole body swaying ── */}
        <g style={{ transformOrigin: '50px 90px', animation: 'hangoverSway 2.8s ease-in-out infinite' }}>

          {/* Messy hair */}
          <rect x="29" y="18" width="42" height="14" rx="2" fill="#221408" />
          <rect x="27" y="20" width="8"  height="12" rx="2" fill="#2a1a0a" />
          <rect x="65" y="19" width="9"  height="11" rx="2" fill="#2a1a0a" />
          <rect x="37" y="12" width="7"  height="11" rx="2" fill="#1e1206" />
          <rect x="50" y="10" width="6"  height="10" rx="2" fill="#2a1a0a" />
          <rect x="58" y="13" width="5"  height="8"  rx="2" fill="#221408" />

          {/* Head — sickly pale yellowish green */}
          <rect x="29" y="26" width="42" height="40" rx="4" fill="#b8c870" />

          {/* Cheek flush (green/sallow) */}
          <rect x="30" y="46" width="9"  height="6" rx="3" fill="#98aa4a" opacity="0.55" />
          <rect x="61" y="46" width="9"  height="6" rx="3" fill="#98aa4a" opacity="0.55" />

          {/* ── Face dirt & smudges ── */}
          <rect x="32" y="28" width="9"  height="5" rx="2" fill="#5a3a10" opacity="0.55" />
          <rect x="38" y="32" width="5"  height="3" rx="1" fill="#4a2e0a" opacity="0.5" />
          <rect x="60" y="30" width="7"  height="4" rx="2" fill="#5a3a10" opacity="0.5" />
          <rect x="55" y="35" width="4"  height="3" rx="1" fill="#4a2e0a" opacity="0.45" />
          <rect x="44" y="27" width="6"  height="3" rx="1" fill="#5a3a10" opacity="0.4" />
          <rect x="35" y="55" width="8"  height="4" rx="2" fill="#6a4010" opacity="0.5" />
          <rect x="58" y="52" width="6"  height="5" rx="2" fill="#5a3a10" opacity="0.45" />
          <rect x="47" y="58" width="5"  height="3" rx="1" fill="#4a2e0a" opacity="0.5" />
          {/* brown smear across nose bridge */}
          <rect x="42" y="43" width="16" height="3" rx="1" fill="#6b4010" opacity="0.4" />

          {/* Left eye — heavy droopy lid */}
          <rect x="33" y="36" width="13" height="7" rx="1" fill="#d8d090" />
          <rect x="35" y="39" width="9"  height="4" rx="1" fill="#1a1208" />
          <rect x="36" y="40" width="3"  height="2" fill="#fff" opacity="0.5" />
          <rect x="33" y="36" width="13" height="5" rx="1" fill="#a8b858" /> {/* heavy lid */}
          <rect x="33" y="43" width="13" height="3" rx="1" fill="#8a9a40" opacity="0.7" /> {/* bag */}

          {/* Right eye — half closed */}
          <rect x="54" y="36" width="13" height="7" rx="1" fill="#d8d090" />
          <rect x="56" y="39" width="9"  height="4" rx="1" fill="#1a1208" />
          <rect x="63" y="40" width="3"  height="2" fill="#fff" opacity="0.5" />
          <rect x="54" y="36" width="13" height="5" rx="1" fill="#a8b858" />
          <rect x="54" y="43" width="13" height="3" rx="1" fill="#8a9a40" opacity="0.7" />

          {/* Nose */}
          <rect x="47" y="48" width="7" height="7" rx="2" fill="#a0b058" />
          <rect x="45" y="52" width="4" height="3" rx="1" fill="#889040" />
          <rect x="51" y="52" width="4" height="3" rx="1" fill="#889040" />

          {/* Mouth — deep frown, queasy */}
          <rect x="37" y="60" width="26" height="3" rx="1" fill="#7a8830" />
          <rect x="36" y="57" width="5"  height="6" rx="1" fill="#7a8830" />
          <rect x="59" y="57" width="5"  height="6" rx="1" fill="#7a8830" />

          {/* Sweat drops */}
          <rect x="28" y="30" width="4" height="7" rx="2" fill="#99ccee" opacity="0.85"
            style={{ animation: 'sweatDrip 1.6s ease-in infinite' }} />
          <rect x="69" y="34" width="3" height="6" rx="2" fill="#99ccee" opacity="0.75"
            style={{ animation: 'sweatDrip 1.6s ease-in 0.7s infinite' }} />

          {/* Sad tears — only when clicked */}
          {sad && <>
            <rect x="37" y="43" width="4" height="10" rx="2" fill="#66aaff" opacity="0.9"
              style={{ animation: 'sweatDrip 0.7s ease-in infinite' }} />
            <rect x="38" y="52" width="4" height="8"  rx="2" fill="#66aaff" opacity="0.75"
              style={{ animation: 'sweatDrip 0.7s ease-in 0.25s infinite' }} />
            <rect x="58" y="43" width="4" height="10" rx="2" fill="#66aaff" opacity="0.9"
              style={{ animation: 'sweatDrip 0.7s ease-in 0.1s infinite' }} />
            <rect x="59" y="52" width="4" height="8"  rx="2" fill="#66aaff" opacity="0.75"
              style={{ animation: 'sweatDrip 0.7s ease-in 0.35s infinite' }} />
          </>}

          {/* Neck */}
          <rect x="44" y="64" width="12" height="11" rx="1" fill="#aaba68" />

          {/* Shirt — wrinkled, stained gray */}
          <rect x="20" y="73" width="60" height="48" rx="3" fill="#3e3c4a" />
          <rect x="39" y="73" width="22" height="7" rx="1" fill="#32303e" /> {/* collar */}
          <rect x="34" y="82" width="3"  height="32" rx="1" fill="#323040" opacity="0.5" />
          <rect x="50" y="80" width="2"  height="36" rx="1" fill="#323040" opacity="0.4" />
          <rect x="62" y="84" width="3"  height="28" rx="1" fill="#323040" opacity="0.5" />
          {/* ── Shirt dirt & poop stains ── */}
          <rect x="44" y="95" width="14" height="9"  rx="3" fill="#2a2830" opacity="0.6" />
          <rect x="28" y="88" width="10" height="7"  rx="3" fill="#6b3a08" opacity="0.65" />
          <rect x="30" y="93" width="6"  height="4"  rx="2" fill="#7a4410" opacity="0.55" />
          <rect x="60" y="82" width="12" height="8"  rx="3" fill="#5a3008" opacity="0.6" />
          <rect x="65" y="88" width="7"  height="5"  rx="2" fill="#6b3a08" opacity="0.5" />
          <rect x="40" y="108" width="18" height="7" rx="3" fill="#6b3a08" opacity="0.7" />
          <rect x="50" y="112" width="8"  height="4" rx="2" fill="#7a4410" opacity="0.55" />
          <rect x="24" y="100" width="8"  height="6" rx="2" fill="#5a3008" opacity="0.5" />
          <rect x="68" y="98" width="9"  height="5"  rx="2" fill="#6b3a08" opacity="0.55" />
          {/* big poop smear center chest */}
          <rect x="43" y="78" width="16" height="6"  rx="2" fill="#7a4410" opacity="0.6" />
          <rect x="46" y="82" width="10" height="4"  rx="2" fill="#5a2e08" opacity="0.55" />

          {/* Left arm — elbow on knee, hand on forehead */}
          <rect x="10" y="76" width="12" height="35" rx="3" fill="#3e3c4a" />
          <rect x="6"  y="66" width="18" height="13" rx="3" fill="#b0bc6a" /> {/* hand on head */}

          {/* Right arm — hanging limp */}
          <rect x="78" y="76" width="12" height="42" rx="3" fill="#3e3c4a" />
          <rect x="76" y="113" width="16" height="9" rx="2" fill="#b0bc6a" />

          {/* Pants — slumped sit */}
          <rect x="18" y="119" width="64" height="20" rx="2" fill="#22284a" />
          <rect x="12" y="134" width="28" height="14" rx="2" fill="#22284a" />
          <rect x="60" y="134" width="28" height="14" rx="2" fill="#22284a" />
          {/* pants dirt */}
          <rect x="22" y="122" width="14" height="7" rx="2" fill="#6b3a08" opacity="0.55" />
          <rect x="56" y="124" width="10" height="6" rx="2" fill="#5a3008" opacity="0.5" />
          <rect x="38" y="120" width="8"  height="5" rx="2" fill="#6b3a08" opacity="0.45" />
          <rect x="14" y="136" width="10" height="5" rx="2" fill="#6b3a08" opacity="0.5" />
          <rect x="72" y="138" width="10" height="4" rx="2" fill="#5a3008" opacity="0.5" />

          {/* Shoes */}
          <rect x="8"  y="146" width="34" height="7" rx="2" fill="#141008" />
          <rect x="58" y="146" width="34" height="7" rx="2" fill="#141008" />
          {/* mud on shoes */}
          <rect x="8"  y="146" width="14" height="7" rx="2" fill="#5a3a10" opacity="0.5" />
          <rect x="70" y="146" width="12" height="7" rx="2" fill="#5a3a10" opacity="0.45" />

        </g>

        {/* ── Bottles on floor (not swaying) ── */}
        {/* Green bottle */}
        <rect x="1"  y="128" width="5"  height="4"  rx="1" fill="#1a4a1a" />
        <rect x="0"  y="124" width="4"  height="5"  rx="1" fill="#1a4a1a" />
        <rect x="-1" y="131" width="13" height="22" rx="2" fill="#226622" />
        <rect x="1"  y="140" width="9"  height="8"  rx="1" fill="#1a5018" opacity="0.6" />

        {/* Tipped-over can */}
        <rect x="84" y="138" width="20" height="12" rx="2" fill="#cc8820" />
        <rect x="84" y="138" width="5"  height="12" rx="1" fill="#ddaa30" />
        <rect x="99" y="138" width="5"  height="12" rx="1" fill="#aa6810" />
        <rect x="86" y="140" width="14" height="8"  rx="0" fill="#ee9922" opacity="0.3" />

        {/* Puddle under can */}
        <ellipse cx="94" cy="150" rx="14" ry="3" fill="#aa6010" opacity="0.35" />

      </svg>
    </div>
  )
}

function PoopPile({ size = 1, style = {} }) {
  const s = size
  return (
    <div style={{ pointerEvents: 'none', ...style }}>
      <svg width={52 * s} height={44 * s} viewBox="0 0 52 44" style={{ display: 'block', imageRendering: 'pixelated' }}>
        {/* base mound */}
        <ellipse cx="26" cy="38" rx="22" ry="7" fill="#3d1f00" />
        {/* tier 1 */}
        <ellipse cx="26" cy="32" rx="16" ry="9" fill="#5a2d00" />
        {/* tier 2 */}
        <ellipse cx="26" cy="22" rx="11" ry="8" fill="#6b3600" />
        {/* tier 3 / swirl top */}
        <ellipse cx="26" cy="14" rx="7"  ry="7" fill="#7a3e00" />
        <ellipse cx="26" cy="9"  rx="4"  ry="5" fill="#7a3e00" />
        <ellipse cx="28" cy="5"  rx="3"  ry="3" fill="#8a4800" />
        {/* shine */}
        <ellipse cx="22" cy="30" rx="4" ry="2" fill="#7a4a10" opacity="0.5" />
        {/* flies */}
        <rect x="8"  y="10" width="3" height="2" rx="1" fill="#111" opacity="0.7" />
        <rect x="40" y="14" width="3" height="2" rx="1" fill="#111" opacity="0.7" />
      </svg>
    </div>
  )
}

function Boombox({ onClick, isSlowed }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: '63%',
        bottom: '15%',
        zIndex: 4,
        cursor: 'pointer',
      }}
    >
      {/* Label sits outside the animated wrapper so it doesn't inherit rotation */}
      {isSlowed && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 6,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 6,
          color: '#cc99ff',
          textShadow: '0 0 8px #aa88ff, 0 0 20px #8844cc',
          whiteSpace: 'nowrap',
          fontSize: 10,
          letterSpacing: 2,
        }}>SLOWED</div>
      )}

      {/* Animated wrapper */}
      <div style={{ animation: `boomboxBob ${isSlowed ? '1.4s' : '0.55s'} ease-in-out infinite` }}>
      {/* Floating music notes */}
      <div style={{ position:'absolute', top:-36, left:18, fontFamily:'monospace', fontSize:16, color:'#ffcc00', textShadow:'0 0 6px #ffaa00', animation:'musicNoteFloat 1.6s ease-out infinite' }}>♪</div>
      <div style={{ position:'absolute', top:-28, left:50, fontFamily:'monospace', fontSize:13, color:'#ff8800', textShadow:'0 0 6px #ff6600', animation:'musicNoteFloat 1.6s ease-out 0.55s infinite' }}>♫</div>
      <div style={{ position:'absolute', top:-40, left:72, fontFamily:'monospace', fontSize:11, color:'#ffcc00', textShadow:'0 0 6px #ffaa00', animation:'musicNoteFloat 1.6s ease-out 1.1s infinite' }}>♪</div>

      <svg width="120" height="80" viewBox="0 0 120 80" style={{ display:'block', imageRendering:'pixelated' }}>
        {/* Handle */}
        <rect x="42" y="2"  width="36" height="6" rx="3" fill="#2a2a2a" />
        <rect x="38" y="6"  width="5"  height="12" rx="2" fill="#333" />
        <rect x="77" y="6"  width="5"  height="12" rx="2" fill="#333" />

        {/* Antenna */}
        <rect x="104" y="1" width="3" height="20" rx="1" fill="#444" />
        <ellipse cx="105" cy="1" rx="3" ry="3" fill="#ff2200" />

        {/* Body */}
        <rect x="4"  y="16" width="112" height="58" rx="4" fill="#1a1a1a" />
        <rect x="6"  y="18" width="108" height="54" rx="3" fill="#242424" />
        {/* top highlight */}
        <rect x="6"  y="18" width="108" height="3"  rx="2" fill="#333" opacity="0.6" />

        {/* Left speaker */}
        <rect x="8"  y="21" width="34" height="46" rx="3" fill="#111" />
        <circle cx="25" cy="44" r="14" fill="#0d0d0d" />
        <circle cx="25" cy="44" r="11" fill="#111" stroke="#2a2a2a" strokeWidth="1.5" />
        <circle cx="25" cy="44" r="7"  fill="#0d0d0d" />
        <circle cx="25" cy="44" r="4"  fill="#1a1a1a" />
        <circle cx="25" cy="44" r="1.5" fill="#444" />

        {/* Right speaker */}
        <rect x="78" y="21" width="34" height="46" rx="3" fill="#111" />
        <circle cx="95" cy="44" r="14" fill="#0d0d0d" />
        <circle cx="95" cy="44" r="11" fill="#111" stroke="#2a2a2a" strokeWidth="1.5" />
        <circle cx="95" cy="44" r="7"  fill="#0d0d0d" />
        <circle cx="95" cy="44" r="4"  fill="#1a1a1a" />
        <circle cx="95" cy="44" r="1.5" fill="#444" />

        {/* Center panel */}
        <rect x="44" y="21" width="32" height="46" rx="2" fill="#1c1c1c" />

        {/* Tape deck window */}
        <rect x="47" y="24" width="26" height="18" rx="2" fill="#0a0a0a" />
        <rect x="48" y="25" width="24" height="16" rx="1" fill="#111" />
        {/* tape reels */}
        <circle cx="54" cy="33" r="5" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        <circle cx="54" cy="33" r="2" fill="#333" />
        <circle cx="66" cy="33" r="5" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        <circle cx="66" cy="33" r="2" fill="#333" />
        {/* tape between reels */}
        <rect x="56" y="35" width="8" height="2" rx="1" fill="#222" />

        {/* LCD display */}
        <rect x="47" y="45" width="26" height="8" rx="1" fill="#002200" />
        <rect x="48" y="46" width="7"  height="6" fill="#00cc00" opacity="0.9" />
        <rect x="56" y="46" width="5"  height="6" fill="#009900" opacity="0.7" />
        <rect x="62" y="46" width="7"  height="6" fill="#00cc00" opacity="0.9" />
        <rect x="70" y="46" width="2"  height="6" fill="#007700" opacity="0.5" />

        {/* Buttons */}
        <rect x="47" y="56" width="5" height="4" rx="1" fill="#cc0000" />
        <rect x="54" y="56" width="5" height="4" rx="1" fill="#2a2a2a" />
        <rect x="61" y="56" width="5" height="4" rx="1" fill="#2a2a2a" />
        <rect x="68" y="56" width="5" height="4" rx="1" fill="#2a2a2a" />

        {/* Volume knob */}
        <circle cx="60" cy="65" rx="5" ry="5" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        <rect x="59" y="61" width="2" height="4" rx="1" fill="#555" />
      </svg>
      </div>{/* end animated wrapper */}
    </div>
  )
}

function InsideScene({ onExit, onBoomboxClick, insideTrack }) {
  const [exitHovered, setExitHovered] = useState(false)
  const [poodleClicks, setPoodleClicks] = useState(0)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>

      {/* ── Background photo ── */}
      <img
        src="/images/insidebg.jpg"
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 40%',
          imageRendering: 'pixelated',
          filter: 'brightness(0.85) saturate(0.6) contrast(1.3) sepia(0.2)',
        }}
      />

      {/* ── Pixelation / dither grid overlay ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage:
          'linear-gradient(transparent 3px, rgba(0,0,0,0.06) 3px), ' +
          'linear-gradient(90deg, transparent 3px, rgba(0,0,0,0.06) 3px)',
        backgroundSize: '4px 4px',
        pointerEvents: 'none', zIndex: 1,
      }}/>

      {/* ── Vignette ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.82) 100%)',
        pointerEvents: 'none', zIndex: 2,
      }}/>

      {/* ── Scanline flicker ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.13) 0px, rgba(0,0,0,0.13) 1px, transparent 1px, transparent 3px)',
        pointerEvents: 'none', zIndex: 3,
      }}/>

      {/* ── Exit door hitbox (the front windows/door area on the left) ── */}
      <div
        onMouseEnter={() => setExitHovered(true)}
        onMouseLeave={() => setExitHovered(false)}
        onClick={onExit}
        style={{
          position: 'absolute',
          left: '2%', top: '20%',
          width: '18%', height: '55%',
          cursor: exitHovered ? 'pointer' : 'default',
          border: exitHovered ? '2px solid rgba(255,160,30,0.7)' : '2px solid transparent',
          background: exitHovered ? 'rgba(255,140,0,0.08)' : 'transparent',
          boxShadow: exitHovered ? 'inset 0 0 24px rgba(255,140,0,0.15), 0 0 12px rgba(255,140,0,0.2)' : 'none',
          transition: 'all 0.15s ease',
          zIndex: 4,
        }}
      />

      {/* ── Exit hint — always visible, brighter on hover ── */}
      <div
        onMouseEnter={() => setExitHovered(true)}
        onMouseLeave={() => setExitHovered(false)}
        onClick={onExit}
        style={{
          position: 'absolute',
          left: '2%', top: '16%',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 8,
          color: exitHovered ? '#ff8800' : '#ff6600',
          textShadow: exitHovered ? '0 0 8px #ff8800' : '0 0 6px #ff4400',
          opacity: exitHovered ? 1 : 0.9,
          transition: 'all 0.15s ease',
          zIndex: 5,
          cursor: exitHovered ? 'pointer' : 'default',
        }}>[ EXIT ]</div>

      {/* ── Poop piles scattered around (Poodle has been busy) ── */}
      <PoopPile size={1.1} style={{ position:'absolute', left:'4%',  bottom:'8%',  zIndex:4 }} />
      <PoopPile size={0.7} style={{ position:'absolute', left:'12%', bottom:'6%',  zIndex:4 }} />
      <PoopPile size={1.3} style={{ position:'absolute', left:'22%', bottom:'7%',  zIndex:4 }} />
      <PoopPile size={0.6} style={{ position:'absolute', left:'34%', bottom:'5%',  zIndex:4 }} />
      <PoopPile size={0.9} style={{ position:'absolute', left:'68%', bottom:'8%',  zIndex:4 }} />
      <PoopPile size={1.2} style={{ position:'absolute', left:'78%', bottom:'6%',  zIndex:4 }} />
      <PoopPile size={0.7} style={{ position:'absolute', left:'88%', bottom:'9%',  zIndex:4 }} />
      <PoopPile size={0.5} style={{ position:'absolute', left:'92%', bottom:'5%',  zIndex:4 }} />
      <PoopPile size={0.8} style={{ position:'absolute', left:'8%',  bottom:'20%', zIndex:4 }} />
      <PoopPile size={0.6} style={{ position:'absolute', left:'82%', bottom:'22%', zIndex:4 }} />
      <PoopPile size={1.0} style={{ position:'absolute', left:'55%', bottom:'10%', zIndex:4 }} />

      <Boombox onClick={onBoomboxClick} isSlowed={insideTrack === 'slowed'} />

      <HangoverGuy onClicked={() => setPoodleClicks(c => c + 1)} />

      {/* ── Poodle click counter ── */}
      <div style={{
        position: 'absolute',
        top: '12%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 9,
        color: '#ff8800',
        textShadow: '0 0 8px #ff8800, 0 0 20px #ff4400',
        zIndex: 5,
        pointerEvents: 'none',
        textAlign: 'center',
        lineHeight: 2,
        border: '2px solid #ff440044',
        padding: '6px 12px',
        background: 'rgba(0,0,0,0.55)',
      }}>
        <div style={{ fontSize: 7, opacity: 0.7, marginBottom: 4 }}>POODLE ABUSE COUNT</div>
        <div style={{ fontSize: 20, color: '#ffcc00', textShadow: '0 0 12px #ffcc00' }}>
          {String(poodleClicks).padStart(3, '0')}
        </div>
      </div>

      {/* ── Location label ── */}
      <div style={{
        position: 'absolute',
        bottom: 18, right: 18,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 7,
        color: '#ff4400',
        textShadow: '0 0 8px #ff4400',
        opacity: 0.7,
        zIndex: 5,
        pointerEvents: 'none',
        letterSpacing: 1,
      }}>CLOWN EGGS GAS — INTERIOR</div>

    </div>
  )
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
let _pid = 0

export default function App() {
  const [room,        setRoom]        = useState('outside') // 'outside' | 'inside'
  const [roomFlash,   setRoomFlash]   = useState(false)
  const [puffCount,   setPuffCount]   = useState(0)
  const [isInhaling,  setIsInhaling]  = useState(false)
  const [particles,   setParticles]   = useState([])
  const [exhales,     setExhales]     = useState([])
  const [message,     setMessage]     = useState('')
  const [msgKey,      setMsgKey]      = useState(0)
  const [flashKey,    setFlashKey]    = useState(0)
  const [flashing,    setFlashing]    = useState(false)
  const [lightNew,    setLightNew]    = useState(false)
  const [shaking,     setShaking]     = useState(false)
  const [muted,       setMuted]       = useState(false)
  const [exhaleBlobs, setExhaleBlobs] = useState([])
  const [handPhase,     setHandPhase]     = useState('bob')
  const [leftHandPhase, setLeftHandPhase] = useState('rest')
  const [fizzBubbles,   setFizzBubbles]   = useState([])
  const [sipMessage,    setSipMessage]    = useState('')
  const [sipMsgKey,     setSipMsgKey]     = useState(0)
  const [sipCount,      setSipCount]      = useState(0)
  const cigDone = puffCount > 0 && puffCount % MAX_CIG_PUFFS === 0
  const { scale, portrait } = useViewport()

  // ── Background music ──────────────────────────
  const audioRef = useRef(null)
  const insideAudioRef = useRef(null)
  const insideSlowedRef = useRef(null)
  const [insideTrack, setInsideTrack] = useState('normal')
  const puffAudioRef = useRef(null)
  const slurpAudioRef = useRef(null)
  const burpAudioRef = useRef(null)
  const coughAudioRef = useRef(null)
  const audioStarted = useRef(false)
  const roomRef      = useRef('outside') // mirrors `room` for use in closures

  // Keep roomRef in sync
  useEffect(() => { roomRef.current = room }, [room])

  const startAudio = useCallback(() => {
    if (audioStarted.current || !audioRef.current) return
    if (roomRef.current !== 'outside') return
    audioStarted.current = true
    audioRef.current.play().catch(() => {})
  }, [])

  // Swap music when room changes — hard-stop whichever track should be silent
  useEffect(() => {
    const outside = audioRef.current
    const normal  = insideAudioRef.current
    const slowed  = insideSlowedRef.current
    if (!outside || !normal) return
    if (room === 'inside') {
      outside.pause()
      outside.currentTime = 0
      const activeInside = insideTrack === 'slowed' && slowed ? slowed : normal
      activeInside.currentTime = 0
      activeInside.volume = 0.2
      activeInside.play().catch(() => {})
    } else {
      normal.pause()
      normal.currentTime = 0
      if (slowed) { slowed.pause(); slowed.currentTime = 0 }
      outside.volume = 0.45
      outside.play().catch(() => {})
    }
  }, [room])

  const handleBoomboxClick = useCallback(() => {
    const normal = insideAudioRef.current
    const slowed = insideSlowedRef.current
    if (!normal || !slowed) return
    if (insideTrack === 'normal') {
      normal.pause()
      slowed.currentTime = 0
      slowed.volume = 0.2
      slowed.play().catch(() => {})
      setInsideTrack('slowed')
    } else {
      slowed.pause()
      normal.currentTime = 0
      normal.volume = 0.2
      normal.play().catch(() => {})
      setInsideTrack('normal')
    }
  }, [insideTrack])

  // Try autoplay on mount; browsers may block it — fall back to first interaction.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.45
    audio.play().then(() => {
      audioStarted.current = true
    }).catch(() => {
      // Blocked by browser — start on first user interaction, but only if outside
      const unlock = () => {
        if (audioStarted.current) return
        audioStarted.current = true
        if (roomRef.current === 'outside') {
          audio.play().catch(() => {})
        }
        window.removeEventListener('click', unlock)
        window.removeEventListener('keydown', unlock)
        window.removeEventListener('touchstart', unlock)
      }
      window.addEventListener('click', unlock)
      window.addEventListener('keydown', unlock)
      window.addEventListener('touchstart', unlock)
    })
  }, [])

  // Ember position: SVG 400×640, bottom: -150px
  // Div top = vh + 150 - 640 = vh - 490. Ember at SVG (168, 30).
  // X: centre of div = vw/2 - 200; ember offset 168px → vw/2 - 200 + 168 = vw/2 - 32
  // Y: (vh - 490) + 30 = vh - 460
  const calcEmberX = () => window.innerWidth  / 2 - 32
  const calcEmberY = () => window.innerHeight - 460
  const EMBER_X = useRef(calcEmberX())
  const EMBER_Y = useRef(calcEmberY())

  useEffect(() => {
    const onResize = () => {
      EMBER_X.current = calcEmberX()
      EMBER_Y.current = calcEmberY()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Idle smoke drip
  useEffect(() => {
    const iv = setInterval(() => {
      if (cigDone) return
      setParticles(prev => [
        ...prev,
        { id: ++_pid, x: EMBER_X.current + (Math.random() - 0.5) * 12, y: EMBER_Y.current, big: false },
      ])
    }, 700)
    return () => clearInterval(iv)
  }, [cigDone])

  const removeParticle = useCallback(id => {
    setParticles(prev => prev.filter(p => p.id !== id))
  }, [])

  const removeExhale = useCallback(id => {
    setExhales(prev => prev.filter(e => e.id !== id))
  }, [])

  const removeBlob = useCallback(id => {
    setExhaleBlobs(prev => prev.filter(b => b.id !== id))
  }, [])

  const removeFizz = useCallback(id => {
    setFizzBubbles(prev => prev.filter(f => f.id !== id))
  }, [])

  const handleSip = useCallback(() => {
    startAudio()
    if (slurpAudioRef.current) {
      slurpAudioRef.current.currentTime = 0
      slurpAudioRef.current.volume = 0.35
      slurpAudioRef.current.play().catch(() => {})
    }
    setSipCount(c => {
      const next = c + 1
      if (next % 3 === 0 && burpAudioRef.current) {
        setTimeout(() => {
          burpAudioRef.current.currentTime = 0
          burpAudioRef.current.play().catch(() => {})
        }, 600)
      }
      return next
    })
    setLeftHandPhase('sip')
    // Can top-center after rotate(25deg) around div bottom-center (screen x=110):
    // unrotated: (100, H-378), rotated result: (~307, H-336)
    const canX = 307
    const canY = window.innerHeight - 336
    const bubbles = Array.from({ length: 14 }, () => ({
      id: ++_pid,
      x: canX + (Math.random() - 0.5) * 28,
      y: canY + Math.random() * 10,
    }))
    setFizzBubbles(prev => [...prev, ...bubbles])
    setSipMessage(SIP_MESSAGES[Math.floor(Math.random() * SIP_MESSAGES.length)])
    setSipMsgKey(k => k + 1)
    setTimeout(() => setLeftHandPhase('return'), 240)
    setTimeout(() => setLeftHandPhase('rest'),   240 + 500)
  }, [startAudio])

  const spawnExhaleBlobs = useCallback(() => {
    const cx = window.innerWidth  / 2
    const cy = window.innerHeight * 0.44
    const hw = window.innerWidth  / 2
    const hh = window.innerHeight / 2

    // 10 fast regular blobs — burst outward
    const burst = Array.from({ length: 10 }, () => ({
      id:       ++_pid,
      cx, cy,
      size:     Math.random() * 120 + 80,
      driftX:   (Math.random() - 0.5) * 700,
      driftY:   -(Math.random() * 380 + 80),
      dur:      Math.random() * 1.5 + 2.8,
      delay:    Math.random() * 0.5,
      opacity:  Math.random() * 0.25 + 0.35,
      animName: 'bigExhale',
    }))

    // 4 slow lingerers — one drifts toward each corner
    const corners = [
      { sx: -1, sy: -1 }, { sx:  1, sy: -1 },
      { sx: -1, sy:  1 }, { sx:  1, sy:  1 },
    ]
    const linger = corners.map(({ sx, sy }) => ({
      id:       ++_pid,
      cx, cy,
      size:     Math.random() * 80 + 120,           // larger, softer
      driftX:   sx * (hw * 0.85 + Math.random() * hw * 0.3),
      driftY:   sy * (hh * 0.75 + Math.random() * hh * 0.3),
      dur:      Math.random() * 2.5 + 5.5,          // 5.5–8s
      delay:    Math.random() * 0.8 + 0.2,
      opacity:  Math.random() * 0.12 + 0.18,        // subtle
      animName: 'smokeLinger',
    }))

    setExhaleBlobs(prev => [...prev, ...burst, ...linger])
  }, [])

  const handleSmoke = useCallback(() => {
    startAudio()   // no-op after first call

    // Puff sound — restart from beginning each click, exhale after 1s
    if (puffAudioRef.current) {
      puffAudioRef.current.currentTime = 0
      puffAudioRef.current.play().catch(() => {})
    }
    setTimeout(spawnExhaleBlobs, 1000)

    if (cigDone) {
      setLightNew(true)
      setTimeout(() => setLightNew(false), 500)
    }

    setIsInhaling(true)
    setHandPhase('inhale')
    setFlashing(true)
    setFlashKey(k => k + 1)

    // Big smoke burst
    const burst = Array.from({ length: 14 }, () => ({
      id: ++_pid,
      x: EMBER_X.current + (Math.random() - 0.5) * 30,
      y: EMBER_Y.current,
      big: true,
    }))
    setParticles(prev => [...prev, ...burst])

    // Exhale cloud near top center
    setExhales(prev => [
      ...prev,
      { id: ++_pid, x: window.innerWidth / 2 - 30, y: EMBER_Y.current - 20 },
    ])

    setPuffCount(prev => {
      const next = prev + 1
      const milestone = MILESTONE_MSGS[next]
      const msg = milestone || WEIRD_MESSAGES[Math.floor(Math.random() * WEIRD_MESSAGES.length)]
      setMessage(msg)
      setMsgKey(k => k + 1)
      if (milestone) {
        setShaking(true)
        setTimeout(() => setShaking(false), 700)
      }
      if (next % 3 === 0 && coughAudioRef.current) {
        setTimeout(() => {
          coughAudioRef.current.currentTime = 0
          coughAudioRef.current.play().catch(() => {})
        }, 800)
      }
      return next
    })

    setTimeout(() => { setIsInhaling(false); setFlashing(false); setHandPhase('return') }, 420)
    setTimeout(() => setHandPhase('bob'), 420 + 1200)
  }, [puffCount, cigDone])

  const toggleMute = useCallback(e => {
    e.stopPropagation()
    if (!audioRef.current) return
    const next = !muted
    audioRef.current.muted = next
    setMuted(next)
  }, [muted])

  return (
    <>
    {/* ── Audio — always mounted so music survives portrait/landscape switch ── */}
    <audio ref={audioRef} src="/sounds/bgmusic.mp3" loop preload="auto" />
    <audio ref={insideAudioRef} src="/sounds/Las Ketchup-bgmusic.mp3" loop preload="auto" />
    <audio ref={insideSlowedRef} src="/sounds/Las Ketchup-bgmusic-slowedandreverb.wav" loop preload="auto" />
    <audio ref={puffAudioRef} src="/sounds/puff_sound.ogg" preload="auto" />
    <audio ref={slurpAudioRef} src="/sounds/energyslurp.ogg" preload="auto" />
    <audio ref={burpAudioRef} src="/sounds/burp.ogg" preload="auto" />
    <audio ref={coughAudioRef} src="/sounds/coughing.ogg" preload="auto" />

    {portrait ? (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Press Start 2P', monospace",
        color: '#ff8800',
        textAlign: 'center',
        padding: 24,
        gap: 20,
      }}>
        <div style={{ fontSize: 48 }}>&#x21BB;</div>
        <div style={{ fontSize: 11, lineHeight: 2 }}>ROTATE YOUR<br/>DEVICE</div>
        <div style={{ fontSize: 7, color: '#664400', lineHeight: 2 }}>THIS EXPERIENCE IS<br/>LANDSCAPE ONLY</div>
      </div>
    ) : (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
    {/* Scale wrapper — shrinks the entire scene on smaller screens */}
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width:  `${100 / scale}vw`,
        height: `${100 / scale}vh`,
        transformOrigin: '0 0',
        transform: `scale(${scale})`,
      }}
    >
    <div
      style={{
        position: 'fixed',
        inset: 0,
        cursor: 'default',
        userSelect: 'none',
        animation: shaking ? 'screenShake 0.7s ease-out' : 'none',
      }}
    >

      {/* ── Mute toggle ── */}
      <button
        onClick={toggleMute}
        style={{
          position: 'fixed',
          top: 14,
          right: 14,
          zIndex: 100,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '9px',
          color: muted ? '#555' : '#ff8800',
          textShadow: muted ? 'none' : '0 0 6px #ff8800',
          background: 'rgba(0,0,0,0.75)',
          border: `2px solid ${muted ? '#333' : '#ff8800'}`,
          padding: '6px 10px',
          cursor: 'pointer',
          letterSpacing: 1,
        }}
      >
        {muted ? '[ MUTED ]' : '[ MUSIC ]'}
      </button>

      {room === 'outside'
        ? <Scene isInhaling={isInhaling} puffCount={puffCount} onEnterDoor={() => {
            setRoomFlash(true)
            setTimeout(() => { setRoom('inside'); setRoomFlash(false) }, 400)
          }} />
        : <InsideScene
            onExit={() => {
              setRoomFlash(true)
              setTimeout(() => { setRoom('outside'); setRoomFlash(false) }, 400)
            }}
            onBoomboxClick={handleBoomboxClick}
            insideTrack={insideTrack}
          />
      }
      {roomFlash && <div style={{ position:'fixed', inset:0, background:'#000', zIndex:999, opacity:1, pointerEvents:'none' }}/>}

      {/* Idle + burst smoke particles */}
      {room === 'outside' && particles.map(p => (
        <SmokeParticle
          key={p.id}
          x={p.x}
          y={p.y}
          big={p.big}
          onDone={() => removeParticle(p.id)}
        />
      ))}

      {/* Exhale clouds */}
      {room === 'outside' && exhales.map(e => (
        <ExhaleCloud
          key={e.id}
          id={e.id}
          x={e.x}
          y={e.y}
          onDone={() => removeExhale(e.id)}
        />
      ))}

      {room === 'outside' && exhaleBlobs.map(b => (
        <ExhaleBlob
          key={b.id}
          cx={b.cx}
          cy={b.cy}
          size={b.size}
          driftX={b.driftX}
          driftY={b.driftY}
          dur={b.dur}
          delay={b.delay}
          opacity={b.opacity}
          animName={b.animName}
          onDone={() => removeBlob(b.id)}
        />
      ))}

      {room === 'outside' && <WeirdFilters puffCount={puffCount} />}
      {room === 'outside' && <FrownyLayer  puffCount={puffCount} />}

      {room === 'outside' && (
        <Hand
          handPhase={handPhase}
          puffCount={puffCount % MAX_CIG_PUFFS === 0 && puffCount > 0 ? 0 : puffCount % MAX_CIG_PUFFS}
          lightNew={lightNew}
          onClick={handleSmoke}
        />
      )}

      {room === 'outside' && <LeftHand leftHandPhase={leftHandPhase} onClick={handleSip} />}

      {room === 'outside' && fizzBubbles.map(f => (
        <FizzBubble key={f.id} x={f.x} y={f.y} onDone={() => removeFizz(f.id)} />
      ))}

      {room === 'outside' && sipMessage && (
        <div
          key={sipMsgKey}
          style={{
            position: 'fixed',
            bottom: sipMessage.length > 100 ? 160 : 260,
            left: '22%',
            width: sipMessage.length > 100 ? '45vw' : 'auto',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: sipMessage.length > 300 ? 6 : sipMessage.length > 100 ? 7 : 9,
            lineHeight: 1.8,
            color: '#00ff88',
            textShadow: '0 0 12px #00ff88, 0 0 24px #00aa44',
            animation: 'sipMessageFloat 7s ease-out forwards',
            whiteSpace: sipMessage.length > 100 ? 'normal' : 'nowrap',
            pointerEvents: 'none',
            zIndex: 80,
          }}
        >
          {sipMessage}
        </div>
      )}

      <CRTOverlay flashing={flashing} flashKey={flashKey} />

      {room === 'outside' && (
        <HUD
          puffCount={puffCount}
          sipCount={sipCount}
          message={message}
          msgKey={msgKey}
          cigDone={cigDone}
        />
      )}
    </div>
    </div>
    </div>
    )}
    </>
  )
}
