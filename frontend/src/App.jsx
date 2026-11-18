import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Check, Clock3, GraduationCap, LogOut, MapPin, Menu, Search, ShieldCheck, Users, X } from 'lucide-react'
import { useAuth } from './AuthContext'
import { api, errorText } from './api'
import LoginCard from './LoginCard'

const LearningArchitecture3D = lazy(() => import('./LearningArchitecture3D').then((module) => ({ default: module.LearningArchitecture3D })))
const homeCss = `
.theme-home {
  --lc-ink:#fff; --lc-muted:#b6c2bc; --lc-faint:#a0aea7;
  --lc-line:rgba(255,255,255,.13); --lc-line-strong:rgba(255,255,255,.26);
  --lc-mint:#52e0aa; --lc-mint-ink:#05261a; --lc-glow:62,220,160;
  --lc-ease:cubic-bezier(0.22,0.8,0.2,1); --lc-spring:cubic-bezier(0.34,1.4,0.5,1);
  min-height:100vh; background:#060b09; color:var(--lc-ink); color-scheme:dark;
  -webkit-font-smoothing:antialiased;
}

/* floating glass header */
.theme-home .site-header {
  position:fixed; top:16px; left:0; right:0; z-index:60; margin:0 auto;
  width:min(1180px, calc(100% - 32px));
  background:rgba(12,20,17,.55);
  -webkit-backdrop-filter:blur(22px) saturate(140%); backdrop-filter:blur(22px) saturate(140%);
  border:1px solid var(--lc-line); border-radius:999px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07), 0 18px 40px -18px rgba(0,0,0,.8);
  animation:hs-drop .9s .1s var(--lc-ease) both;
}
.theme-home .site-header .header-inner {
  max-width:none; width:100%; margin:0; box-sizing:border-box;
  padding:8px 8px 8px 20px; display:flex; align-items:center; justify-content:space-between; gap:16px;
}
.theme-home .site-header .brand { color:var(--lc-ink); font-weight:650; font-size:1.05rem; letter-spacing:-.01em; text-decoration:none; display:flex; align-items:center; gap:10px; }
.theme-home .brand-mark {
  display:grid; place-items:center; width:34px; height:34px; border-radius:10px;
  background:#f4f6f4; color:#101512; transition:transform .45s var(--lc-spring);
}
.theme-home .brand:hover .brand-mark { transform:rotate(-8deg) scale(1.08); }
.theme-home .site-header .mobile-menu { color:var(--lc-ink); background:transparent; border:0; }

@media (min-width:821px) {
  .theme-home .site-header .main-nav { display:flex; align-items:center; gap:6px; }
  .theme-home .site-header .nav-actions { display:flex; align-items:center; gap:8px; }
  .theme-home .site-header .nav-user { display:flex; align-items:center; gap:10px; }
}
.theme-home .site-header .main-nav > a {
  color:var(--lc-muted); text-decoration:none; padding:9px 14px; border-radius:999px; font-size:.93rem; font-weight:550;
  transition:color .2s, background-color .2s;
}
.theme-home .site-header .main-nav > a:hover { color:var(--lc-ink); background:rgba(255,255,255,.07); }
.theme-home .site-header .button-link { color:var(--lc-muted); background:none; border:0; cursor:pointer; font:inherit; font-size:.9rem; display:inline-flex; align-items:center; gap:6px; transition:color .2s; }
.theme-home .site-header .button-link:hover { color:var(--lc-ink); }
.theme-home .avatar-mini { display:grid; place-items:center; width:32px; height:32px; border-radius:50%; background:rgba(var(--lc-glow),.16); color:var(--lc-mint); border:1px solid rgba(var(--lc-glow),.35); font-weight:650; text-transform:uppercase; }
.theme-home .nav-user-name { color:var(--lc-ink); font-size:.92rem; font-weight:550; }

.theme-home .site-header .nav-actions .button {
  height:42px; padding:0 18px; display:inline-flex; align-items:center; justify-content:center; gap:8px;
  border-radius:999px; font-size:.92rem; font-weight:600; text-decoration:none; white-space:nowrap;
  transition:transform .25s var(--lc-spring), box-shadow .3s var(--lc-ease), background-color .2s, border-color .2s;
}
.theme-home .site-header .nav-actions .button.button-quiet {
  background:transparent !important; color:var(--lc-ink) !important; border:1px solid var(--lc-line) !important; box-shadow:none !important;
}
.theme-home .site-header .nav-actions .button.button-quiet:hover { border-color:var(--lc-line-strong) !important; background:rgba(255,255,255,.06) !important; }
.theme-home .site-header .nav-actions .button.button-primary {
  background:var(--lc-mint) !important; color:var(--lc-mint-ink) !important; border:0 !important;
  box-shadow:0 0 0 1px rgba(255,255,255,.22) inset, 0 8px 20px -6px rgba(var(--lc-glow),.6) !important;
}
.theme-home .site-header .nav-actions .button.button-primary:hover { transform:translateY(-1px) scale(1.03); box-shadow:0 0 0 1px rgba(255,255,255,.28) inset, 0 12px 26px -6px rgba(var(--lc-glow),.75) !important; }
.theme-home a:focus-visible, .theme-home button:focus-visible { outline:2px solid var(--lc-mint); outline-offset:2px; }

@media (max-width:820px) {
  .theme-home .site-header { border-radius:26px; top:12px; width:calc(100% - 24px); }
  .theme-home .site-header .header-inner { padding:8px 10px 8px 16px; }
  .theme-home .site-header .main-nav.is-open {
    background:rgba(10,17,14,.94); -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px);
    border:1px solid var(--lc-line); border-radius:22px; padding:10px;
  }
}

/* hero */
.theme-home .hero-full {
  --stair-shift:clamp(0px, 9vw, 170px);
  position:relative; isolation:isolate; overflow:hidden; background:#060b09;
  min-height:100vh; min-height:100svh; display:flex; flex-direction:column; justify-content:center;
}
.theme-home .hero-full::before {
  content:''; position:absolute; inset:0; z-index:0; pointer-events:none;
  background-image:radial-gradient(rgba(255,255,255,.10) 1px, transparent 1px); background-size:28px 28px;
  -webkit-mask-image:radial-gradient(75% 65% at 50% 45%, #000 0%, transparent 100%);
  mask-image:radial-gradient(75% 65% at 50% 45%, #000 0%, transparent 100%);
}
.theme-home .hero-3d {
  position:absolute; top:0; bottom:0; left:var(--stair-shift); right:calc(var(--stair-shift) * -1); z-index:1;
  -webkit-mask-image:linear-gradient(90deg, transparent 0, #000 var(--stair-shift));
  mask-image:linear-gradient(90deg, transparent 0, #000 var(--stair-shift));
}
@media (max-width:820px) { .theme-home .hero-full { --stair-shift:0px; } .theme-home .hero-3d { -webkit-mask-image:none; mask-image:none; opacity:.5; } }
.theme-home .hero-full-shade {
  position:absolute; inset:0; z-index:2; pointer-events:none;
  background:
    radial-gradient(60% 50% at 24% 10%, rgba(62,220,160,.14), transparent 70%),
    radial-gradient(50% 42% at 100% 100%, rgba(60,170,220,.12), transparent 70%),
    linear-gradient(180deg, rgba(6,11,9,.25) 0%, rgba(6,11,9,.7) 100%);
}
.theme-home .hero-full-inner {
  position:relative; z-index:3; width:100%; max-width:1212px; min-height:0; height:auto; margin:0 auto;
  padding:120px 16px 28px; box-sizing:border-box; display:flex; justify-content:flex-start; align-items:center;
}
@media (max-width:820px) { .theme-home .hero-full-inner { padding-top:100px; justify-content:center; } }

/* trust strip under the card */
.theme-home .hero-strip {
  position:relative; z-index:3; width:100%; max-width:1212px; margin:0 auto; padding:0 16px 36px; box-sizing:border-box;
  display:flex; flex-wrap:wrap; gap:10px;
}
.theme-home .hero-chip {
  display:inline-flex; align-items:center; gap:10px; padding:8px 16px 8px 8px; border-radius:999px;
  background:rgba(12,20,17,.55); border:1px solid var(--lc-line);
  -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px);
  color:var(--lc-muted); font-size:.88rem; font-weight:550;
  animation:hs-rise .8s var(--lc-ease) both; animation-delay:calc(1.1s + var(--i, 0) * .1s);
  transition:transform .3s var(--lc-spring), border-color .25s, color .25s;
}
.theme-home .hero-chip:hover { transform:translateY(-2px); border-color:rgba(var(--lc-glow),.4); color:var(--lc-ink); }
.theme-home .hero-chip-icon { display:grid; place-items:center; width:28px; height:28px; border-radius:50%; background:rgba(var(--lc-glow),.14); color:var(--lc-mint); }
@media (max-width:820px) { .theme-home .hero-strip { justify-content:center; } }

/* signed-in card: same glass as the login card */
.theme-home .home-signed-in {
  position:relative; isolation:isolate; overflow:hidden; box-sizing:border-box;
  width:100%; max-width:480px; padding:56px 40px 48px; text-align:center;
  display:flex; flex-direction:column; align-items:center; gap:16px;
  background:linear-gradient(165deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.015) 40%, rgba(255,255,255,0) 100%), #0a110e;
  -webkit-backdrop-filter:blur(24px); backdrop-filter:blur(24px);
  border:1px solid var(--lc-line); border-radius:32px;
  box-shadow:inset 1px 1px 0 rgba(150,255,215,.35), inset 0 0 0 1px rgba(255,255,255,.05), 0 50px 90px -30px rgba(0,0,0,.95);
  animation:hs-land 1.2s .15s cubic-bezier(.3,.1,.25,1) both;
}
.theme-home .home-signed-in::before {
  content:''; position:absolute; z-index:-1; left:-10%; top:-30%; width:80%; height:70%;
  background:radial-gradient(closest-side, rgba(var(--lc-glow),.45), transparent);
  filter:blur(26px); pointer-events:none;
}
.theme-home .home-signed-in .kicker { color:var(--lc-mint); font-size:.75rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase; }
.theme-home .home-signed-in h1 { margin:0 0 12px; color:#fff; font-size:2.4rem; line-height:1.1; font-weight:600; letter-spacing:-.032em; }
.theme-home .home-signed-in .button.button-primary {
  display:inline-flex; align-items:center; gap:8px; height:48px; padding:0 24px; border-radius:999px; font-weight:600; text-decoration:none;
  background:var(--lc-mint); color:var(--lc-mint-ink); border:0;
  box-shadow:0 0 0 1px rgba(255,255,255,.22) inset, 0 8px 20px -6px rgba(var(--lc-glow),.6);
  transition:transform .25s var(--lc-spring), box-shadow .3s var(--lc-ease);
}
.theme-home .home-signed-in .button.button-primary:hover { transform:translateY(-1px) scale(1.04); box-shadow:0 0 0 1px rgba(255,255,255,.28) inset, 0 12px 26px -6px rgba(var(--lc-glow),.75); }


/* lit staircase (right column) */
.theme-home .hero-stair {
  position:absolute; z-index:3; top:50%; right:max(16px, calc((100% - 1180px) / 2 + 20px));
  height:min(74vh, 620px); aspect-ratio:600 / 650; max-width:46vw; translate:0 -46%;
  pointer-events:none; animation:hs-rise 1.2s .35s var(--lc-ease) both;
}
.theme-home .hero-stair::before {
  content:''; position:absolute; inset:-8% -18% -4%; z-index:-1; pointer-events:none;
  background:radial-gradient(closest-side, rgba(var(--lc-glow), calc(.10 + var(--p, 0) * .34)), transparent 72%);
  filter:blur(26px); transition:background .6s;
}
.theme-home .hero-stair svg { display:block; width:100%; height:100%; overflow:visible; }
.theme-home .st-riser { fill:url(#st-riser); stroke:rgba(255,255,255,.07); stroke-width:1; }
.theme-home .st-tread { fill:url(#st-tread); stroke:rgba(255,255,255,.10); stroke-width:1; }
.theme-home .st-riser-lit { fill:url(#st-riser-lit); }
.theme-home .st-tread-lit { fill:url(#st-tread-lit); }
.theme-home .st-gold .st-riser { fill:url(#st-gold-riser); }
.theme-home .st-gold .st-tread { fill:url(#st-gold-tread); }
.theme-home .st-gold .st-riser-lit { fill:url(#st-gold-lit); }
.theme-home .st-gold .st-tread-lit { fill:url(#st-gold-lit); }
.theme-home .st-lit { opacity:var(--lit, 0); transition:opacity .55s var(--lc-ease); }
.theme-home .st-glow { fill:#3edca0; opacity:calc(var(--lit, 0) * .9); transition:opacity .55s var(--lc-ease); }
.theme-home .st-gold .st-glow, .theme-home .st-glow-gold { fill:#ffcf5e; }
.theme-home .st-edge-base { fill:rgba(var(--lc-glow), .28); }
.theme-home .st-edge { fill:#eafff6; }
.theme-home .st-edge-glow { fill:#52e0aa; opacity:calc(var(--lit, 0) * .95); transition:opacity .55s var(--lc-ease); }
.theme-home .st-gold .st-edge { fill:#fff4c9; }
.theme-home .st-gold .st-edge-glow { fill:#ffd36b; }
.theme-home .st-sweep { fill:#eafff6; fill-opacity:calc(var(--lit, 0) * .55); opacity:0; }
.theme-home .is-live .st-sweep { animation:st-wave 2.4s ease-in-out infinite; animation-delay:calc(var(--i, 0) * .14s); }
@keyframes st-wave { 0%, 100% { opacity:0; } 40% { opacity:1; } }

.theme-home .st-arch { fill:none; stroke:#5d5430; stroke-width:9; stroke-linecap:round; }
.theme-home .st-arch-lit { fill:none; stroke:#ffe08a; stroke-width:9; stroke-linecap:round; opacity:var(--lit, 0); transition:opacity .6s var(--lc-ease); }
.theme-home .st-arch-glow { fill:none; stroke:#ffcf5e; stroke-width:16; stroke-linecap:round; opacity:calc(var(--lit, 0) * .8); transition:opacity .6s var(--lc-ease); }
.theme-home .st-disc { fill:#131916; stroke:rgba(255,255,255,.08); stroke-width:1.5; }
.theme-home .st-disc-lit { fill:url(#st-disc-lit); opacity:var(--lit, 0); transition:opacity .7s var(--lc-ease); }

/* the star that comes out of the arch */
.theme-home .st-star-pop {
  transform:translateY(0) scale(0); opacity:0;
  transition:transform 1.3s cubic-bezier(.2, 1.25, .3, 1), opacity .5s ease;
}
.theme-home .hero-stair[data-star='true'] .st-star-pop { transform:translateY(-108px) scale(1); opacity:1; }
.theme-home .hero-stair[data-stage='4'] .st-star-pop { transform:translateY(-124px) scale(1.5); }
.theme-home .st-float { animation:st-bob 3.4s ease-in-out infinite; }
@keyframes st-bob { 0%, 100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
.theme-home .st-rays { animation:st-spin 18s linear infinite; }
@keyframes st-spin { to { transform:rotate(360deg); } }
.theme-home .st-halo { animation:st-pulse 2.4s ease-in-out infinite; }
@keyframes st-pulse { 0%, 100% { opacity:.55; } 50% { opacity:1; } }
.theme-home .hero-stair[data-stage='3'] .st-halo { animation-duration:.8s; }
.theme-home .st-spark { fill:#fff1b8; opacity:0; }
.theme-home .hero-stair[data-star='true'] .st-spark { animation:st-spark 2.4s ease-out infinite; animation-delay:calc(var(--k, 0) * .3s); }
@keyframes st-spark {
  0% { opacity:0; transform:rotate(var(--a)) translateX(26px) scale(.4); }
  20% { opacity:1; }
  100% { opacity:0; transform:rotate(var(--a)) translateX(92px) scale(1); }
}
.theme-home .st-ring { fill:none; stroke:#ffe08a; stroke-width:3; opacity:0; transform-origin:0 0; }
.theme-home .hero-stair[data-stage='4'] .st-ring { animation:st-ring 1.1s ease-out both; }
@keyframes st-ring { from { opacity:.9; transform:scale(.6); } to { opacity:0; transform:scale(7); } }
@media (max-width:900px) {
  .theme-home .hero-stair { right:50%; translate:50% -46%; opacity:.35; max-width:80vw; }
}

@keyframes hs-drop { from { opacity:0; transform:translateY(-18px); } to { opacity:1; transform:none; } }
@keyframes hs-rise { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
@keyframes hs-land {
  from { opacity:0; transform:perspective(1200px) translateY(60px) rotateX(20deg) scale(.94); }
  to { opacity:1; transform:none; }
}
@media (max-width:480px) { .theme-home .home-signed-in { padding:40px 22px 32px; border-radius:26px; } .theme-home .home-signed-in h1 { font-size:2.1rem; } }

@media (prefers-reduced-motion: reduce) {
  .theme-home *, .theme-home *::before { animation:none !important; transition:none !important; }
}
`
function HomeStyles() { return <style>{homeCss}</style> }

const roleHome = (role) => role === 'admin' ? '/admin/dashboard' : role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'
const roleProfile = (role) => `/${role}/profile`
const money = (value) => `$${Number(value || 0).toFixed(0)}`

function useData(path, refresh = 0) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  const load = useCallback(() => {
    setState((old) => ({ ...old, loading: true, error: '' }))
    api(path).then((result) => setState({ data: result, loading: false, error: '' }))
      .catch((error) => setState({ data: null, loading: false, error: errorText(error) }))
  }, [path])
  useEffect(() => { load() }, [load, refresh])
  return { ...state, reload: load }
}

function PageState({ loading, error, children }) {
  if (loading) return <div className="page-state"><span className="spinner" /> Loading your workspace…</div>
  if (error) return <div className="page-state error-state"><strong>We couldn’t load this page.</strong><span>{error}</span><button className="button button-quiet ghost" onClick={() => window.location.reload()}>Try again</button></div>
  return children
}

function Header({ minimal = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  async function signOut() {
    try { await logout(); navigate('/') } catch (error) { window.alert(errorText(error)) }
  }
  return <header className="site-header">
    <div className="header-inner nav-shell">
      <Link className="brand" to="/" aria-label="FindMyTutor home"><span className="brand-mark"><GraduationCap size={20} /></span><span>FindMyTutor</span></Link>
      <button className="mobile-menu button-icon" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
      <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'}>
        <Link onClick={() => setMenuOpen(false)} to="/tutors">Find Tutors</Link>
        {user && <Link onClick={() => setMenuOpen(false)} to={roleHome(user.role)}>My workspace</Link>}
        {user ? <div className="nav-user"><span className="avatar-mini">{user.name?.slice(0, 1)}</span><span className="nav-user-name">{user.name}</span><button className="button-link" onClick={signOut}><LogOut size={15} /> Sign out</button></div> : minimal ? null : <div className="nav-actions"><Link className="button button-quiet ghost" to="/#login-card" onClick={() => setMenuOpen(false)}>Log in</Link><Link className="button button-primary button-small primary" to="/register">Join FindMyTutor <ArrowRight size={15} /></Link></div>}
      </nav>
    </div>
  </header>
}

function Footer() {
  return <footer className="site-footer footer"><div className="footer-inner footer-grid"><Link className="brand footer-brand" to="/" aria-label="FindMyTutor home"><span className="brand-mark"><GraduationCap size={19} /></span><span>FindMyTutor</span></Link><span>© {new Date().getFullYear()} FindMyTutor</span><Link to="/tutors">Find Tutors <ArrowRight size={14} /></Link></div></footer>
}

function Layout({ children, themed = false }) {
  return themed
    ? <div className="theme-home"><HomeStyles /><Header minimal />{children}</div>
    : <><Header />{children}<Footer /></>
}

function Protected({ role, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="page-state"><span className="spinner" /> Checking your account…</div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (user.role !== role) return <Navigate to={roleHome(user.role)} replace />
  if (user.account_status !== 'active') return <Navigate to="/login" replace />
  return children
}

function LoginRedirect() {
  const location = useLocation()
  const next = location.state?.from || new URLSearchParams(location.search).get('next')
  return <Navigate
    to={{ pathname: '/', search: next ? `?next=${encodeURIComponent(next)}` : '', hash: '#login-card' }}
    replace
    state={next ? { from: next } : undefined}
  />
}

function App() {
  return <Routes>
    <Route path="/" element={<Layout themed><Home /></Layout>} />
    <Route path="/tutors" element={<Layout><BrowsePage /></Layout>} />
    <Route path="/tutors/:id" element={<Layout><TutorDetail /></Layout>} />
    <Route path="/login" element={<LoginRedirect />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/student/dashboard" element={<Protected role="student"><StudentDashboard /></Protected>} />
    <Route path="/student/profile" element={<Protected role="student"><AccountProfile role="student" /></Protected>} />
    <Route path="/student/bookings" element={<Protected role="student"><BookingsPage role="student" /></Protected>} />
    <Route path="/student/bookings/:id" element={<Protected role="student"><BookingDetail role="student" /></Protected>} />
    <Route path="/tutor/dashboard" element={<Protected role="tutor"><TutorDashboard /></Protected>} />
    <Route path="/tutor/listings" element={<Protected role="tutor"><MyListings /></Protected>} />
    <Route path="/tutor/listings/new" element={<Protected role="tutor"><ListingEditor /></Protected>} />
    <Route path="/tutor/listings/:id/edit" element={<Protected role="tutor"><ListingEditor /></Protected>} />
    <Route path="/tutor/bookings" element={<Protected role="tutor"><BookingsPage role="tutor" /></Protected>} />
    <Route path="/tutor/bookings/:id" element={<Protected role="tutor"><BookingDetail role="tutor" /></Protected>} />
    <Route path="/tutor/profile" element={<Protected role="tutor"><AccountProfile role="tutor" /></Protected>} />
    <Route path="/admin/dashboard" element={<Protected role="admin"><AdminDashboard /></Protected>} />
    <Route path="/admin/profile" element={<Protected role="admin"><AccountProfile role="admin" /></Protected>} />
    <Route path="/admin/users" element={<Protected role="admin"><AdminUsers /></Protected>} />
    <Route path="/admin/subjects" element={<Protected role="admin"><AdminSubjects /></Protected>} />
    <Route path="/admin/listings" element={<Protected role="admin"><AdminListings /></Protected>} />
    <Route path="/admin/listings/:id/edit" element={<Protected role="admin"><ListingEditor admin /></Protected>} />
    <Route path="/admin/bookings" element={<Protected role="admin"><BookingsPage role="admin" /></Protected>} />
    <Route path="/admin/bookings/:id" element={<Protected role="admin"><BookingDetail role="admin" /></Protected>} />
    <Route path="*" element={<Layout><NotFound /></Layout>} />
  </Routes>
}

const STAIR_STEPS = 8
const clamp01 = (value) => Math.max(0, Math.min(1, value))
const starPath = (outer, inner) => {
  const points = []
  for (let k = 0; k < 10; k += 1) {
    const radius = k % 2 ? inner : outer
    const angle = -Math.PI / 2 + k * Math.PI / 5
    points.push(`${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`)
  }
  return `M${points.join('L')}Z`
}
const STAR_PATH = starPath(34, 14)
const SPARKLE_PATH = 'M0,-74 L6,-6 L74,0 L6,6 L0,74 L-6,6 L-74,0 L-6,-6Z'
const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315]

/* Staircase that lights step by step while you type; the star appears once the password is in. */
function StairLight({ progress, stage }) {
  const total = progress * (STAIR_STEPS + 1.6)
  const steps = Array.from({ length: STAIR_STEPS }, (_, i) => {
    const w = 440 - i * 38
    return { i, y: 480 - i * 40, w, x: 300 - w / 2, lit: clamp01(total - i) }
  })
  const platformLit = clamp01(total - STAIR_STEPS)
  const archLit = clamp01(total - (STAIR_STEPS + 0.6))
  const treadPath = ({ x, y, w }) => `M${x} ${y} L${x + w} ${y} L${x + w - 7} ${y - 14} L${x + 7} ${y - 14}Z`
  return <div className={progress > 0 ? 'hero-stair is-live' : 'hero-stair'} style={{ '--p': progress }} data-stage={stage} data-star={progress >= 0.999} aria-hidden="true">
    <svg viewBox="0 -90 600 650">
      <defs>
        <linearGradient id="st-riser" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a3833" /><stop offset="1" stopColor="#121a17" /></linearGradient>
        <linearGradient id="st-tread" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f4f48" /><stop offset="1" stopColor="#2b3833" /></linearGradient>
        <linearGradient id="st-riser-lit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8dffd8" /><stop offset="1" stopColor="#1f9d6d" /></linearGradient>
        <linearGradient id="st-tread-lit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e3fff3" /><stop offset="1" stopColor="#7beec0" /></linearGradient>
        <linearGradient id="st-gold-riser" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6d6235" /><stop offset="1" stopColor="#3a3420" /></linearGradient>
        <linearGradient id="st-gold-tread" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ab9c5a" /><stop offset="1" stopColor="#73683c" /></linearGradient>
        <linearGradient id="st-gold-lit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3b8" /><stop offset="1" stopColor="#e7b94c" /></linearGradient>
        <radialGradient id="st-disc-lit"><stop offset="0" stopColor="#fff6cf" /><stop offset=".55" stopColor="#ffd36b" /><stop offset="1" stopColor="#8a6a1c" /></radialGradient>
        <radialGradient id="st-star-fill"><stop offset="0" stopColor="#ffffff" /><stop offset=".55" stopColor="#ffeaa6" /><stop offset="1" stopColor="#ffc94d" /></radialGradient>
        <filter id="st-blur" x="-40%" y="-120%" width="180%" height="340%"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id="st-blur-lg" x="-40%" y="-200%" width="180%" height="500%"><feGaussianBlur stdDeviation="24" /></filter>
        <filter id="st-blur-sm" x="-20%" y="-300%" width="140%" height="700%"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>

      <ellipse cx="300" cy="528" rx="250" ry="20" fill="#000" opacity=".6" filter="url(#st-blur-lg)" />
      <ellipse cx="300" cy="526" rx="230" ry="14" fill="#3edca0" opacity={0.12 + progress * 0.5} filter="url(#st-blur-lg)" />

      {steps.map((s) => <rect key={`g${s.i}`} className="st-glow" style={{ '--lit': s.lit }} x={s.x - 6} y={s.y - 18} width={s.w + 12} height="48" rx="10" filter="url(#st-blur)" />)}
      <rect className="st-glow st-glow-gold" style={{ '--lit': platformLit }} x="219" y="124" width="162" height="48" rx="10" filter="url(#st-blur)" />
      <path className="st-arch-glow" style={{ '--lit': archLit }} d="M250 146 V118 A50 50 0 0 1 350 118 V146" filter="url(#st-blur)" />

      {[...steps].reverse().map((s) => <g key={s.i} className="st-step" style={{ '--lit': s.lit, '--i': s.i }}>
        <path className="st-tread" d={treadPath(s)} />
        <rect className="st-riser" x={s.x} y={s.y} width={s.w} height="26" rx="3" />
        <path className="st-tread-lit st-lit" d={treadPath(s)} />
        <rect className="st-riser-lit st-lit" x={s.x} y={s.y} width={s.w} height="26" rx="3" />
        <rect className="st-edge-base" x={s.x} y={s.y - 1.5} width={s.w} height="3" rx="1.5" />
        <rect className="st-edge-glow" x={s.x} y={s.y - 3} width={s.w} height="6" rx="3" filter="url(#st-blur-sm)" />
        <rect className="st-edge st-lit" x={s.x} y={s.y - 1.5} width={s.w} height="3" rx="1.5" />
        <path className="st-sweep" d={treadPath(s)} />
        <rect className="st-sweep" x={s.x} y={s.y} width={s.w} height="26" rx="3" />
      </g>)}

      <g className="st-step st-gold" style={{ '--lit': platformLit, '--i': STAIR_STEPS }}>
        <path className="st-tread" d={treadPath({ x: 225, y: 160, w: 150 })} />
        <rect className="st-riser" x="225" y="160" width="150" height="26" rx="3" />
        <path className="st-tread-lit st-lit" d={treadPath({ x: 225, y: 160, w: 150 })} />
        <rect className="st-riser-lit st-lit" x="225" y="160" width="150" height="26" rx="3" />
        <rect className="st-edge-glow" x="225" y="157" width="150" height="6" rx="3" filter="url(#st-blur-sm)" />
        <rect className="st-edge st-lit" x="225" y="158.5" width="150" height="3" rx="1.5" />
      </g>

      <path className="st-arch" d="M250 146 V118 A50 50 0 0 1 350 118 V146" />
      <path className="st-arch-lit" style={{ '--lit': archLit }} d="M250 146 V118 A50 50 0 0 1 350 118 V146" />
      <circle className="st-disc" cx="300" cy="116" r="28" />
      <circle className="st-disc-lit" style={{ '--lit': archLit }} cx="300" cy="116" r="28" />

      <g transform="translate(300 116)">
        <circle className="st-ring" r="30" />
        <g className="st-star-pop">
          <g className="st-float">
            <circle className="st-halo" r="64" fill="#ffd36b" opacity=".6" filter="url(#st-blur-lg)" />
            <g className="st-rays"><path d={SPARKLE_PATH} fill="#fff1b8" opacity=".85" filter="url(#st-blur-sm)" /><path d={SPARKLE_PATH} fill="#fff7d6" transform="rotate(45) scale(.62)" opacity=".8" /></g>
            <path d={STAR_PATH} fill="url(#st-star-fill)" stroke="#fff7d6" strokeWidth="1.5" strokeLinejoin="round" />
            {SPARKS.map((angle, k) => <circle key={angle} className="st-spark" style={{ '--a': `${angle}deg`, '--k': k }} r="3" />)}
          </g>
        </g>
      </g>
    </svg>
  </div>
}

const heroPerks = [
  { icon: <ShieldCheck size={15} />, text: 'Admin-approved tutors' },
  { icon: <CalendarDays size={15} />, text: 'Request a lesson in minutes' },
  { icon: <MapPin size={15} />, text: 'Phnom Penh & online' },
]

// set to true to use your own LearningArchitecture3D scene instead of the lit staircase
const USE_3D_STAIR = false

function Home() {
  const { user } = useAuth()
  const [loginStage, setLoginStage] = useState(0)
  const [typed, setTyped] = useState({ email: 0, password: 0 })
  // email fills the first 40% of the stairs, the password the rest; signing in / signed in = full
  const progress = user || loginStage >= 3 ? 1 : Math.round((clamp01(typed.email / 14) * 0.4 + clamp01(typed.password / 6) * 0.6) * 100) / 100
  const stage = user ? 4 : loginStage
  function trackInput(event) {
    const { id, value } = event.target
    if (id === 'home-email') setTyped((old) => ({ ...old, email: value.length }))
    else if (id === 'home-password') setTyped((old) => ({ ...old, password: value.length }))
  }
  return (
    <main>
      <section className="hero-full">
        {USE_3D_STAIR
          ? <div className="hero-3d">
            <Suspense fallback={<div className="learning-architecture learning-architecture-fallback" aria-hidden="true" />}>
              <LearningArchitecture3D stage={loginStage} progress={progress} />
            </Suspense>
          </div>
          : <StairLight progress={progress} stage={stage} />}
        <div className="hero-full-shade" aria-hidden="true" />
        <div className="hero-full-inner" onInput={trackInput}>
          {!user
            ? <LoginCard onStageChange={setLoginStage} />
            : <div className="home-signed-in"><span className="kicker">Welcome back</span><h1>Ready to keep learning?</h1><Link className="button button-primary primary" to={roleHome(user.role)}>Open my workspace <ArrowRight size={16} /></Link></div>}
        </div>
        <div className="hero-strip">
          {heroPerks.map((perk, index) => <span className="hero-chip" style={{ '--i': index }} key={perk.text}><span className="hero-chip-icon">{perk.icon}</span>{perk.text}</span>)}
        </div>
      </section>
    </main>
  )
}

function EmptyState({ icon, title, body, action }) { return <div className="empty-state">{icon && <div className="empty-icon">{icon}</div>}<h2>{title}</h2><p>{body}</p>{action}</div> }

function ListingCard({ listing }) {
  return <article className="listing-card tutor-card"><Link className="listing-image tutor-portrait" to={`/tutors/${listing.tutor_listing_id}`}>
      {listing.image_path ? <img src={listing.image_path} alt={`${listing.tutor_name} tutoring ${listing.subject_name}`} /> : <div className="listing-placeholder"><BookOpen size={42} /><span>{listing.subject_name}</span></div>}
      <span className="listing-subject">{listing.subject_name}</span>
    </Link><div className="listing-card-body"><div className="listing-title-line tutor-card-top"><div><span className="listing-tutor">{listing.tutor_name}</span><h3><Link to={`/tutors/${listing.tutor_listing_id}`}>{listing.title}</Link></h3></div><strong>{money(listing.teaching_fee)}<small>/hr</small></strong></div><p>{listing.description}</p><div className="listing-meta tutor-meta"><span><MapPin size={14} />{listing.location || 'Online & flexible'}</span><span><Clock3 size={14} />{listing.experience ?? 0}+ yrs</span></div><Link className="card-link" to={`/tutors/${listing.tutor_listing_id}`}>View tutor <ArrowRight size={15} /></Link></div></article>
}

function BrowsePage() {
  const [params, setParams] = useSearchParams()
  const query = params.toString()
  const { data, loading, error } = useData(`/listings?limit=12&${query}`)
  const { data: subjectData } = useData('/subjects')
  const listings = data?.data || []
  const subjects = subjectData?.data || []
  const [form, setForm] = useState({ q: params.get('q') || '', subject: params.get('subject') || '', location: params.get('location') || '', min: params.get('min') || '', max: params.get('max') || '', sort: params.get('sort') || 'newest' })
  function submit(event) { event.preventDefault(); const next = new URLSearchParams(); Object.entries(form).forEach(([key, value]) => value && next.set(key, value)); setParams(next) }
  function clear() { setForm({ q: '', subject: '', location: '', min: '', max: '', sort: 'newest' }); setParams({}) }
  return <main className="page-main page-shell"><div className="content-width container"><div className="page-title-row page-intro"><div><span className="kicker">Tutor directory</span><h1>Find your tutor</h1><p>Explore tutors and find someone who fits your learning goals.</p></div></div>
      <form className="filter-panel" onSubmit={submit}><label className="search-input search-field"><Search size={18} /><input value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} placeholder="Name, subject, or keyword" aria-label="Search tutor listings" /></label><select aria-label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option value="">All subjects</option>{subjects.map((subject) => <option value={subject.subject_id} key={subject.subject_id}>{subject.subject_name}</option>)}</select><input aria-label="Location" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /><div className="fee-filter fee-fields"><input aria-label="Minimum fee" type="number" min="0" placeholder="Min $" value={form.min} onChange={(e) => setForm({ ...form, min: e.target.value })} /><span>–</span><input aria-label="Maximum fee" type="number" min="0" placeholder="Max $" value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value })} /></div><select aria-label="Sort by" value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value })}><option value="newest">Recently added</option><option value="name">Tutor name</option><option value="fee">Lowest fee</option><option value="experience">Most experience</option></select><button className="button button-primary primary" type="submit"><Search size={16} /> Apply filters</button>{query && <button className="button button-quiet ghost" type="button" onClick={clear}><X size={15} /> Clear</button>}</form>
      <div className="results-bar"><p><strong>{data?.pagination?.total ?? '—'}</strong> {data?.pagination?.total === 1 ? 'tutor' : 'tutors'} found</p><span>Page {data?.pagination?.page ?? 1} of {data?.pagination?.totalPages || 1}</span></div>
      <PageState loading={loading} error={error}>{listings.length ? <div className="listing-grid tutor-grid">{listings.map((item) => <ListingCard key={item.tutor_listing_id} listing={item} />)}</div> : <EmptyState icon={<Search />} title="No tutor listings found" body="Try a different keyword or clear your filters to see all available tutors." action={<button className="button button-outline secondary" onClick={clear}>Clear filters</button>} />}</PageState>
      {data?.pagination?.totalPages > 1 && <div className="pagination pagination-row"><button className="button button-outline secondary" disabled={Number(params.get('page') || 1) <= 1} onClick={() => setParams({ ...Object.fromEntries(params), page: String(Number(params.get('page') || 1) - 1) })}>Previous</button><span>Page {data.pagination.page} of {data.pagination.totalPages}</span><button className="button button-outline secondary" disabled={data.pagination.page >= data.pagination.totalPages} onClick={() => setParams({ ...Object.fromEntries(params), page: String(data.pagination.page + 1) })}>Next</button></div>}</div></main>
}

function AuthPage({ mode }) {
  const register = mode === 'register'
  const { login, register: createAccount } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [state, setState] = useState({ busy: false, message: '', error: '' })
  async function submit(event) {
    event.preventDefault(); setState({ busy: true, message: '', error: '' })
    try {
      if (register) {
        const result = await createAccount(form)
        if (result.data.user?.account_status !== 'active') return setState({ busy: false, message: result.message, error: '' })
        navigate(roleHome(result.data.user.role))
      } else {
        const result = await login({ email: form.email, password: form.password })
        navigate(location.state?.from || new URLSearchParams(location.search).get('next') || roleHome(result.data.user.role))
      }
    } catch (error) { setState({ busy: false, message: '', error: errorText(error) }) }
  }
  return <main className="auth-layout auth-page"><section className="auth-card auth-panel"><Link className="brand" to="/"><span className="brand-mark"><GraduationCap size={20} /></span><span>FindMyTutor</span></Link><Link className="back-link" to="/"><ArrowLeft size={15} /> Back to home</Link><div className="auth-heading"><span className="kicker">{register ? 'A fresh start' : 'Welcome back'}</span><h1>{register ? 'Create your account.' : 'Good to see you again.'}</h1><p>{register ? 'Join as a student to find a tutor, or as a tutor to share your expertise.' : 'Log in to manage your learning, listings, and lesson requests.'}</p></div>
    <form className="form-stack auth-form" onSubmit={submit}>{register && <Field label="Full name"><input required minLength="2" maxLength="120" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>}<Field label="Email address"><input required type="email" maxLength="254" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field><Field label="Password"><input required type="password" minLength="8" autoComplete={register ? 'new-password' : 'current-password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />{register && <small>At least 8 characters, with one uppercase letter and one number.</small>}</Field>{register && <Field label="I’m joining as"><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="student">Student</option><option value="tutor">Tutor</option></select></Field>}{state.error && <Notice tone="error">{state.error}</Notice>}{state.message && <Notice tone="success">{state.message}</Notice>}<button className="button button-primary button-full primary" disabled={state.busy}>{state.busy ? 'Please wait…' : register ? 'Create account' : 'Log in'} <ArrowRight size={17} /></button></form>
    <p className="auth-switch">{register ? 'Already have an account?' : 'New to FindMyTutor?'} <Link to={register ? '/login' : '/register'}>{register ? 'Log in' : 'Create an account'}</Link></p><div className="auth-assurance"><ShieldCheck size={16} /> Your account details stay private and secure.</div>
  </section><aside className="auth-aside auth-visual-panel"><div className="auth-promo-copy"><span>FindMyTutor · Phnom Penh</span><h2>A little support can open up a lot.</h2><p>Good tutoring begins with the right fit.</p><div className="auth-promo-rule" /><span>Browse real tutor profiles · Compare clearly · Book with confidence</span></div></aside></main>
}

function Field({ label, children, hint }) { return <label className="form-field field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label> }
function Notice({ children, tone = 'info' }) { return <div className={`notice notice-${tone}`} role="status">{children}</div> }

function TutorDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data, loading, error } = useData(`/listings/${id}`)
  const listing = data?.data
  const [form, setForm] = useState({ requested_date: '', requested_time: '' })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function book(event) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      await api('/bookings', { method: 'POST', body: { tutor_listing_id: Number(id), ...form } })
      setMessage('Your request is on its way. You can follow its status in My bookings.')
      setForm({ requested_date: '', requested_time: '' })
    } catch (error) { setMessage(errorText(error)) } finally { setBusy(false) }
  }
  return <main className="page-main page-shell"><div className="content-width container"><PageState loading={loading} error={error}>{listing && <><Link className="back-link" to="/tutors"><ArrowLeft size={15} /> Back to tutors</Link><div className="detail-layout profile-grid"><article className="detail-main profile-main"><div className="detail-cover">{listing.image_path ? <img src={listing.image_path} alt={`${listing.tutor_name} tutoring ${listing.subject_name}`} /> : <div className="listing-placeholder detail-placeholder"><BookOpen size={56} /><span>{listing.subject_name}</span></div>}<span className="listing-subject">{listing.subject_name}</span></div><div className="detail-heading profile-heading"><div><span className="kicker">Meet your tutor</span><h1>{listing.title}</h1><p className="detail-tutor">With {listing.tutor_name}</p></div><strong className="detail-rate">{money(listing.teaching_fee)}<small> / hour</small></strong></div><div className="detail-stats profile-meta"><span><MapPin />{listing.location || 'Location flexible'}</span><span><Clock3 />{listing.experience ?? 0} years experience</span><span><Check />Available for new students</span></div><section className="detail-section profile-section"><h2>About this lesson</h2><p>{listing.description}</p></section><section className="detail-section profile-section"><h2>Qualifications</h2><p>{listing.qualification || 'Tutor details are available on request.'}</p></section></article><aside className="booking-panel booking-card"><span className="kicker">Take the next step</span><h2>Request a lesson</h2><p>Choose a time that works for you. Your tutor will review the request.</p>{user?.role === 'student' ? <form className="form-stack auth-form" onSubmit={book}><Field label="Preferred date"><input required type="date" min={new Date().toISOString().slice(0, 10)} value={form.requested_date} onChange={(e) => setForm({ ...form, requested_date: e.target.value })} /></Field><Field label="Preferred time"><input required type="time" value={form.requested_time} onChange={(e) => setForm({ ...form, requested_time: e.target.value })} /></Field>{message && <Notice tone={message.startsWith('Your request') ? 'success' : 'error'}>{message}</Notice>}<button className="button button-primary button-full primary" disabled={busy}>{busy ? 'Sending…' : 'Send request'} <ArrowRight size={16} /></button><small className="quiet-note">No payment is collected when you request a lesson.</small></form> : user ? <Notice>Student accounts can request lessons. Sign in with a student account to continue.</Notice> : <><Link className="button button-primary button-full primary" to={`/login?next=/tutors/${id}`}>Log in to request <ArrowRight size={16} /></Link><p className="booking-footnote">New here? <Link to="/register">Create a free account.</Link></p></>}</aside></div></>}</PageState></div></main>
}

function DashboardShell({ kicker, title, description, links, children }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  async function signOut() {
    try { await logout(); navigate('/') } catch (error) { window.alert(errorText(error)) }
  }
  return <div className="dashboard-layout">
    <aside className="dashboard-sidebar">
      <Link className="brand" to="/"><span className="brand-mark"><GraduationCap size={20} /></span><span>FindMyTutor</span></Link>
      <div className="role-label">{user?.role} workspace</div>
      <nav>{links.map((item) => <Link key={item.to} className={location.pathname === item.to ? 'active' : ''} to={item.to}>{item.icon}{item.label}</Link>)}</nav>
      <button className="sidebar-logout" onClick={signOut}>Sign out</button>
    </aside>
    <div className="dashboard-content">
      <header className="dashboard-topbar"><div className="dashboard-user"><span>Signed in as</span><strong>{user?.name}</strong></div><div className="dashboard-topbar-actions"><Link to={roleProfile(user?.role)}>My profile <Users size={15} /></Link><Link to="/">View site <ArrowRight size={15} /></Link></div></header>
      <main className="dashboard-main"><div className="dashboard-heading"><div><span className="kicker">{kicker}</span><h1>{title}</h1>{description && <p>{description}</p>}</div><span className="workspace-welcome">Welcome, {user?.name?.split(' ')[0]}</span></div>{children}</main>
    </div>
  </div>
}

const studentLinks = [{ to: '/student/dashboard', label: 'Overview', icon: <BookOpen size={17} /> }, { to: '/student/bookings', label: 'My bookings', icon: <CalendarDays size={17} /> }, { to: '/tutors', label: 'Find a tutor', icon: <Search size={17} /> }, { to: '/student/profile', label: 'Profile', icon: <Users size={17} /> }]
const tutorLinks = [{ to: '/tutor/dashboard', label: 'Overview', icon: <BookOpen size={17} /> }, { to: '/tutor/listings', label: 'My listings', icon: <GraduationCap size={17} /> }, { to: '/tutor/bookings', label: 'Requests', icon: <CalendarDays size={17} /> }, { to: '/tutor/profile', label: 'Profile', icon: <Users size={17} /> }]
const adminLinks = [{ to: '/admin/dashboard', label: 'Overview', icon: <BookOpen size={17} /> }, { to: '/admin/users', label: 'Users', icon: <Users size={17} /> }, { to: '/admin/subjects', label: 'Subjects', icon: <GraduationCap size={17} /> }, { to: '/admin/listings', label: 'Listings', icon: <Search size={17} /> }, { to: '/admin/bookings', label: 'Bookings', icon: <CalendarDays size={17} /> }, { to: '/admin/profile', label: 'Profile', icon: <Users size={17} /> }]

function StudentDashboard() {
  const { data, loading, error } = useData('/bookings')
  const bookings = data?.data || []
  const upcoming = bookings.filter((booking) => booking.status === 'pending' || booking.status === 'accepted')
  return <DashboardShell kicker="Your learning" title="Student workspace" description="Keep your lesson requests and learning plans in one place." links={studentLinks}><PageState loading={loading} error={error}><div className="metric-grid stat-grid"><Metric label="My requests" value={bookings.length} icon={<CalendarDays />} /><Metric label="Upcoming lessons" value={upcoming.length} icon={<Clock3 />} /><Metric label="Next step" value={upcoming[0]?.status || 'Explore'} icon={<ArrowRight />} /></div><div className="workspace-section-head dashboard-section"><div><span className="kicker">Your activity</span><h2>Recent bookings</h2></div><Link className="text-link" to="/student/bookings">View all <ArrowRight size={15} /></Link></div>{bookings.length ? <BookingTable bookings={bookings.slice(0, 4)} role="student" /> : <EmptyState title="Your learning journey starts here" body="Browse tutor profiles and send a lesson request when you find the right fit." action={<Link className="button button-primary primary" to="/tutors">Find a tutor <ArrowRight size={15} /></Link>} />}</PageState></DashboardShell>
}

function TutorDashboard() {
  const { data: listingData, loading: listingsLoading, error: listingsError } = useData('/listings/mine')
  const { data: bookingData, loading: bookingsLoading, error: bookingsError } = useData('/bookings')
  const listings = listingData?.data || []
  const bookings = bookingData?.data || []
  const pending = bookings.filter((booking) => booking.status === 'pending')
  return <DashboardShell kicker="Your teaching" title="Tutor workspace" description="Manage your listings and keep up with lesson requests." links={tutorLinks}><PageState loading={listingsLoading || bookingsLoading} error={listingsError || bookingsError}><div className="metric-grid stat-grid"><Metric label="My listings" value={listings.length} icon={<GraduationCap />} /><Metric label="Pending requests" value={pending.length} icon={<CalendarDays />} /><Metric label="Available listings" value={listings.filter((item) => item.status === 'available').length} icon={<Check />} /></div><div className="workspace-section-head dashboard-section"><div><span className="kicker">A quick look</span><h2>Recent requests</h2></div><Link className="text-link" to="/tutor/bookings">Manage requests <ArrowRight size={15} /></Link></div>{pending.length ? <BookingTable bookings={pending.slice(0, 5)} role="tutor" /> : <EmptyState title="No new requests yet" body="Your open lesson requests will appear here." />}</PageState></DashboardShell>
}

function Metric({ label, value, icon }) { return <article className="metric-card stat-card"><span className="metric-icon">{icon}</span><div><strong>{value}</strong><p className="metric-label">{label}</p></div></article> }

function AccountProfile({ role }) {
  const { user, refresh } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [state, setState] = useState({ busy: false, message: '', error: '' })
  async function submit(event) { event.preventDefault(); setState({ busy: true, message: '', error: '' }); try { await api('/auth/profile', { method: 'PATCH', body: { name } }); await refresh(); setState({ busy: false, message: 'Profile updated.', error: '' }) } catch (error) { setState({ busy: false, message: '', error: errorText(error) }) } }
  const links = role === 'admin' ? adminLinks : role === 'tutor' ? tutorLinks : studentLinks
  const roleCopy = { student: 'Your learning account and contact details.', tutor: 'Your account details and teaching workspace.', admin: 'Your administrator account details.' }
  return <DashboardShell kicker="Account settings" title="My profile" description={roleCopy[role]} links={links}><section className="account-profile-card"><div className="account-profile-avatar">{user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}</div><div className="account-profile-summary"><span className="status status-badge status-active">Active account</span><h2>{user?.name}</h2><p>{capitalize(role)} account</p></div><div className="account-profile-email"><span>Email address</span><strong>{user?.email}</strong></div></section><form className="form-card form-stack account-profile-form panel" onSubmit={submit}><div><span className="kicker">Personal information</span><h2>Account details</h2><p className="account-profile-help">Update the name shown in your workspace and booking requests.</p></div><Field label="Full name"><input required minLength="2" maxLength="120" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></Field><Field label="Email address"><input type="email" value={user?.email || ''} readOnly aria-readonly="true" /></Field>{role === 'tutor' && <div className="profile-next-step"><GraduationCap size={19} /><span>Manage your teaching subjects, fees, experience, and location in your tutor listings.</span><Link to="/tutor/listings">Manage listings <ArrowRight size={15} /></Link></div>}{state.message && <Notice tone="success">{state.message}</Notice>}{state.error && <Notice tone="error">{state.error}</Notice>}<div className="form-actions"><button className="button button-primary primary" disabled={state.busy}>{state.busy ? 'Saving…' : 'Save changes'}</button></div></form></DashboardShell>
}

function BookingsPage({ role }) {
  const isAdmin = role === 'admin'
  const path = isAdmin ? '/admin/bookings' : '/bookings'
  const { data, loading, error } = useData(path)
  const bookings = data?.data || []
  const [filter, setFilter] = useState('all')
  const shown = filter === 'all' ? bookings : bookings.filter((item) => item.status === filter)
  const links = isAdmin ? adminLinks : role === 'tutor' ? tutorLinks : studentLinks
  const heading = isAdmin ? 'All bookings' : role === 'tutor' ? 'Lesson requests' : 'My bookings'
  const caption = isAdmin ? 'Review and manage every lesson request.' : role === 'tutor' ? 'Respond to requests for lessons on your listings.' : 'See the status and details of your lesson requests.'
  return <DashboardShell kicker={isAdmin ? 'Platform management' : role === 'tutor' ? 'Your teaching' : 'Your learning'} title={heading} description={caption} links={links}><PageState loading={loading} error={error}><div className="list-toolbar"><div><span className="kicker">{bookings.length} total</span></div><select aria-label="Filter booking status" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All statuses</option>{['pending', 'accepted', 'rejected', 'cancelled'].map((status) => <option value={status} key={status}>{capitalize(status)}</option>)}</select></div>{shown.length ? <BookingTable bookings={shown} role={role} /> : <EmptyState title="No bookings to show" body={filter === 'all' ? 'New lesson requests will appear here.' : `There are no ${filter} bookings.`} />}</PageState></DashboardShell>
}

function BookingTable({ bookings, role }) {
  const navigate = useNavigate()
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  async function changeStatus(id, status) { setBusyId(id); setError(''); try { await api(role === 'admin' ? `/admin/bookings/${id}/status` : `/bookings/${id}/status`, { method: 'PATCH', body: { status } }); window.location.reload() } catch (error) { setError(errorText(error)); setBusyId(null) } }
  return <div className="booking-list">{error && <Notice tone="error">{error}</Notice>}{bookings.map((booking) => {
    const lessonDate = new Date(`${String(booking.requested_date).slice(0, 10)}T12:00:00`)
    const day = lessonDate.toLocaleDateString('en', { day: '2-digit' })
    const month = lessonDate.toLocaleDateString('en', { month: 'short' })
    const person = role === 'student' ? booking.tutor_name : booking.student_name
    const detailsPath = `${role === 'admin' ? '/admin' : role === 'tutor' ? '/tutor' : '/student'}/bookings/${booking.booking_id}`
    return <article className="booking-row" key={booking.booking_id}>
      <div className="booking-primary"><div className="date-tile"><strong>{day}</strong><span>{month}</span></div><div><h3>{booking.listing_title}</h3><p>{booking.subject_name} · {person}</p></div></div>
      <div className="booking-details"><span><CalendarDays size={16} />{formatDate(booking.requested_date)} · {String(booking.requested_time).slice(0, 5)}</span><span><StatusBadge status={booking.status} /></span></div>
      <div className="booking-actions"><button className="small-button secondary" onClick={() => navigate(detailsPath)}>Details</button>{role === 'admin' && <select aria-label={`Update booking ${booking.booking_id} status`} value={booking.status} disabled={busyId === booking.booking_id} onChange={(event) => changeStatus(booking.booking_id, event.target.value)}>{['pending', 'accepted', 'rejected', 'cancelled'].map((status) => <option value={status} key={status}>{capitalize(status)}</option>)}</select>}{booking.status === 'pending' && role === 'tutor' && <><button disabled={busyId === booking.booking_id} className="small-button" onClick={() => changeStatus(booking.booking_id, 'accepted')}>Accept</button><button disabled={busyId === booking.booking_id} className="small-button secondary" onClick={() => changeStatus(booking.booking_id, 'rejected')}>Reject</button></>}{booking.status === 'pending' && role === 'student' && <button className="small-button secondary" onClick={() => window.confirm('Cancel this pending lesson request?') && changeStatus(booking.booking_id, 'cancelled')}>Cancel</button>}</div>
    </article>
  })}</div>
}

function BookingDetail({ role }) {
  const { id } = useParams()
  const { data, loading, error } = useData(`/bookings/${id}`)
  const booking = data?.data
  const links = role === 'admin' ? adminLinks : role === 'tutor' ? tutorLinks : studentLinks
  return <DashboardShell kicker="Booking details" title={`Request #${id}`} description="Review the details of this lesson request." links={links}><PageState loading={loading} error={error}>{booking && <div className="form-card booking-detail-card panel"><div className="status-row"><StatusBadge status={booking.status} /><span>Submitted {formatDate(booking.created_at)}</span></div><h2>{booking.listing_title}</h2><p className="detail-tutor">{booking.subject_name}</p><div className="detail-stats profile-meta"><span><Users />{role === 'student' ? booking.tutor_name : booking.student_name}</span><span><CalendarDays />{formatDate(booking.requested_date)}</span><span><Clock3 />{String(booking.requested_time).slice(0, 5)}</span></div><Link className="button button-outline secondary" to={role === 'admin' ? '/admin/bookings' : role === 'tutor' ? '/tutor/bookings' : '/student/bookings'}><ArrowLeft size={15} /> Back to bookings</Link></div>}</PageState></DashboardShell>
}

function StatusBadge({ status }) { return <span className={`status status-badge ${status} status-${status}`}>{capitalize(status)}</span> }
function capitalize(value = '') { return value.charAt(0).toUpperCase() + value.slice(1) }
function formatDate(value) { if (!value) return '—'; const date = new Date(`${String(value).slice(0, 10)}T12:00:00`); return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date) }

function TutorListingTile({ listing, onDelete, editBase = '/tutor/listings' }) {
  return <article className="manage-listing"><div className="manage-listing-image">{listing.image_path ? <img src={listing.image_path} alt="" /> : <BookOpen size={25} />}</div><div className="manage-listing-info"><span>{listing.subject_name} · <StatusBadge status={listing.status} /></span><h3>{listing.title}</h3><p>{listing.description}</p><small>{listing.location || 'Location flexible'} · {money(listing.teaching_fee)}/hr</small></div><div className="manage-listing-actions"><Link className="button button-outline button-small secondary" to={`${editBase}/${listing.tutor_listing_id}/edit`}>Edit</Link><button className="button button-quiet button-small danger-link ghost" onClick={() => onDelete(listing)}>Delete</button></div></article>
}

function MyListings() {
  const { data, loading, error, reload } = useData('/listings/mine')
  const listings = data?.data || []
  const [message, setMessage] = useState('')
  async function remove(listing) {
    if (!window.confirm(`Delete “${listing.title}”? This cannot be undone.`)) return
    setMessage('')
    try { const result = await api(`/listings/${listing.tutor_listing_id}`, { method: 'DELETE' }); setMessage(result.message); reload() }
    catch (error) { setMessage(errorText(error)) }
  }
  return <DashboardShell kicker="Your teaching" title="My tutor listings" description="Keep your lesson offers current and easy to find." links={tutorLinks}><div className="workspace-section-head dashboard-section"><div><span className="kicker">{listings.length} listings</span><h2>Teaching offers</h2></div><Link className="button button-primary primary" to="/tutor/listings/new">Create a listing <ArrowRight size={15} /></Link></div>{message && <Notice tone={message.includes('cannot') || message.includes('in use') ? 'error' : 'success'}>{message}</Notice>}<PageState loading={loading} error={error}>{listings.length ? <div className="manage-listings">{listings.map((listing) => <TutorListingTile key={listing.tutor_listing_id} listing={listing} onDelete={remove} />)}</div> : <EmptyState title="Share what you teach" body="Create your first tutor listing to help students learn about your experience and teaching approach." action={<Link className="button button-primary primary" to="/tutor/listings/new">Create a listing <ArrowRight size={15} /></Link>} />}</PageState></DashboardShell>
}

function ListingEditor({ admin = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [form, setForm] = useState({ title: '', description: '', subject_id: '', qualification: '', experience: '', location: '', teaching_fee: '', status: 'available', tutor_id: '' })
  const [currentImage, setCurrentImage] = useState('')
  const [tutors, setTutors] = useState([])
  const [state, setState] = useState({ loading: true, busy: false, error: '' })
  useEffect(() => {
    let active = true
    Promise.all([api('/subjects'), id ? admin ? api(`/admin/listings/${id}`) : api('/listings/mine') : Promise.resolve(null), admin ? api('/admin/users?role=tutor&status=active&limit=100') : Promise.resolve(null)])
      .then(([subjectResult, listingResult, tutorResult]) => {
        if (!active) return
        setSubjects(subjectResult.data || [])
        if (id) {
          const listing = admin ? listingResult.data : listingResult.data.find((item) => String(item.tutor_listing_id) === id)
          if (!listing) throw new Error('Tutor listing not found.')
          setForm({ title: listing.title, description: listing.description, subject_id: String(listing.subject_id), qualification: listing.qualification || '', experience: listing.experience ?? '', location: listing.location || '', teaching_fee: listing.teaching_fee, status: listing.status, tutor_id: String(listing.tutor_id) })
          setCurrentImage(listing.image_path || '')
        }
        if (tutorResult) setTutors(tutorResult.data || [])
        setState({ loading: false, busy: false, error: '' })
      })
      .catch((error) => active && setState({ loading: false, busy: false, error: errorText(error) }))
    return () => { active = false }
  }, [id, admin])
  function change(key, value) { setForm((old) => ({ ...old, [key]: value })) }
  async function submit(event) {
    event.preventDefault(); setState({ loading: false, busy: true, error: '' })
    const data = new FormData(event.currentTarget)
    if (admin && form.tutor_id) data.set('tutor_id', form.tutor_id)
    try {
      await api(id ? `/listings/${id}` : '/listings', { method: id ? 'PATCH' : 'POST', body: data })
      navigate(admin ? '/admin/listings' : '/tutor/listings')
    } catch (error) { setState({ loading: false, busy: false, error: errorText(error) }) }
  }
  const links = admin ? adminLinks : tutorLinks
  const back = admin ? '/admin/listings' : '/tutor/listings'
  return <DashboardShell kicker={admin ? 'Platform management' : 'Your teaching'} title={id ? 'Edit tutor listing' : 'Create a tutor listing'} description="Clear details help students find the right person to learn with." links={links}><PageState loading={state.loading} error={state.error}><form className="form-card form-stack listing-form auth-form panel" onSubmit={submit}>
      <div className="form-two-col form-row"><Field label="Listing title"><input name="title" required minLength="3" maxLength="160" value={form.title} onChange={(e) => change('title', e.target.value)} placeholder="e.g. Mathematics made approachable" /></Field><Field label="Subject"><select name="subject_id" required value={form.subject_id} onChange={(e) => change('subject_id', e.target.value)}><option value="">Choose a subject</option>{subjects.map((subject) => <option value={subject.subject_id} key={subject.subject_id}>{subject.subject_name}</option>)}</select></Field></div>
      {admin && <Field label="Tutor account"><select value={form.tutor_id} onChange={(e) => change('tutor_id', e.target.value)} required><option value="">Choose an approved tutor</option>{tutors.map((tutor) => <option key={tutor.user_id} value={tutor.user_id}>{tutor.name} · {tutor.email}</option>)}</select></Field>}
      <Field label="Description"><textarea name="description" required minLength="10" maxLength="5000" rows="5" value={form.description} onChange={(e) => change('description', e.target.value)} placeholder="Describe your teaching style and the support you offer." /></Field>
      <div className="form-two-col form-row"><Field label="Qualifications"><input name="qualification" maxLength="255" value={form.qualification} onChange={(e) => change('qualification', e.target.value)} /></Field><Field label="Teaching experience (years)"><input name="experience" type="number" min="0" max="70" step="1" value={form.experience} onChange={(e) => change('experience', e.target.value)} /></Field></div>
      <div className="form-two-col form-row"><Field label="Location"><input name="location" maxLength="160" value={form.location} onChange={(e) => change('location', e.target.value)} placeholder="City or Online" /></Field><Field label="Teaching fee (USD / hour)"><input name="teaching_fee" type="number" min="0" max="999999.99" step="0.01" required value={form.teaching_fee} onChange={(e) => change('teaching_fee', e.target.value)} /></Field></div>
      <div className="form-two-col form-row"><Field label="Availability"><select name="status" value={form.status} onChange={(e) => change('status', e.target.value)}><option value="available">Available</option><option value="unavailable">Unavailable</option></select></Field><Field label="Listing image (optional)"><input name="image" type="file" accept="image/jpeg,image/png" />{currentImage && <small>Current image is kept when no replacement is selected.</small>}<small>JPEG or PNG, up to 2 MB.</small></Field></div>
      {currentImage && <img className="form-image-preview" src={currentImage} alt="Current listing" />}
      {state.error && <Notice tone="error">{state.error}</Notice>}<div className="form-actions"><Link className="button button-quiet ghost" to={back}>Cancel</Link><button className="button button-primary primary" disabled={state.busy}>{state.busy ? 'Saving…' : id ? 'Save changes' : 'Publish listing'} <ArrowRight size={15} /></button></div>
    </form></PageState></DashboardShell>
}

function AdminDashboard() {
  const { data, loading, error } = useData('/admin/stats')
  const stats = data?.data || {}
  return <DashboardShell kicker="Platform management" title="Administrator workspace" description="An overview of FindMyTutor activity and management tools." links={adminLinks}><PageState loading={loading} error={error}><div className="metric-grid admin-metrics stat-grid"><Metric label="Total users" value={stats.total_users ?? 0} icon={<Users />} /><Metric label="Students" value={stats.total_students ?? 0} icon={<BookOpen />} /><Metric label="Tutors" value={stats.total_tutors ?? 0} icon={<GraduationCap />} /><Metric label="Tutor listings" value={stats.total_listings ?? 0} icon={<Search />} /><Metric label="Bookings" value={stats.total_bookings ?? 0} icon={<CalendarDays />} /><Metric label="Pending requests" value={stats.pending_bookings ?? 0} icon={<Clock3 />} /></div><div className="admin-quick-links"><Link to="/admin/users"><Users />Manage accounts<ArrowRight /></Link><Link to="/admin/subjects"><BookOpen />Manage subjects<ArrowRight /></Link><Link to="/admin/listings"><GraduationCap />Review tutor listings<ArrowRight /></Link><Link to="/admin/bookings"><CalendarDays />Review bookings<ArrowRight /></Link></div></PageState></DashboardShell>
}

function AdminUsers() {
  const [filter, setFilter] = useState({ q: '', role: '', status: '' })
  const [query, setQuery] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const params = new URLSearchParams(query)
  if (!params.has('limit')) params.set('limit', '100')
  const path = `/admin/users?${params.toString()}`
  const { data, loading, error, reload } = useData(path, refresh)
  const users = data?.data || []
  function applyFilters(event) { event.preventDefault(); const values = Object.entries(filter).filter(([, value]) => value); setQuery(new URLSearchParams(values).toString()) }
  async function update(user, changes) {
    try { await api(`/admin/users/${user.user_id}`, { method: 'PATCH', body: { name: user.name, email: user.email, role: user.role, account_status: user.account_status, ...changes } }); setFeedback('Account updated.'); setEditing(null); reload() }
    catch (error) { setFeedback(errorText(error)) }
  }
  async function remove(user) {
    if (!window.confirm(`Delete ${user.name}? Accounts with listings or bookings cannot be removed.`)) return
    try { await api(`/admin/users/${user.user_id}`, { method: 'DELETE' }); setFeedback('Account deleted.'); reload() }
    catch (error) { setFeedback(errorText(error)) }
  }
  return <DashboardShell kicker="Platform management" title="User management" description="Review accounts, approve tutors, and keep the community in good standing." links={adminLinks}><div className="workspace-section-head dashboard-section"><div><span className="kicker">Accounts</span><h2>People on the platform</h2></div><button className="button button-primary primary" onClick={() => setFormOpen(!formOpen)}>{formOpen ? 'Close form' : 'Create account'} <ArrowRight size={15} /></button></div>{formOpen && <AdminCreateUser onCreated={() => { setFormOpen(false); setRefresh((n) => n + 1); setFeedback('Account created.') }} />}{editing && <AdminEditUser user={editing} onCancel={() => setEditing(null)} onSave={(values) => update(editing, values)} />}<form className="admin-filter-row" onSubmit={applyFilters}><input placeholder="Search name or email" aria-label="Search users" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} /><select aria-label="Filter by role" value={filter.role} onChange={(e) => setFilter({ ...filter, role: e.target.value })}><option value="">All roles</option>{['student', 'tutor', 'admin'].map((role) => <option key={role} value={role}>{capitalize(role)}</option>)}</select><select aria-label="Filter by status" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}><option value="">All statuses</option>{['pending', 'active', 'deactivated'].map((status) => <option key={status} value={status}>{capitalize(status)}</option>)}</select><button className="button button-primary primary">Filter</button><button className="button button-quiet ghost" type="button" onClick={() => { setFilter({ q: '', role: '', status: '' }); setQuery('') }}>Clear</button></form>{feedback && <Notice tone={feedback.includes('cannot') || feedback.includes('Cannot') ? 'error' : 'info'}>{feedback}</Notice>}<PageState loading={loading} error={error}><div className="table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user.user_id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td>{capitalize(user.role)}</td><td><StatusBadge status={user.account_status} /></td><td>{formatDate(user.created_at)}</td><td><div className="table-actions"><button className="button-link" onClick={() => setEditing(user)}>Edit</button>{user.role === 'tutor' && user.account_status !== 'active' && <button className="button-link success-link" onClick={() => update(user, { account_status: 'active' })}>Approve</button>}{user.account_status === 'active' && user.role !== 'admin' && <button className="button-link danger-link" onClick={() => update(user, { account_status: 'deactivated' })}>Deactivate</button>}{user.account_status === 'deactivated' && user.role !== 'admin' && <button className="button-link success-link" onClick={() => update(user, { account_status: 'active' })}>Reactivate</button>}{user.role !== 'admin' && <button className="button-link danger-link" onClick={() => remove(user)}>Delete</button>}</div></td></tr>)}</tbody></table></div>{!users.length && <EmptyState title="No accounts match" body="Try another search or clear your filters." />}</PageState></DashboardShell>
}

function AdminEditUser({ user, onCancel, onSave }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role, account_status: user.account_status })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) { event.preventDefault(); setBusy(true); setError(''); try { await onSave(form) } catch (error) { setError(errorText(error)) } finally { setBusy(false) } }
  return <form className="form-card form-stack admin-create-form auth-form panel" onSubmit={submit}><h3>Edit {user.name}</h3><div className="form-two-col form-row"><Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Email"><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field></div><div className="form-two-col form-row"><Field label="Role"><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{(user.role === 'admin' ? ['admin'] : ['student', 'tutor']).map((role) => <option key={role} value={role}>{capitalize(role)}</option>)}</select></Field><Field label="Account status"><select value={form.account_status} onChange={(e) => setForm({ ...form, account_status: e.target.value })}>{(user.role === 'admin' ? ['active'] : ['pending', 'active', 'deactivated']).map((status) => <option key={status} value={status}>{capitalize(status)}</option>)}</select></Field></div>{error && <Notice tone="error">{error}</Notice>}<div className="form-actions"><button type="button" className="button button-quiet ghost" onClick={onCancel}>Cancel</button><button className="button button-primary primary" disabled={busy}>{busy ? 'Saving…' : 'Save account'}</button></div></form>
}

function AdminCreateUser({ onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tutor' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) { event.preventDefault(); setBusy(true); setError(''); try { await api('/admin/users', { method: 'POST', body: form }); onCreated() } catch (error) { setError(errorText(error)) } finally { setBusy(false) } }
  return <form className="form-card form-stack admin-create-form auth-form panel" onSubmit={submit}><h3>Create an account</h3><div className="form-two-col form-row"><Field label="Name"><input required minLength="2" maxLength="120" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Email"><input required type="email" maxLength="254" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field></div><div className="form-two-col form-row"><Field label="Temporary password"><input required type="password" minLength="8" pattern="(?=.*[A-Z])(?=.*[0-9]).{8,}" title="Use at least 8 characters, including an uppercase letter and a number." value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><small>At least 8 characters, with an uppercase letter and a number.</small></Field><Field label="Role"><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="tutor">Tutor</option><option value="student">Student</option></select></Field></div>{error && <Notice tone="error">{error}</Notice>}<button className="button button-primary primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button></form>
}

function AdminSubjects() {
  const { data, loading, error, reload } = useData('/admin/subjects')
  const subjects = data?.data || []
  const [form, setForm] = useState({ subject_name: '', description: '' })
  const [editing, setEditing] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  function beginEdit(subject) { setEditing(subject.subject_id); setForm({ subject_name: subject.subject_name, description: subject.description || '' }) }
  function reset() { setEditing(null); setForm({ subject_name: '', description: '' }) }
  async function submit(event) { event.preventDefault(); setBusy(true); setFeedback(''); try { const result = await api(editing ? `/subjects/${editing}` : '/subjects', { method: editing ? 'PATCH' : 'POST', body: form }); setFeedback(result.message); reset(); reload() } catch (error) { setFeedback(errorText(error)) } finally { setBusy(false) } }
  async function remove(subject) { if (!window.confirm(`Delete ${subject.subject_name}? Subjects used by tutor listings cannot be deleted.`)) return; try { const result = await api(`/subjects/${subject.subject_id}`, { method: 'DELETE' }); setFeedback(result.message); reload() } catch (error) { setFeedback(errorText(error)) } }
  return <DashboardShell kicker="Platform management" title="Subject management" description="Keep the subject directory useful and easy to explore." links={adminLinks}><div className="admin-split"><form className="form-card form-stack subject-form auth-form panel" onSubmit={submit}><span className="kicker">{editing ? 'Edit subject' : 'New subject'}</span><h2>{editing ? 'Update this subject.' : 'Add a learning area.'}</h2><Field label="Subject name"><input required minLength="2" maxLength="100" value={form.subject_name} onChange={(e) => setForm({ ...form, subject_name: e.target.value })} /></Field><Field label="Description"><textarea rows="4" maxLength="2000" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>{feedback && <Notice tone={feedback.includes('cannot') || feedback.includes('in use') ? 'error' : 'info'}>{feedback}</Notice>}<div className="form-actions">{editing && <button className="button button-quiet ghost" type="button" onClick={reset}>Cancel</button>}<button className="button button-primary primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save subject' : 'Add subject'}</button></div></form><div className="subject-admin-list"><div className="workspace-section-head dashboard-section"><div><span className="kicker">{subjects.length} subjects</span><h2>Current subjects</h2></div></div><PageState loading={loading} error={error}>{subjects.length ? subjects.map((subject) => <article className="subject-admin-row" key={subject.subject_id}><div className="subject-row-icon"><BookOpen size={18} /></div><div><h3>{subject.subject_name}</h3><p>{subject.description || 'No description yet.'}</p></div><div className="table-actions"><button className="button-link" onClick={() => beginEdit(subject)}>Edit</button><button className="button-link danger-link" onClick={() => remove(subject)}>Delete</button></div></article>) : <EmptyState title="No subjects yet" body="Add your first subject to the directory." />}</PageState></div></div></DashboardShell>
}

function AdminListings() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const path = `/admin/listings${query ? `?q=${encodeURIComponent(query)}` : ''}`
  const { data, loading, error, reload } = useData(path)
  const listings = data?.data || []
  const [feedback, setFeedback] = useState('')
  function submit(event) { event.preventDefault(); setQuery(search) }
  async function remove(listing) { if (!window.confirm(`Delete “${listing.title}”? Existing bookings keep this listing protected.`)) return; try { const result = await api(`/listings/${listing.tutor_listing_id}`, { method: 'DELETE' }); setFeedback(result.message); reload() } catch (error) { setFeedback(errorText(error)) } }
  return <DashboardShell kicker="Platform management" title="Tutor listings" description="Review public profiles and help keep listing information current." links={adminLinks}><form className="admin-filter-row" onSubmit={submit}><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tutor, title, location, or subject" aria-label="Search tutor listings" /><button className="button button-primary primary"><Search size={15} /> Search</button><button className="button button-quiet ghost" type="button" onClick={() => { setSearch(''); setQuery('') }}>Clear</button></form>{feedback && <Notice>{feedback}</Notice>}<PageState loading={loading} error={error}>{listings.length ? <div className="manage-listings">{listings.map((listing) => <TutorListingTile key={listing.tutor_listing_id} listing={listing} onDelete={remove} editBase="/admin/listings" />)}</div> : <EmptyState title="No tutor listings found" body="Tutor listings will appear here as tutors publish them." />}</PageState></DashboardShell>
}

function NotFound() { return <main className="not-found content-width container"><span className="kicker">404 · Page not found</span><h1>We couldn’t find that page.</h1><p>It may have moved, or the address may be incomplete.</p><Link className="button button-primary primary" to="/">Return home <ArrowRight size={15} /></Link></main> }

export default App