import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react'
import { useAuth } from './AuthContext'
import { errorText } from './api'

const roleHome = (role) => role === 'admin' ? '/admin/dashboard' : role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'

function getStage(email, password, busy, succeeded) {
  if (succeeded) return 4
  if (busy) return 3
  if (password) return 2
  if (email) return 1
  return 0
}

const styles = `
@property --lc-fa { syntax: '<number>'; inherits: true; initial-value: 1; }
@property --lc-gA { syntax: '<angle>'; inherits: true; initial-value: 225deg; }
@property --lc-angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }

.login-card {
  --lc-ink: #ffffff;
  --lc-muted: #b6c2bc;
  --lc-faint: #a0aea7;
  --lc-line: rgba(255,255,255,.13);
  --lc-line-strong: rgba(255,255,255,.26);
  --lc-mint: #52e0aa;
  --lc-mint-ink: #05261a;
  --lc-glow: 62, 220, 160;
  --lc-danger: #ffb4aa;
  --lc-danger-bg: rgba(255,92,72,.09);
  --lc-ease: cubic-bezier(0.22, 0.8, 0.2, 1);
  --lc-spring: cubic-bezier(0.34, 1.4, 0.5, 1);

  --rx: 0deg;
  --ry: 0deg;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 700px;
  width: 100%;
  padding: 68px 48px 58px;
  color: var(--lc-ink);
  color-scheme: dark;
  background:
    linear-gradient(165deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.015) 40%, rgba(255,255,255,0) 100%),
    #0a110e;
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  border: 1px solid var(--lc-line);
  border-radius: 32px;
  box-shadow:
    inset 1px 1px 0 rgba(150,255,215,.35),
    inset 0 0 0 1px rgba(255,255,255,.05),
    0 0 0 1px rgba(255,255,255,.04),
    0 50px 90px -30px rgba(0,0,0,.95);
  overflow: hidden;
  isolation: isolate;
  transform: perspective(1100px) rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform .4s var(--lc-ease);
  will-change: transform;
  animation: lc-glow-orbit 14s linear infinite;
}

/* wrapper: paper-like glide in, then a barely-there float */
.login-card-float {
  width: 100%;
  max-width: 520px;
  box-sizing: border-box;
  position: relative;
  animation: lc-land 1.4s .25s cubic-bezier(.3, .1, .25, 1) both;
}
/* soft aura so the card separates from the page */
.login-card-float::before {
  content: ''; position: absolute; inset: -1px; border-radius: 36px; pointer-events: none;
  background:
    radial-gradient(60% 50% at 28% 0%, rgba(62, 220, 160, .6), transparent 70%),
    radial-gradient(50% 42% at 100% 100%, rgba(60, 170, 220, .4), transparent 70%);
  filter: blur(40px); transform: scale(1.06);
  animation: lc-breathe 7s ease-in-out infinite alternate;
}
@keyframes lc-breathe { from { opacity: .6; } to { opacity: 1; } }
/* one-time entrance: a sheet of paper drifts down, swings once or twice, and settles. After that the card is perfectly still. */
@keyframes lc-land {
  0%   { opacity: 0; transform: perspective(1200px) translateY(70px) rotateX(26deg) rotateY(-10deg) rotateZ(-5deg) scale(.92); }
  30%  { opacity: 1; }
  38%  { transform: perspective(1200px) translateY(-9px) rotateX(-6deg) rotateY(5deg) rotateZ(2.2deg) scale(1.008); }
  62%  { transform: perspective(1200px) translateY(4px) rotateX(2.4deg) rotateY(-2.2deg) rotateZ(-.9deg) scale(1); }
  82%  { transform: perspective(1200px) translateY(-1px) rotateX(-.8deg) rotateY(.7deg) rotateZ(.3deg); }
  100% { opacity: 1; transform: perspective(1200px) translateY(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
}
/* light on the "floor" below: shrinks and fades as the card rises */
.login-card-float::after {
  content: ''; position: absolute; z-index: -1; left: 12%; right: 12%; bottom: -46px; height: 34px; pointer-events: none;
  background: radial-gradient(closest-side, rgba(62, 220, 160, .5), rgba(62, 220, 160, .12) 60%, transparent);
  filter: blur(12px);
  animation: lc-under 1.4s .25s ease-out both;
}
@keyframes lc-under {
  from { opacity: 0; transform: scale(.6, .6); }
  to { opacity: .8; transform: scale(1, 1); }
}
}

/* one soft sweep of light across the surface */
.login-card .lc-sheen {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(105deg, transparent 36%, rgba(255,255,255,.11) 50%, transparent 64%);
  transform: translateX(-130%);
  animation: lc-sheen 1.2s 1.2s cubic-bezier(.4, 0, .2, 1) forwards;
}
@keyframes lc-sheen { to { transform: translateX(130%); } }

@keyframes lc-drift { from { translate: 0 0; scale: 1; } to { translate: 16% 12%; scale: 1.18; } }
@keyframes lc-drift2 { from { translate: 0 0; scale: 1; } to { translate: -14% -10%; scale: 1.2; } }
@keyframes lc-orbit { to { --lc-angle: 360deg; } }
/* green glow travels the opposite way to the white edge light */
@keyframes lc-glow-orbit { from { --lc-gA: 225deg; } to { --lc-gA: -135deg; } }

/* cool counter-glow, bottom right */
.login-card .lc-glow2 {
  position: absolute; z-index: -2;
  left: calc(50% + cos(var(--lc-gA) + 180deg) * 46%);
  top: calc(50% + sin(var(--lc-gA) + 180deg) * 46%);
  width: 70%; height: 55%; transform: translate(-50%, -50%);
  background: radial-gradient(closest-side, rgba(60, 170, 220, .26), transparent);
  filter: blur(30px); pointer-events: none;
}

/* light that travels around the card edge */
.login-card .lc-rim, .login-card .lc-beam, .login-card .lc-edge {
  position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}
.login-card .lc-beam {
  padding: 2px;
  background: conic-gradient(from var(--lc-angle), transparent 0deg, transparent 120deg, rgba(var(--lc-glow), .3) 215deg, rgba(var(--lc-glow), 1) 308deg, #fff 352deg, transparent 360deg);
  filter: drop-shadow(0 0 7px rgba(var(--lc-glow), .95));
  opacity: 1; animation: lc-orbit 5.5s linear infinite; transition: opacity .5s;
}
.login-card .lc-rim {
  padding: 1.5px;
  background: linear-gradient(135deg, rgba(130,255,205,.85) 0%, rgba(255,255,255,.16) 34%, rgba(255,255,255,.05) 64%, rgba(70,180,230,.6) 100%);
}
.login-card[data-state='busy'] .lc-beam { opacity: 1; animation-duration: 1.4s; }
.login-card[data-state='success'] .lc-beam { opacity: 1; animation-duration: .9s; }
/* edge highlight that follows the cursor */
.login-card .lc-edge {
  background: radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,.55), transparent 65%);
  opacity: 0; transition: opacity .35s;
}
.login-card:hover .lc-edge { opacity: 1; }

/* heading comes into focus */
.login-card h1 { animation: lc-title .9s .2s var(--lc-ease) both; }
@keyframes lc-title {
  from { opacity: 0; filter: blur(10px); letter-spacing: -.06em; transform: translateY(8px); }
  to { opacity: 1; filter: blur(0); letter-spacing: -.032em; transform: none; }
}

/* field gets its own travelling light when focused */
.login-card .lc-box::after {
  content: ''; position: absolute; inset: 0; border-radius: 22px; padding: 1px; pointer-events: none;
  background: conic-gradient(from var(--lc-angle), transparent 0deg, transparent 200deg, rgba(var(--lc-glow), .95) 300deg, #fff 340deg, transparent 360deg);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  opacity: 0; transition: opacity .3s;
}
.login-card .lc-box:focus-within::after { opacity: 1; animation: lc-orbit 2.8s linear infinite; }

/* corner glow */
.login-card::after {
  content: '';
  position: absolute;
  z-index: -2;
  left: calc(50% + cos(var(--lc-gA)) * 44%);
  top: calc(50% + sin(var(--lc-gA)) * 44%);
  width: 80%;
  height: 70%;
  transform: translate(-50%, -50%);
  background: radial-gradient(closest-side, rgba(var(--lc-glow), .5), rgba(var(--lc-glow), .12) 60%, transparent);
  filter: blur(26px);
  opacity: .9;
  pointer-events: none;
  transition: opacity .5s, transform .8s var(--lc-ease);
}
.login-card:hover::after { opacity: 1; }

/* cursor light */
.login-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(320px circle at var(--mx, 50%) var(--my, 0%), rgba(255,255,255,.05), transparent 65%);
  opacity: 0;
  transition: opacity .4s;
  pointer-events: none;
}
.login-card:hover::before { opacity: 1; }


/* progress hairline */
.login-card .login-progress { position: absolute; inset: 0 28px auto 28px; height: 1.5px; pointer-events: none; border-radius: 2px; }
.login-card .login-progress-light {
  display: block; height: 100%; width: var(--progress, 0%);
  background: linear-gradient(90deg, transparent, var(--lc-mint));
  transition: width .6s var(--lc-ease);
}

/* brand */
.login-card .login-card-brand {
  display: flex; width: fit-content; align-items: center; gap: 10px; margin: 0 auto 46px;
  color: var(--lc-ink); font-weight: 650; font-size: 1.12rem; letter-spacing: -.01em; text-decoration: none;
}
.login-card .login-card-brand-mark {
  display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px;
  background: #f4f6f4; color: #101512;
  transition: transform .45s var(--lc-spring);
}
.login-card .login-card-brand:hover .login-card-brand-mark { transform: rotate(-8deg) scale(1.08); }

/* heading */
.login-card .login-card-heading { margin-bottom: 46px; text-align: center; }
.login-card h1 { margin: 0 0 10px; color: #fff; font-size: 2.75rem; line-height: 1.1; font-weight: 600; letter-spacing: -.032em; }
.login-card .login-card-heading p { margin: 0 auto; max-width: 34ch; color: var(--lc-muted); font-size: 1.02rem; line-height: 1.55; }

/* fields */
.login-card .login-card-form { display: grid; gap: 18px; }
.login-card .lc-box { position: relative; display: block; }
.login-card .login-field input {
  width: 100%; height: 74px; padding: 31px 22px 9px; box-sizing: border-box;
  background: linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.3));
  color: var(--lc-ink);
  border: 1px solid var(--lc-line); border-radius: 22px;
  box-shadow: inset 0 2px 6px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.05);
  font: inherit; font-size: 1.08rem; font-weight: 500; outline: none;
  transition: border-color .25s, background-color .25s, box-shadow .3s var(--lc-ease);
}
.login-card .login-field input::placeholder { color: transparent; }
.login-card .login-field input:hover { border-color: var(--lc-line-strong); }
.login-card .login-field input:focus {
  border-color: rgba(var(--lc-glow), .65);
  box-shadow: inset 0 2px 6px rgba(0,0,0,.35), 0 0 0 4px rgba(var(--lc-glow), .15);
}
.login-card .login-field input:-webkit-autofill {
  -webkit-text-fill-color: var(--lc-ink);
  box-shadow: inset 0 0 0 100px #0a0f0d;
  caret-color: var(--lc-ink);
}
.login-card .lc-label {
  position: absolute; left: 22px; top: 50%; transform: translateY(-50%);
  color: var(--lc-faint); font-size: 1.06rem; font-weight: 500; line-height: 1; pointer-events: none;
  transition: top .22s var(--lc-ease), transform .22s var(--lc-ease), font-size .22s var(--lc-ease), color .2s;
}
.login-card .login-field input:focus ~ .lc-label,
.login-card .login-field input:not(:placeholder-shown) ~ .lc-label,
.login-card .login-field input:-webkit-autofill ~ .lc-label {
  top: 22px; font-size: .75rem; font-weight: 600; letter-spacing: .03em; color: var(--lc-muted);
}
.login-card .login-field input:focus ~ .lc-label { color: var(--lc-mint); }

/* password: eye + round submit inside the field */
.login-card .login-password-input input { padding-right: 124px; }
.login-card .login-show-password {
  position: absolute; top: 50%; right: 70px; width: 38px; height: 38px; padding: 0;
  display: grid; place-items: center; transform: translateY(-50%);
  background: transparent; color: var(--lc-faint); border: 0; border-radius: 50%; cursor: pointer;
  transition: color .15s, background-color .15s, transform .15s;
}
.login-card .login-show-password:hover { color: var(--lc-ink); background: rgba(255,255,255,.07); }
.login-card .login-show-password:active { transform: translateY(-50%) scale(.9); }
.login-card .login-show-password:focus-visible { outline: 2px solid var(--lc-mint); outline-offset: 1px; }
.login-card .login-show-password svg { grid-area: 1 / 1; transition: opacity .2s, transform .3s var(--lc-spring); }
.login-card .login-show-password .lc-off { opacity: 0; transform: scale(.6) rotate(-30deg); }
.login-card .login-show-password[aria-pressed='true'] .lc-on { opacity: 0; transform: scale(.6) rotate(30deg); }
.login-card .login-show-password[aria-pressed='true'] .lc-off { opacity: 1; transform: none; }

.login-card .login-submit {
  position: absolute; top: 50%; right: 11px; width: 50px; height: 50px; padding: 0; margin: 0;
  transform: translate(var(--bx, 0px), calc(-50% + var(--by, 0px)));
  display: grid; place-items: center; overflow: hidden;
  background: var(--lc-mint); color: var(--lc-mint-ink);
  border: 0; border-radius: 50%; cursor: pointer;
  box-shadow: 0 0 0 1px rgba(255,255,255,.2) inset, 0 6px 16px -4px rgba(var(--lc-glow), .55);
  transition: transform .25s var(--lc-spring), box-shadow .3s var(--lc-ease), background-color .25s, opacity .2s;
}
.login-card .login-submit:hover:not(:disabled) {
  transform: translate(var(--bx, 0px), calc(-50% + var(--by, 0px))) scale(1.08);
  box-shadow: 0 0 0 1px rgba(255,255,255,.25) inset, 0 10px 22px -4px rgba(var(--lc-glow), .7);
}
.login-card .login-submit:active:not(:disabled) { transform: translate(var(--bx, 0px), calc(-50% + var(--by, 0px))) scale(.94); }
.login-card .login-submit:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.login-card .login-submit:disabled { cursor: default; }
.login-card[data-state='busy'] .login-submit { opacity: .9; }
@keyframes lc-pulse {
  0% { box-shadow: 0 0 0 1px rgba(255,255,255,.2) inset, 0 6px 16px -4px rgba(var(--lc-glow), .55), 0 0 0 0 rgba(var(--lc-glow), .5); }
  75%, 100% { box-shadow: 0 0 0 1px rgba(255,255,255,.2) inset, 0 6px 16px -4px rgba(var(--lc-glow), .55), 0 0 0 13px rgba(var(--lc-glow), 0); }
}
@keyframes lc-burst {
  0% { box-shadow: 0 0 0 0 rgba(var(--lc-glow), .7); }
  100% { box-shadow: 0 0 0 46px rgba(var(--lc-glow), 0); }
}
.login-card[data-ready='true'] .login-submit:not(:disabled) { animation: lc-pulse 2.2s ease-out infinite; }
.login-card[data-state='success'] .login-submit { animation: lc-burst .9s ease-out both; }
.login-card .lc-icon { position: relative; z-index: 1; display: grid; place-items: center; animation: lc-pop .35s var(--lc-spring) both; }
@keyframes lc-pop { from { opacity: 0; transform: scale(.5); } to { opacity: 1; transform: none; } }
.login-card .login-submit:hover:not(:disabled) .lc-icon svg { animation: lc-nudge .5s var(--lc-ease); }
@keyframes lc-nudge { 40% { transform: translateX(3px); } }

.login-card .lc-spinner {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid rgba(5,38,26,.25); border-top-color: var(--lc-mint-ink);
  animation: lc-spin .7s linear infinite;
}
@keyframes lc-spin { to { transform: rotate(360deg); } }
.login-card .lc-check { stroke-dasharray: 1; stroke-dashoffset: 1; animation: lc-draw .45s .05s var(--lc-ease) forwards; }
@keyframes lc-draw { to { stroke-dashoffset: 0; } }

.login-card .lc-ripple {
  position: absolute; z-index: 0; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%;
  background: rgba(255,255,255,.55); pointer-events: none;
  animation: lc-ripple .6s var(--lc-ease) forwards;
}
@keyframes lc-ripple { to { transform: scale(10); opacity: 0; } }

/* error */
.login-card .login-error {
  margin: 0; padding: 11px 14px; background: var(--lc-danger-bg); color: var(--lc-danger);
  border: 1px solid rgba(255,120,100,.28); border-radius: 14px; font-size: .8125rem; line-height: 1.45;
  animation: lc-err .35s var(--lc-ease) both;
}
@keyframes lc-err { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }

/* success: glow floods, card leaves */
.login-card[data-state='success']::after { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
.login-card[data-state='success'] { animation: lc-out .5s .95s var(--lc-ease) forwards, lc-glow-orbit 14s linear infinite; }
@keyframes lc-out { to { opacity: 0; transform: translateY(-8px) scale(.99); } }

/* footer */
.login-card .login-register { margin: 46px 0 0; color: var(--lc-muted); font-size: .97rem; text-align: center; }
.login-card .login-register a {
  color: var(--lc-mint); font-weight: 650; text-decoration: none;
  background: linear-gradient(currentColor, currentColor) 0 100% / 0 1.5px no-repeat;
  padding-bottom: 2px;
  transition: background-size .3s var(--lc-ease);
}
.login-card .login-register a:hover, .login-card .login-register a:focus-visible { background-size: 100% 1.5px; outline: none; }

@media (max-width: 480px) {
  .login-card { min-height: 0; padding: 40px 22px 32px; border-radius: 26px; }
  .login-card h1 { font-size: 2.1rem; }
}
@media (prefers-reduced-motion: reduce) {
  .login-card-float, .login-card-float::before, .login-card-float::after, .login-card, .login-card *, .login-card *::before, .login-card::after { animation: none !important; transition: none !important; }
  .login-card .lc-sheen, .login-card .lc-beam { display: none; }
  .login-card *::after, .login-card .login-submit { animation: none !important; }
  .login-card .lc-check { stroke-dashoffset: 0; }
}
`

export default function LoginCard({ onStageChange }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const cardRef = useRef(null)
  const submitRef = useRef(null)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [errorTick, setErrorTick] = useState(0)
  const [busy, setBusy] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [ripples, setRipples] = useState([])
  const stage = getStage(form.email, form.password, busy, succeeded)
  const progress = [0, 30, 62, 90, 100][stage]
  const ready = Boolean(form.email && form.password) && !busy && !succeeded
  const label = succeeded ? 'Signed in' : busy ? 'Signing in' : 'Log in'

  useEffect(() => { onStageChange?.(stage) }, [onStageChange, stage])
  useEffect(() => {
    if (!succeeded) return undefined
    const timeout = window.setTimeout(() => setSucceeded(false), 2200)
    return () => window.clearTimeout(timeout)
  }, [succeeded])

  function trackPointer(event) {
    const el = event.currentTarget
    const rect = el.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    el.style.setProperty('--mx', `${x}px`)
    el.style.setProperty('--my', `${y}px`)
    const calm = event.pointerType === 'touch' || el.matches(':focus-within') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.style.setProperty('--rx', calm ? '0deg' : `${(0.5 - y / rect.height) * 5}deg`)
    el.style.setProperty('--ry', calm ? '0deg' : `${(x / rect.width - 0.5) * 5}deg`)

    const btn = submitRef.current
    if (btn) {
      const box = btn.parentElement.getBoundingClientRect()
      const dx = event.clientX - (box.right - 36)
      const dy = event.clientY - (box.top + box.height / 2)
      const pull = Math.max(0, 1 - Math.hypot(dx, dy) / 110)
      btn.style.setProperty('--bx', calm ? '0px' : `${dx * pull * 0.3}px`)
      btn.style.setProperty('--by', calm ? '0px' : `${dy * pull * 0.3}px`)
    }
  }

  function resetTilt(event) {
    event.currentTarget.style.setProperty('--rx', '0deg')
    event.currentTarget.style.setProperty('--ry', '0deg')
    submitRef.current?.style.setProperty('--bx', '0px')
    submitRef.current?.style.setProperty('--by', '0px')
  }

  function addRipple(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const id = Date.now() + Math.random()
    setRipples((items) => [...items, { id, x: event.clientX - rect.left, y: event.clientY - rect.top }])
    window.setTimeout(() => setRipples((items) => items.filter((item) => item.id !== id)), 650)
  }

  function shake() {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    cardRef.current?.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-9px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }],
      { duration: 420, easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)', composite: 'add' }
    )
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await login(form)
      setSucceeded(true)
      const next = location.state?.from || new URLSearchParams(location.search).get('next')
      window.setTimeout(() => navigate(next || roleHome(result.data.user.role)), 1450)
    } catch (loginError) {
      setError(errorText(loginError))
      setErrorTick((tick) => tick + 1)
      setBusy(false)
      shake()
    }
  }

  return <div className="login-card-float">
    <style>{styles}</style>
    <section ref={cardRef} id="login-card" className="login-card" aria-labelledby="login-card-title"
      data-state={succeeded ? 'success' : busy ? 'busy' : 'idle'} data-ready={ready} onPointerMove={trackPointer} onPointerLeave={resetTilt}>
      <span className="lc-glow2" aria-hidden="true" />
      <span className="lc-sheen" aria-hidden="true" />
      <span className="lc-rim" aria-hidden="true" />
      <span className="lc-beam" aria-hidden="true" />
      <span className="lc-edge" aria-hidden="true" />
      <div className="login-progress" aria-hidden="true" style={{ '--progress': `${progress}%` }}>
        <span className="login-progress-light" />
      </div>

      <Link className="login-card-brand" to="/" aria-label="FindMyTutor home">
        <span className="login-card-brand-mark"><GraduationCap size={21} /></span>
        <span>FindMyTutor</span>
      </Link>

      <div className="login-card-heading">
        <h1 id="login-card-title">Welcome back</h1>
        <p>Sign in to continue to your learning or teaching workspace.</p>
      </div>

      <form className="login-card-form" onSubmit={submit}>
        <div className="login-field">
          <span className="lc-box">
            <input id="home-email" type="email" autoComplete="email" required placeholder=" " value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <label className="lc-label" htmlFor="home-email">Email address</label>
          </span>
        </div>

        <div className="login-field">
          <span className="lc-box login-password-input">
            <input id="home-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required placeholder=" " value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })} />
            <label className="lc-label" htmlFor="home-password">Password</label>
            <button className="login-show-password" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>
              <Eye className="lc-on" size={20} />
              <EyeOff className="lc-off" size={20} />
            </button>
            <button ref={submitRef} className="login-submit" type="submit" aria-label={label} title={label} disabled={busy || succeeded} onPointerDown={addRipple}>
              {ripples.map((ripple) => <span key={ripple.id} className="lc-ripple" style={{ left: ripple.x, top: ripple.y }} />)}
              <span key={label} className="lc-icon">
                {succeeded
                  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path className="lc-check" pathLength="1" d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  : busy ? <span className="lc-spinner" aria-hidden="true" /> : <ArrowRight size={22} strokeWidth={2.4} />}
              </span>
            </button>
          </span>
        </div>

        {error && <p key={errorTick} className="login-error" role="alert">{error}</p>}
      </form>

      <p className="login-register">New to FindMyTutor? <Link to="/register">Create an account</Link></p>
    </section>
  </div>
}