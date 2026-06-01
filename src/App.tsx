import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';

import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Map, Activity, UserCircle, LogOut, BookOpen, Menu, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import Login from './features/auth/Login';
import UpdatePassword from './features/auth/UpdatePassword';
import Dashboard from './features/dashboard/Dashboard';
import Logistics from './features/logistics/Logistics';
import Assessments from './features/assessments/Assessments';
import AdminDashboard from './features/admin/AdminDashboard';
import CommanderProfile from './features/profile/CommanderProfile';
import CampaignBattles from './features/battles/CampaignBattles';
import Briefing from './features/briefing/Briefing';
import TranslatedHeader from './components/TranslatedHeader';
import './App.css';

const FACTIONS = [
  { id: 'imperium', label: 'Imperium' },
  { id: 'chaos', label: 'Chaos' },
  { id: 'orks', label: 'Orks' },
  { id: 'necrons', label: 'Necrons' },
  { id: 'aeldari', label: 'Aeldari' },
  { id: 'drukhari', label: 'Drukhari' },
  { id: 'tau', label: "T'au Empire" },
  { id: 'tyranids', label: 'Tyranids' },
  { id: 'genestealer_cults', label: 'Genestealer Cults' },
  { id: 'leagues_of_votann', label: 'Leagues of Votann' },
  { id: 'space_marines', label: 'Space Marines' },
  { id: 'astra_militarum', label: 'Astra Militarum' },
  { id: 'adeptus_mechanicus', label: 'Adeptus Mechanicus' },
  { id: 'adepta_sororitas', label: 'Adepta Sororitas' },
  { id: 'adeptus_custodes', label: 'Adeptus Custodes' },
  { id: 'imperial_knights', label: 'Imperial Knights' },
  { id: 'chaos_space_marines', label: 'Chaos Space Marines' },
  { id: 'death_guard', label: 'Death Guard' },
  { id: 'thousand_sons', label: 'Thousand Sons' },
  { id: 'world_eaters', label: 'World Eaters' },
  { id: 'chaos_daemons', label: 'Chaos Daemons' },
  { id: 'chaos_knights', label: 'Chaos Knights' },
];

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTheme, setActiveTheme] = useState('imperium');
  const [isRecovering, setIsRecovering] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname.substring(1) || 'dashboard';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile to automatically set theme
  useEffect(() => {
    async function loadTheme() {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('army_faction')
          .eq('id', session.user.id)
          .single();
        
        if (data?.army_faction) {
          const matchedFaction = FACTIONS.find(f => f.label === data.army_faction);
          if (matchedFaction) {
            setActiveTheme(matchedFaction.id);
          }
        }
      }
    }
    loadTheme();
  }, [session]);

  useEffect(() => {
    document.body.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  // Alien font translation: set data-text on ALL leaf text elements so CSS ::after can show English
  useEffect(() => {
    const isAlienTheme = activeTheme === 'necrons' || activeTheme === 'tau';
    const SKIP_TAGS = new Set(['INPUT','SELECT','TEXTAREA','OPTION','SCRIPT','STYLE','NOSCRIPT','IFRAME','CANVAS','VIDEO','AUDIO','IMG','BR','HR','SVG','PATH','CIRCLE','LINE','RECT','POLYGON','POLYLINE','ELLIPSE','G','DEFS','USE','SYMBOL','CLIPPATH']);

    const clearDataText = () => {
      document.querySelectorAll('[data-text]').forEach(el => {
        el.removeAttribute('data-text');
      });
    };

    if (!isAlienTheme) {
      clearDataText();
      return;
    }

    const updateTextElements = () => {
      // Query all common text-bearing elements
      document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th, button, label, a, span, div, dt, dd, caption, summary, figcaption, blockquote').forEach(el => {
        if (SKIP_TAGS.has(el.tagName)) return;

        // Check if it is a leaf element: all of its children are in SKIP_TAGS
        const isLeaf = Array.from(el.children).every(child => SKIP_TAGS.has(child.tagName));
        if (!isLeaf) {
          el.removeAttribute('data-text');
          return;
        }

        const text = (el.textContent || '').trim();
        if (!text) {
          el.removeAttribute('data-text');
          return;
        }

        if (el.getAttribute('data-text') !== text) {
          el.setAttribute('data-text', text);
        }
      });
    };

    updateTextElements();

    let rafId: number;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateTextElements);
    });
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      characterData: true
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      clearDataText();
    };
  }, [activeTheme]);

  if (isRecovering) {
    return <UpdatePassword setIsRecovering={setIsRecovering} />;
  }

  const isPublicRoute = location.pathname.startsWith('/briefing');

  if (!session && !isPublicRoute) {
    return <Login />;
  }

  const navigateTo = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Mobile hamburger button */}
      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

      {/* Sidebar Navigation */}
      <nav className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <h2 style={{ fontSize: '1.25rem', letterSpacing: '2px', marginBottom: '1rem', color: 'var(--theme-accent)' }}>
          Simulation Protocol
        </h2>
        <div style={{ color: 'var(--theme-fg-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
          Terminus Est / LA Sector
        </div>

        <div className="nav-menu">
          <div 
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigateTo('/dashboard')}
          >
            <Map size={20} />
            War Effort Map
          </div>
          <div 
            className={`nav-item ${activeView === 'briefing' ? 'active' : ''}`}
            onClick={() => navigateTo('/briefing')}
          >
            <BookOpen size={20} />
            Field Manual
          </div>
          <div 
            className={`nav-item ${activeView === 'logistics' ? 'active' : ''}`}
            onClick={() => navigateTo('/logistics')}
          >
            <Shield size={20} />
            Logistics & Clearance
          </div>
          <div 
            className={`nav-item ${activeView === 'assessments' ? 'active' : ''}`}
            onClick={() => navigateTo('/assessments')}
          >
            <Activity size={20} />
            Officer Assessment
          </div>
          <div 
            className={`nav-item ${activeView === 'battles' ? 'active' : ''}`}
            onClick={() => navigateTo('/battles')}
          >
            <Shield size={20} />
            Matchups & Lore
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          {session ? (
            <>
              <div 
                className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
                onClick={() => navigateTo('/profile')}
              >
                <UserCircle size={20} />
                Commander Profile
              </div>
              <div className="nav-item" onClick={() => supabase.auth.signOut()}>
                <LogOut size={20} />
                Disengage
              </div>
            </>
          ) : (
            <div className="nav-item" onClick={() => navigateTo('/')}>
              <UserCircle size={20} />
              Login / Enlist
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="faction-header">
          <div>
            <TranslatedHeader 
              text={`${FACTIONS.find(f => f.id === activeTheme)?.label} Network`} 
              theme={activeTheme}
            />
            <p style={{ color: 'var(--theme-fg-muted)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.9rem' }}>
              Connection secure. Welcome Commander.
            </p>
          </div>
          
          <div className="theme-selector">
            <label htmlFor="theme-select" style={{ margin: 0 }}>Theme Override:</label>
            <select 
              id="theme-select" 
              value={activeTheme} 
              onChange={(e) => setActiveTheme(e.target.value)}
            >
              {FACTIONS.map(f => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Dashboard Router */}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/briefing" element={<Briefing />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/battles" element={<CampaignBattles />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<CommanderProfile />} />
          <Route path="/profile/:profileId" element={<CommanderProfile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
