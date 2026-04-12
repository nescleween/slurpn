import React, { useState, useEffect, useRef, useCallback } from 'react'

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const PIXEL = 8 // base pixel size for art
const MAX_CIG_PUFFS = 88 // puffs before cig is done
const CIG_BODY_HEIGHT = 176 // 88 * 2px per puff

const WEIRD_MESSAGES = [
  'INHALE THE TRUTH',
  'BIG TOBACCO KNOWS',
  'THE FILTER IS A LIE',
  'PUFF PUFF WAKE UP',
  'GAS STATION PROPHECY',
  'THEY PUT SOMETHING IN IT',
  'THE SMOKE SPEAKS TO YOU',
  'NICOTINE = SIGNAL BOOST',
  'BREATHE IN THE DATA',
  'THE SURVEILLANCE SEES YOU',
  'EVERY PUFF A TRANSMISSION',
  'THE PUMPS NEVER RUN DRY',
  'YOUR LUNGS ARE THEIRS NOW',
  'CHEMTRAILS: LOCAL EDITION',
  'THE CLERK IS WATCHING',
  'IT KNOWS WHERE YOU LIVE',
  'CARBON COPY OF YOUR SOUL',
  'GAS PRICE = MIND PRICE',
]

const MILESTONE_MSGS = {
  10:  '>>> THEY NOTICED YOU <<<',
  25:  '>>> SIGNAL ACQUIRED <<<',
  50:  '>>> FULL TRANSMISSION <<<',
  75:  '>>> YOU ARE FREQUENCY <<<',
}

let particleId = 0

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
// THE PIXEL ART HAND + CIGARETTE
// ─────────────────────────────────────────────
function Hand({ isInhaling, puffCount, ligthNew }) {
  const puffs = Math.min(puffCount, MAX_CIG_PUFFS)
  const cigUsed   = puffs * 2                          // px consumed
  const cigLen    = CIG_BODY_HEIGHT - cigUsed          // remaining white part
  const ashLen    = Math.min(puffs * 1.5, 28)         // ash grows
  const filterY   = 30 + ashLen + Math.max(cigLen, 0) // filter slides up
  const emberY    = 0                                  // ember stays at top

  const animStyle = isInhaling
    ? { animation: 'handInhale 0.4s ease-out forwards' }
    : { animation: 'handBob 3s ease-in-out infinite' }

  if (ligthNew) {
    // brief flash of "new cig" — just show normal hand fully
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '-70px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        width: '340px',
        pointerEvents: 'none',
        ...animStyle,
      }}
    >
      <svg
        width="340"
        height="540"
        viewBox="0 0 340 540"
        style={{ imageRendering: 'pixelated', display: 'block' }}
        shapeRendering="crispEdges"
      >
        {/* ── EMBER ── */}
        {cigLen > 0 && (
          <g style={{ animation: isInhaling ? 'emberBright 0.1s ease infinite' : 'emberPulse 0.8s ease-in-out infinite' }}>
            {/* outer glow */}
            <rect x="146" y={emberY + 6}  width="28" height="20" fill="#ff6600" opacity="0.25" />
            <rect x="150" y={emberY + 4}  width="20" height="18" fill="#ff8800" opacity="0.45" />
            {/* core */}
            <rect x="154" y={emberY}      width="12" height="8"  fill="#ffdd00" />
            <rect x="152" y={emberY + 6}  width="16" height="10" fill="#ff5500" />
            <rect x="150" y={emberY + 12} width="20" height="8"  fill="#cc2200" />
          </g>
        )}

        {/* ── ASH ── */}
        {ashLen > 0 && cigLen > 0 && (
          <>
            <rect x="155" y={emberY + 18}              width="10" height={Math.min(ashLen * 0.6, 10)} fill="#cccccc" />
            <rect x="156" y={emberY + 18 + Math.min(ashLen * 0.6, 10)} width="8"  height={Math.min(ashLen * 0.4, 18)} fill="#aaaaaa" />
          </>
        )}

        {/* ── CIGARETTE BODY ── */}
        {cigLen > 0 && (
          <>
            <rect x="155" y={30}           width="10" height={cigLen}  fill="#f0eed8" />
            <rect x="154" y={32}           width="1"  height={cigLen - 2} fill="#e0dccc" />
            <rect x="165" y={32}           width="1"  height={cigLen - 2} fill="#e8e4d0" />
          </>
        )}

        {/* ── FILTER ── */}
        <rect x="153" y={filterY}      width="14" height="5"  fill="#ddb070" />
        <rect x="153" y={filterY + 5}  width="14" height="36" fill="#c89050" />
        <rect x="153" y={filterY + 38} width="14" height="5"  fill="#b07830" />

        {/* ════ FINGERS ════ */}

        {/* MIDDLE FINGER — left of cig */}
        <rect x="100" y="56"  width="56" height="16" fill="#f8c888" />  {/* nail */}
        <rect x="100" y="70"  width="56" height="24" fill="#f5b870" />
        <rect x="98"  y="94"  width="58" height="28" fill="#f5b870" />
        <rect x="96"  y="120" width="60" height="32" fill="#f5b870" />
        <rect x="94"  y="150" width="62" height="30" fill="#f5b870" />
        <rect x="92"  y="178" width="64" height="30" fill="#f0ad66" />  {/* knuckle area */}
        <rect x="90"  y="206" width="66" height="28" fill="#e8a45e" />
        {/* shadow lines */}
        <rect x="100" y="56"  width="2"  height="152" fill="#c87030" opacity="0.4" />
        <rect x="152" y="56"  width="2"  height="152" fill="#c87030" opacity="0.4" />

        {/* INDEX FINGER — right of cig */}
        <rect x="184" y="44"  width="52" height="16" fill="#f8c888" />  {/* nail */}
        <rect x="184" y="58"  width="52" height="24" fill="#f5b870" />
        <rect x="182" y="82"  width="54" height="28" fill="#f5b870" />
        <rect x="180" y="110" width="56" height="32" fill="#f5b870" />
        <rect x="178" y="140" width="58" height="30" fill="#f5b870" />
        <rect x="176" y="168" width="60" height="30" fill="#f0ad66" />
        <rect x="174" y="196" width="62" height="30" fill="#e8a45e" />
        {/* shadow lines */}
        <rect x="184" y="44"  width="2"  height="152" fill="#c87030" opacity="0.4" />
        <rect x="232" y="44"  width="2"  height="152" fill="#c87030" opacity="0.4" />

        {/* RING FINGER */}
        <rect x="40"  y="72"  width="60" height="16" fill="#f8c888" />
        <rect x="40"  y="86"  width="60" height="24" fill="#eba060" />
        <rect x="38"  y="108" width="62" height="28" fill="#eba060" />
        <rect x="36"  y="134" width="64" height="32" fill="#e89858" />
        <rect x="34"  y="164" width="66" height="30" fill="#e49050" />
        <rect x="32"  y="192" width="68" height="30" fill="#e08848" />
        <rect x="30"  y="220" width="70" height="28" fill="#d88040" />

        {/* PINKY */}
        <rect x="0"   y="112" width="40" height="14" fill="#f8c888" />
        <rect x="0"   y="124" width="40" height="22" fill="#e8a060" />
        <rect x="0"   y="144" width="40" height="26" fill="#e49858" />
        <rect x="0"   y="168" width="42" height="28" fill="#e09050" />
        <rect x="0"   y="194" width="44" height="28" fill="#dc8848" />
        <rect x="0"   y="220" width="46" height="28" fill="#d88040" />

        {/* THUMB */}
        <rect x="258" y="172" width="44" height="14" fill="#f8c888" />
        <rect x="254" y="184" width="52" height="22" fill="#eba060" />
        <rect x="252" y="204" width="56" height="28" fill="#e89858" />
        <rect x="250" y="230" width="60" height="28" fill="#e49050" />
        <rect x="248" y="256" width="64" height="28" fill="#e08848" />

        {/* ── PALM ── */}
        <rect x="0"   y="245" width="340" height="295" fill="#c87030" />
        {/* palm top highlight */}
        <rect x="0"   y="240" width="340" height="20"  fill="#e89858" />
        <rect x="0"   y="256" width="340" height="6"   fill="#b06020" />
        {/* palm mid highlight */}
        <rect x="60"  y="290" width="200" height="50"  fill="#d88038" opacity="0.35" />
        {/* palm shadow bottom */}
        <rect x="0"   y="460" width="340" height="80"  fill="#9a4818" opacity="0.5" />

        {/* knuckle bumps */}
        <rect x="90"  y="238" width="64" height="10"   fill="#d8904a" />
        <rect x="174" y="228" width="60" height="10"   fill="#d8904a" />
        <rect x="30"  y="248" width="70" height="8"    fill="#d8904a" />
        <rect x="0"   y="260" width="46" height="6"    fill="#d8904a" />

        {/* ── DONE overlay: stub ── */}
        {cigLen <= 0 && (
          <rect x="148" y="0" width="44" height="10" fill="#888" opacity="0.7" />
        )}
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
// SCENE — background + decorative elements
// ─────────────────────────────────────────────
function Scene({ isInhaling, puffCount }) {
  const trippy = puffCount >= 40
  const buzzed  = puffCount >= 25

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>

      {/* ── Background photo ── */}
      <img
        src="/stationbg.jpg"
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
            src="/gasclips.mp4"
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
        <div style={{ marginBottom: 4, color: '#ff7700', letterSpacing: 2 }}>D_RRY</div>
        <div style={{ color: '#994400' }}>REG  $6.66</div>
        <div style={{ color: '#994400' }}>MID  $_.77</div>
        <div style={{ color: '#994400' }}>PRE  $8.88</div>
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
function HUD({ puffCount, message, msgKey, cigDone }) {
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
            animation: 'messageFloat 2.5s ease-out forwards',
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
// EXHALE CLOUD (big puff on click)
// ─────────────────────────────────────────────
function ExhaleCloud({ x, y, id, onDone }) {
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
// APP
// ─────────────────────────────────────────────
let _pid = 0

export default function App() {
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
  const cigDone = puffCount > 0 && puffCount % MAX_CIG_PUFFS === 0

  // Ember position: hand SVG is 540px tall, bottom: -70px
  // so top of SVG = vh - 540 + 70 = vh - 470; ember is at y≈10 inside SVG
  const calcEmberY = () => window.innerHeight - 460
  const EMBER_X = useRef(window.innerWidth  / 2)
  const EMBER_Y = useRef(calcEmberY())

  useEffect(() => {
    const onResize = () => {
      EMBER_X.current = window.innerWidth  / 2
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

  const handleSmoke = useCallback(() => {
    const realPuff = puffCount % MAX_CIG_PUFFS
    const isNewCig = cigDone || (puffCount === 0 && realPuff === 0 && puffCount > 0)

    if (cigDone) {
      // Light a new cigarette
      setLightNew(true)
      setTimeout(() => setLightNew(false), 500)
    }

    setIsInhaling(true)
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
      return next
    })

    setTimeout(() => { setIsInhaling(false); setFlashing(false) }, 550)
  }, [puffCount, cigDone])

  return (
    <div
      onClick={handleSmoke}
      style={{
        position: 'fixed',
        inset: 0,
        cursor: 'crosshair',
        userSelect: 'none',
        animation: shaking ? 'screenShake 0.7s ease-out' : 'none',
      }}
    >
      <Scene isInhaling={isInhaling} puffCount={puffCount} />

      {/* Idle + burst smoke particles */}
      {particles.map(p => (
        <SmokeParticle
          key={p.id}
          x={p.x}
          y={p.y}
          big={p.big}
          onDone={() => removeParticle(p.id)}
        />
      ))}

      {/* Exhale clouds */}
      {exhales.map(e => (
        <ExhaleCloud
          key={e.id}
          id={e.id}
          x={e.x}
          y={e.y}
          onDone={() => removeExhale(e.id)}
        />
      ))}

      <WeirdFilters puffCount={puffCount} />
      <FrownyLayer  puffCount={puffCount} />

      <Hand
        isInhaling={isInhaling}
        puffCount={puffCount % MAX_CIG_PUFFS === 0 && puffCount > 0 ? 0 : puffCount % MAX_CIG_PUFFS}
        lightNew={lightNew}
      />

      <CRTOverlay flashing={flashing} flashKey={flashKey} />

      <HUD
        puffCount={puffCount}
        message={message}
        msgKey={msgKey}
        cigDone={cigDone}
      />
    </div>
  )
}
