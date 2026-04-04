import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import AdminPanel from "./AdminPanel";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Play, Info, ChevronRight, ChevronLeft, Calendar, Users, 
  Camera, Palette, Film, Star, MapPin, Clock, Mail, 
  Instagram, Facebook, Twitter, Menu, X, ArrowRight,
  Award, Heart, Zap, Music, Mic2, Layout, Eye, History,
  Quote, Share2, Maximize, Minimize, Download, BookOpen,
  Trophy, Users2, FileText, Plus, CheckCircle2, Globe, Loader2
} from "lucide-react";
import { useParams } from "react-router-dom";

// --- Fallback static data (used if DB is empty or unavailable) ---

const FALLBACK_PRODUCTIONS = [
  { 
    id: "t2026", slug: "tertulia-2026",
    title: "Tertulia 2026", subtitle: "Don't Tell Daddy What Happened in Lagos", 
    year: 2026, author: "Yemi Odunfa",
    img: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800",
    image_url: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800",
    category: "Theatre", performances: 12, attendees: 1200,
    cast: [
      { character: "Chief Ade", actor: "Yemi Odunfa" },
      { character: "Mama Lagos", actor: "Sarah Owusu" },
      { character: "The Stranger", actor: "David Tetteh" },
    ]
  },
  { 
    id: "t2025", slug: "tertulia-2025",
    title: "Tertulia 2025", subtitle: "The Lion and the Jewel", 
    year: 2025, author: "Wole Soyinka",
    img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800",
    image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800",
    category: "Theatre", performances: 10, attendees: 900,
    cast: [{ character: "Baroka", actor: "Kwame Nkrumah" }, { character: "Sidi", actor: "Efua Sutherland" }]
  },
  { 
    id: "t2024", slug: "tertulia-2024",
    title: "Tertulia 2024", subtitle: "The Beautiful Ones Are Not Yet Born", 
    year: 2024, author: "Ayi Kwei Armah",
    img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
    image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
    category: "Theatre", performances: 8, attendees: 750,
    cast: [{ character: "The Man", actor: "Ayi Kwei Armah" }, { character: "Oyo", actor: "Tsitsi Dangarembga" }]
  },
  { id: "p1", slug: "echoes", title: "Echoes of Silence", subtitle: "A Short Film", year: 2025, author: "Remix Media", img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800", image_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800", category: "Film", cast: [] },
  { id: "p2", slug: "urban", title: "Urban Rhythms", subtitle: "Dance Showcase", year: 2025, author: "Remix Arts", img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800", image_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800", category: "Performance", cast: [] },
];

const FALLBACK_BTS = [
  { title: "Rehearsals", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800" },
  { title: "Stage Design", img: "https://images.unsplash.com/photo-1514525253344-f81f3f77412b?auto=format&fit=crop&q=80&w=800" },
  { title: "Cast Interviews", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" },
  { title: "Media Coverage", img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=800" },
];

const FALLBACK_ART = [
  { title: "Painting", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800" },
  { title: "Photography", img: "https://images.unsplash.com/photo-1452784444945-3f422708fe5e?auto=format&fit=crop&q=80&w=800" },
  { title: "Digital Art", img: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800" },
  { title: "Installations", img: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&q=80&w=800" },
];

const FALLBACK_COMMUNITY = [
  { title: "Actors", img: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800" },
  { title: "Media Team", img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=800" },
  { title: "Artists", img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800" },
  { title: "Production Crew", img: "https://images.unsplash.com/photo-1514525253344-f81f3f77412b?auto=format&fit=crop&q=80&w=800" },
];

// --- Site Content Context ---

interface SiteImage { id: number; section: string; label: string; url: string; sort_order: number; }
interface SiteContent {
  productions: any[];
  events: any[];
  siteImages: SiteImage[];
  testimonials: any[];
  sponsors: any[];
  loading: boolean;
  getImage: (section: string, index?: number) => string;
  getImages: (section: string) => SiteImage[];
  refresh: () => void;
}

const ContentContext = createContext<SiteContent>({
  productions: FALLBACK_PRODUCTIONS, events: [], siteImages: [], testimonials: [], sponsors: [],
  loading: false,
  getImage: () => "",
  getImages: () => [],
  refresh: () => {},
});

const useContent = () => useContext(ContentContext);

const ContentProvider = ({ children }: { children: React.ReactNode }) => {
  const [productions, setProductions] = useState<any[]>(FALLBACK_PRODUCTIONS);
  const [events, setEvents] = useState<any[]>([]);
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        // Normalize DB productions to match expected shape
        if (data.productions?.length > 0) {
          setProductions(data.productions.map((p: any) => ({
            ...p,
            id: p.slug,
            img: p.image_url,
            cast: typeof p.cast_list === "string" ? JSON.parse(p.cast_list) : (p.cast_list || []),
          })));
        }
        if (data.events?.length > 0) setEvents(data.events);
        if (data.siteImages?.length > 0) setSiteImages(data.siteImages);
        if (data.testimonials?.length > 0) setTestimonials(data.testimonials);
        if (data.sponsors?.length > 0) setSponsors(data.sponsors);
      }
    } catch (e) {
      // silently fall back to static data
    }
    setLoading(false);
  };

  useEffect(() => { fetchContent(); }, []);

  const getImage = (section: string, index = 0): string => {
    const imgs = siteImages.filter(i => i.section === section).sort((a, b) => a.sort_order - b.sort_order);
    return imgs[index]?.url || "";
  };

  const getImages = (section: string): SiteImage[] =>
    siteImages.filter(i => i.section === section).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <ContentContext.Provider value={{ productions, events, siteImages, testimonials, sponsors, loading, getImage, getImages, refresh: fetchContent }}>
      {children}
    </ContentContext.Provider>
  );
};

// --- Components ---

const ScrollToHash = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [hash]);

  return null;
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { 
      name: "About", 
      path: "/about",
      sub: [
        { name: "Our Story", path: "/about#story" },
        { name: "Leadership", path: "/about#team" },
        { name: "Impact", path: "/about#impact" }
      ]
    },
    { 
      name: "Tertulia", 
      path: "/tertulia",
      sub: [
        { name: "What is Tertulia", path: "/tertulia#what" },
        { name: "Tertulia 2026", path: "/tertulia/2026" },
        { name: "Past Editions", path: "/tertulia#editions" },
        { name: "Gallery", path: "/tertulia#gallery" }
      ]
    },
    { 
      name: "Work", 
      path: "/work",
      sub: [
        { name: "Productions", path: "/work#productions" },
        { name: "Art Exhibitions", path: "/work#art" },
        { name: "Media Projects", path: "/work#media" },
        { name: "Behind the Scenes", path: "/work#bts" }
      ]
    },
    { 
      name: "Upcoming", 
      path: "/upcoming",
      sub: [
        { name: "Coming Soon", path: "/upcoming#soon" },
        { name: "Auditions", path: "/upcoming#auditions" },
        { name: "Exhibit With Us", path: "/upcoming#exhibit" }
      ]
    },
    { 
      name: "Join", 
      path: "/join",
      sub: [
        { name: "Join the Club", path: "/join#club" },
        { name: "Volunteer", path: "/join#volunteer" },
        { name: "Opportunities", path: "/join#opps" }
      ]
    },
    { name: "Partner", path: "/partner", highlight: true }
  ];

  return (
    <nav className={`glass-nav transition-all duration-500 ${scrolled ? 'py-3 bg-brand-bg/95' : 'py-6 bg-transparent'}`}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex flex-col">
          <span className="text-2xl font-theatre tracking-[0.2em] text-brand-text leading-none">REMIX</span>
          <span className="text-[8px] uppercase tracking-[0.4em] text-brand-gold mt-1">Arts, Media & Drama Club</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <div key={item.name} className="relative group">
              <Link 
                to={item.path}
                className={`text-xs uppercase tracking-widest font-bold transition-colors hover:text-brand-accent flex items-center gap-1 ${item.highlight ? 'px-6 py-2 bg-brand-gold text-brand-bg rounded-sm hover:bg-brand-accent hover:text-white' : ''}`}
              >
                {item.name}
                {item.sub && <ChevronRight className="w-3 h-3 rotate-90" />}
              </Link>
              
              {item.sub && (
                <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <div className="bg-brand-surface border border-white/10 p-4 min-w-[200px] shadow-2xl">
                    {item.sub.map((sub) => (
                      <Link 
                        key={sub.name} 
                        to={sub.path}
                        className="block py-2 text-[10px] uppercase tracking-widest text-brand-muted hover:text-brand-accent transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 top-[70px] bg-brand-bg z-40 p-8 overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
              {navItems.map((item) => (
                <div key={item.name} className="space-y-4">
                  <Link 
                    to={item.path} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-display text-white block"
                  >
                    {item.name}
                  </Link>
                  {item.sub && (
                    <div className="pl-4 flex flex-col gap-3 border-l border-brand-accent/30">
                      {item.sub.map((sub) => (
                        <Link 
                          key={sub.name} 
                          to={sub.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-sm text-brand-muted"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NetflixRow = ({ title, items, type = "production" }: { title: string, items: any[], type?: "production" | "bts" | "art" | "community" }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="py-8 group/row">
      <div className="px-6 md:px-12 flex items-center justify-between mb-4">
        <h3 className="text-xl md:text-2xl font-display font-bold text-white">{title}</h3>
        <div className="flex gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <button onClick={() => scroll("left")} className="p-2 bg-white/10 hover:bg-white/20 rounded-full"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => scroll("right")} className="p-2 bg-white/10 hover:bg-white/20 rounded-full"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      
      <div ref={rowRef} className="netflix-row">
        {items.map((item, i) => (
          <motion.div 
            key={i} 
            className="netflix-card"
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src={item.img} 
              alt={item.title} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="cinematic-overlay" />
            <div className="absolute bottom-4 left-4 right-4">
              <h4 className="text-lg font-bold text-white leading-tight">{item.title}</h4>
              {item.subtitle && <p className="text-xs text-brand-muted mt-1">{item.subtitle}</p>}
              {item.author && <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest mt-1">By {item.author}</p>}
              {item.category && <span className="text-[8px] uppercase tracking-widest text-brand-muted mt-2 block">{item.category}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-brand-surface py-20 px-6 md:px-12 border-t border-white/5">
    <div className="max-w-[1400px] mx-auto grid md:grid-cols-4 gap-12">
      <div className="col-span-2">
        <Link to="/" className="flex flex-col mb-6">
          <span className="text-3xl font-theatre tracking-[0.2em] text-brand-text leading-none">REMIX</span>
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mt-1">Arts, Media & Drama Club</span>
        </Link>
        <p className="text-brand-muted max-w-sm mb-8">
          Creating stories. Building experiences. Inspiring creativity. 
          The flagship creative community for our school.
        </p>
        <div className="flex gap-4">
          <a href="#" className="p-3 bg-white/5 hover:bg-brand-accent transition-colors rounded-full"><Instagram className="w-5 h-5" /></a>
          <a href="#" className="p-3 bg-white/5 hover:bg-brand-accent transition-colors rounded-full"><Facebook className="w-5 h-5" /></a>
          <a href="#" className="p-3 bg-white/5 hover:bg-brand-accent transition-colors rounded-full"><Twitter className="w-5 h-5" /></a>
          <a href="#" className="p-3 bg-white/5 hover:bg-brand-accent transition-colors rounded-full"><Mail className="w-5 h-5" /></a>
        </div>
      </div>
      
      <div>
        <h5 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Explore</h5>
        <ul className="space-y-4 text-brand-muted text-sm">
          <li><Link to="/about" className="hover:text-brand-accent">About Us</Link></li>
          <li><Link to="/tertulia" className="hover:text-brand-accent">Tertulia Festival</Link></li>
          <li><Link to="/work" className="hover:text-brand-accent">Our Work</Link></li>
          <li><Link to="/upcoming" className="hover:text-brand-accent">Upcoming</Link></li>
        </ul>
      </div>

      <div>
        <h5 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Get Involved</h5>
        <ul className="space-y-4 text-brand-muted text-sm">
          <li><Link to="/join" className="hover:text-brand-accent">Join the Club</Link></li>
          <li><Link to="/partner" className="hover:text-brand-accent">Partner With Us</Link></li>
          <li><Link to="/join#volunteer" className="hover:text-brand-accent">Volunteer</Link></li>
          <li><Link to="/upcoming#auditions" className="hover:text-brand-accent">Auditions</Link></li>
        </ul>
      </div>
    </div>
    <div className="max-w-[1400px] mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-brand-muted">
      <p>© 2026 Remix Arts, Media & Drama Club. All Rights Reserved.</p>
      <div className="flex gap-8">
        <a href="#" className="hover:text-white">Privacy Policy</a>
        <a href="#" className="hover:text-white">Terms of Service</a>
      </div>
    </div>
  </footer>
);

// --- Pages ---

const HomePage = () => {
  const navigate = useNavigate();
  const { productions, getImage, getImages } = useContent();

  const featured = productions[0];
  const heroImg = getImage("hero") || featured?.img || "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=1920";
  const upcomingImg = getImage("hero", 1) || "https://images.unsplash.com/photo-1514525253344-f81f3f77412b?auto=format&fit=crop&q=80&w=1920";
  const btsItems = getImages("bts").map(i => ({ title: i.label, img: i.url }));
  const artItems = getImages("art").map(i => ({ title: i.label, img: i.url }));
  const communityItems = getImages("community").map(i => ({ title: i.label, img: i.url }));

  return (
    <div className="bg-brand-bg">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-start px-6 md:px-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-brand-gold font-bold uppercase tracking-[0.4em] text-xs mb-4 block">Featured Production</span>
            <h1 className="text-6xl md:text-9xl font-theatre text-white leading-none mb-4">{featured?.title || "TERTULIA 2026"}</h1>
            <div className="mb-8">
              <p className="text-2xl md:text-4xl font-display italic text-brand-muted">{featured?.subtitle || "Don't Tell Daddy What Happened in Lagos"}</p>
              {featured?.author && <p className="text-brand-gold font-bold uppercase tracking-widest text-xs mt-2">By {featured.author}</p>}
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary flex items-center gap-2">
                <Play className="w-5 h-5 fill-current" /> Watch Highlights
              </button>
              <button onClick={() => navigate('/tertulia')} className="btn-outline flex items-center gap-2">
                <Info className="w-5 h-5" /> Explore Tertulia
              </button>
            </div>
            <div className="mt-12 flex items-center gap-4 text-brand-muted">
              <div className="w-12 h-px bg-brand-accent" />
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold">The Arts, Media & Drama Club</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Netflix Rows */}
      <div className="relative z-10 -mt-32 pb-32 space-y-12">
        <NetflixRow title="Featured Productions" items={productions} />
        <NetflixRow title="Inside the Production" items={btsItems.length > 0 ? btsItems : FALLBACK_BTS} type="bts" />
        <NetflixRow title="Visual Arts Showcase" items={artItems.length > 0 ? artItems : FALLBACK_ART} type="art" />
        <NetflixRow title="Club Community" items={communityItems.length > 0 ? communityItems : FALLBACK_COMMUNITY} type="community" />
      </div>

      {/* Upcoming Banner */}
      <section className="px-6 md:px-12 pb-32">
        <div className="relative h-[500px] rounded-3xl overflow-hidden group">
          <img
            src={upcomingImg}
            alt="Upcoming"
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-brand-accent/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <span className="text-brand-gold font-bold uppercase tracking-[0.4em] text-xs mb-4">Next Major Event</span>
            <h2 className="text-6xl md:text-8xl font-theatre text-white mb-6">TERTULIA 2027</h2>
            <p className="text-xl text-white/80 font-display italic mb-8 max-w-2xl">
              Featuring: Stage Production • Art Exhibition • Choir Performance
            </p>
            <button onClick={() => navigate('/join')} className="btn-gold">Join the Production</button>
          </div>
        </div>
      </section>
    </div>
  );
};

const UpcomingPage = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 84, hours: 12, minutes: 20 });

  return (
    <div className="bg-brand-bg pt-20">
      {/* Hero */}
      <section id="soon" className="relative h-[70vh] flex items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1514525253344-f81f3f77412b?auto=format&fit=crop&q=80&w=1920" 
            alt="Rehearsal" 
            className="w-full h-full object-cover opacity-30 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-bg/50 to-brand-bg" />
        </div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-6xl md:text-9xl font-theatre text-white mb-6">Something Is Coming</h1>
            <p className="text-xl md:text-2xl text-brand-muted font-display italic mb-8">The next chapter of creativity is already in motion.</p>
            <button className="btn-primary">Get Involved</button>
            <div className="mt-12 text-[10px] uppercase tracking-[0.6em] text-brand-gold font-bold">
              Arts • Theatre • Music • Media
            </div>
          </motion.div>
        </div>
      </section>

      {/* Next Production */}
      <section id="auditions" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-4 block">Major Event</span>
            <h2 className="text-5xl md:text-7xl font-theatre text-white mb-8">Tertulia 2027</h2>
            <p className="text-xl text-brand-muted leading-relaxed mb-8">
              An expanded creative showcase featuring a full stage production, a curated art exhibition, and a choir-style musical performance. More details will be revealed soon.
            </p>
            <button className="btn-outline">Follow the Journey</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-brand-surface rounded-2xl p-8 flex flex-col justify-center border border-white/5">
              <Mic2 className="w-10 h-10 text-brand-gold mb-4" />
              <h4 className="text-white font-bold">Choir</h4>
              <p className="text-xs text-brand-muted">New for 2027</p>
            </div>
            <div className="aspect-square bg-brand-surface rounded-2xl p-8 flex flex-col justify-center border border-white/5">
              <Palette className="w-10 h-10 text-brand-accent mb-4" />
              <h4 className="text-white font-bold">Exhibition</h4>
              <p className="text-xs text-brand-muted">Curated Art</p>
            </div>
            <div className="aspect-square bg-brand-surface rounded-2xl p-8 flex flex-col justify-center border border-white/5">
              <Film className="w-10 h-10 text-brand-gold mb-4" />
              <h4 className="text-white font-bold">Media</h4>
              <p className="text-xs text-brand-muted">Digital Storytelling</p>
            </div>
            <div className="aspect-square bg-brand-surface rounded-2xl p-8 flex flex-col justify-center border border-white/5">
              <Users className="w-10 h-10 text-brand-accent mb-4" />
              <h4 className="text-white font-bold">Cast</h4>
              <p className="text-xs text-brand-muted">Stage Production</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 bg-brand-surface">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-theatre text-white mb-16 text-center">Production Timeline</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { status: "Now", title: "Script Development", desc: "Creative planning and writing sessions." },
              { status: "Next", title: "Auditions", desc: "Casting for the production and choir." },
              { status: "Later", title: "Rehearsals", desc: "Production development and stage building." },
              { status: "Event", title: "Tertulia 2027", desc: "The grand creative showcase." }
            ].map((item, i) => (
              <div key={i} className="relative p-8 bg-brand-bg rounded-2xl border border-white/5">
                <span className={`text-[10px] font-bold uppercase tracking-widest mb-4 block ${item.status === 'Now' ? 'text-brand-accent' : 'text-brand-gold'}`}>
                  {item.status}
                </span>
                <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-brand-muted">{item.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-white/10 z-10" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Opportunities */}
      <section id="exhibit" className="py-32 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-theatre text-white mb-16">Get Involved</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: <Users />, title: "Audition for the Production", link: "/join" },
            { icon: <Palette />, title: "Exhibit Your Artwork", link: "/join" },
            { icon: <Camera />, title: "Join the Media Team", link: "/join" },
            { icon: <Music />, title: "Participate in the Choir", link: "/join" }
          ].map((opt, i) => (
            <Link key={i} to={opt.link} className="flex items-center gap-6 p-8 bg-brand-surface rounded-2xl border border-white/5 hover:border-brand-accent transition-all group">
              <div className="p-4 bg-brand-bg rounded-full text-brand-gold group-hover:text-brand-accent transition-colors">
                {opt.icon}
              </div>
              <h4 className="text-xl font-bold text-white text-left">{opt.title}</h4>
            </Link>
          ))}
        </div>
        <button className="btn-gold mt-12">Join the Club</button>
      </section>

      {/* Countdown */}
      <section className="py-32 bg-brand-accent/10 border-y border-brand-accent/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-theatre text-white mb-12">Countdown to Tertulia 2027</h2>
          <div className="flex justify-center gap-8 md:gap-16">
            {[
              { val: timeLeft.days, label: "Days" },
              { val: timeLeft.hours, label: "Hours" },
              { val: timeLeft.minutes, label: "Minutes" }
            ].map((unit, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-6xl md:text-8xl font-theatre text-brand-gold">{unit.val}</span>
                <span className="text-xs uppercase tracking-widest text-brand-muted mt-2">{unit.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center max-w-4xl mx-auto">
        <p className="text-2xl md:text-3xl font-display italic text-white mb-12">
          Creativity doesn’t wait for the spotlight. The next production is already taking shape, and there is room for new voices, new ideas, and new creators.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <button className="btn-primary">Join the Club</button>
          <button className="btn-outline">Follow Updates</button>
        </div>
      </section>
    </div>
  );
};

const PartnerPage = () => (
  <div className="bg-brand-bg pt-20">
    <section className="relative h-[60vh] flex items-center justify-center text-center px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1920" 
          alt="Partnership" 
          className="w-full h-full object-cover opacity-20 grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/20 via-brand-bg/80 to-brand-bg" />
      </div>
      <div className="relative z-10">
        <h1 className="text-6xl md:text-9xl font-theatre text-white mb-6">Partner With Us</h1>
        <p className="text-xl md:text-2xl text-brand-gold font-display italic">Creativity thrives when communities support it.</p>
      </div>
    </section>

    <section className="py-32 px-6 md:px-12 max-w-5xl mx-auto">
      <div className="prose prose-invert max-w-none">
        <p className="text-xl text-brand-muted leading-relaxed mb-12">
          The Arts, Media & Drama Club believes in the power of storytelling, performance, and visual art to inspire conversation and bring people together. Through productions like Tertulia, we provide students with a platform to explore creativity, collaborate across disciplines, and share meaningful artistic experiences with the wider community.
        </p>
        <p className="text-xl text-brand-muted leading-relaxed mb-12">
          Partnerships with organizations and individuals make these opportunities possible.
        </p>

        <h2 className="text-4xl font-theatre text-white mb-8">Why Support the Arts</h2>
        <p className="text-lg text-brand-muted mb-8">
          Supporting student arts initiatives helps create spaces where creativity, expression, and innovation can flourish. Your partnership helps us:
        </p>
        <ul className="grid md:grid-cols-2 gap-4 mb-16 list-none p-0">
          {[
            "Produce high-quality theatre performances",
            "Showcase emerging visual artists",
            "Provide creative opportunities for students",
            "Build cultural experiences for the school community"
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-brand-text">
              <CheckCircle2 className="text-brand-accent w-5 h-5 flex-none" />
              {item}
            </li>
          ))}
        </ul>

        <h2 className="text-4xl font-theatre text-white mb-8">Sponsorship Opportunities</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { title: "Event Sponsorship", desc: "Support productions like Tertulia and receive recognition during the event." },
            { title: "Creative Partnerships", desc: "Collaborate on creative projects, exhibitions, or performances." },
            { title: "Media Collaboration", desc: "Feature your brand within promotional materials and social media content." }
          ].map((opt, i) => (
            <div key={i} className="p-8 bg-brand-surface rounded-2xl border border-white/5">
              <h4 className="text-brand-gold font-bold mb-4">{opt.title}</h4>
              <p className="text-sm text-brand-muted">{opt.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-4xl font-theatre text-white mb-8">Sponsor Recognition</h2>
        <p className="text-lg text-brand-muted mb-8">Sponsors receive visibility through:</p>
        <div className="flex flex-wrap gap-4 mb-16">
          {["Logo Placement", "Event Recognition", "Social Media Acknowledgements", "Website Recognition", "Event Branding"].map((tag) => (
            <span key={tag} className="px-6 py-2 bg-brand-accent/10 border border-brand-accent/30 text-brand-accent rounded-full text-xs font-bold uppercase tracking-widest">
              {tag}
            </span>
          ))}
        </div>

        <div className="bg-brand-surface p-12 rounded-[3rem] border border-white/5 text-center">
          <h2 className="text-4xl font-theatre text-white mb-6">Become a Partner</h2>
          <p className="text-lg text-brand-muted mb-8">
            If you would like to support the Arts, Media & Drama Club or partner with us for future productions, we would love to connect.
          </p>
          <button className="btn-gold">Partner With Us</button>
        </div>
      </div>
    </section>
  </div>
);

const TertuliaPage = () => (
  <div className="bg-brand-bg pt-20">
    <section className="relative h-[80vh] flex items-center justify-center text-center px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1920" 
          alt="Tertulia" 
          className="w-full h-full object-cover opacity-40 grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/20 via-brand-bg/80 to-brand-bg" />
      </div>
      <div className="relative z-10">
        <h1 className="text-8xl md:text-[12vw] font-theatre text-white leading-none mb-4">TERTULIA</h1>
        <p className="text-xl md:text-3xl text-brand-gold font-display italic tracking-widest uppercase">An Annual Celebration of Theatre, Art & Creativity</p>
      </div>
    </section>

    <section id="what" className="py-32 px-6 md:px-12 max-w-5xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-4xl font-theatre text-white mb-8">The Festival</h2>
        <p className="text-2xl text-brand-muted font-display italic leading-relaxed">
          Tertulia is the Arts, Media & Drama Club’s annual creative showcase — an event where storytelling, performance, and visual art meet in one immersive experience.
        </p>
        <p className="text-lg text-brand-muted mt-8">
          Each edition brings together theatre productions, exhibitions, and live performances that celebrate creativity and community.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-32">
        {[
          { title: "Theatre Production", icon: <Film />, desc: "A full-scale stage play featuring our talented actors and directors." },
          { title: "Art Exhibition", icon: <Palette />, desc: "A curated showcase of visual arts, from painting to digital installations." },
          { title: "Live Performances", icon: <Music />, desc: "Musical acts, spoken word, and live creative demonstrations." }
        ].map((item, i) => (
          <div key={i} className="p-10 bg-brand-surface rounded-[2.5rem] border border-white/5 text-center">
            <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center text-brand-gold mx-auto mb-6">
              {item.icon}
            </div>
            <h4 className="text-xl font-bold text-white mb-4">{item.title}</h4>
            <p className="text-sm text-brand-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      <div id="experience" className="mb-32">
        <h2 className="text-4xl font-theatre text-white mb-16 text-center">The Experience</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800" alt="Theatre" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
            </div>
            <h3 className="text-2xl font-display text-white">Theatre Production</h3>
            <p className="text-brand-muted">Immersive stage performances that challenge perspectives and celebrate the human experience.</p>
          </div>
          <div className="space-y-6">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800" alt="Art" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
            </div>
            <h3 className="text-2xl font-display text-white">Art Exhibition</h3>
            <p className="text-brand-muted">A curated gallery of student works across painting, photography, and digital installations.</p>
          </div>
          <div className="space-y-6">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800" alt="Live" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
            </div>
            <h3 className="text-2xl font-display text-white">Live Performances</h3>
            <p className="text-brand-muted">From musical acts to spoken word, Tertulia is a stage for all forms of live creativity.</p>
          </div>
        </div>
      </div>

      <div id="editions" className="mb-32">
        <h2 className="text-4xl font-theatre text-white mb-16 text-center">Visual Timeline</h2>
        <TertuliaEditions />
      </div>

      <div id="creators" className="mb-32">
        <h2 className="text-4xl font-theatre text-white mb-16 text-center">Artists & Creators</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { role: "Actors", count: "24" },
            { role: "Directors", count: "4" },
            { role: "Artists", count: "12" },
            { role: "Media Team", count: "8" }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-brand-surface rounded-2xl border border-white/5 text-center">
              <span className="text-4xl font-theatre text-brand-gold block mb-2">{item.count}</span>
              <span className="text-xs uppercase tracking-widest text-brand-muted">{item.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div id="gallery" className="mb-32">
        <h2 className="text-4xl font-theatre text-white mb-16 text-center">Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden">
              <img src={`https://picsum.photos/seed/tertulia${i}/800/800`} alt="Gallery" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

const AboutPage = () => (
  <div className="bg-brand-bg pt-20">
    <section className="relative h-[60vh] flex items-center justify-center text-center px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1920" 
          alt="About" 
          className="w-full h-full object-cover opacity-20 grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/20 via-brand-bg/80 to-brand-bg" />
      </div>
      <div className="relative z-10">
        <h1 className="text-6xl md:text-9xl font-theatre text-white mb-6">Our Story</h1>
        <p className="text-xl md:text-2xl text-brand-gold font-display italic">Creating stories. Building experiences. Inspiring creativity.</p>
      </div>
    </section>

    <section id="story" className="py-32 px-6 md:px-12 max-w-5xl mx-auto">
      <div className="prose prose-invert max-w-none">
        <h2 className="text-4xl font-theatre text-white mb-8">Who We Are</h2>
        <p className="text-xl text-brand-muted leading-relaxed mb-12">
          The Arts, Media & Drama Club is a vibrant community of creators dedicated to exploring the intersection of performance, visual art, and digital storytelling. We believe that creativity is a universal language that can bridge gaps and inspire change.
        </p>
        <p className="text-xl text-brand-muted leading-relaxed mb-12">
          From our humble beginnings as a small group of theatre enthusiasts, we have grown into a multi-disciplinary hub that produces large-scale festivals, curated exhibitions, and impactful media projects.
        </p>

        <div id="team" className="mt-32">
          <h2 className="text-4xl font-theatre text-white mb-16 text-center">Leadership & Team</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { name: "Yemi Odunfa", role: "Creative Director", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" },
              { name: "Sarah Owusu", role: "Head of Media", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400" },
              { name: "David Tetteh", role: "Art Curator", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" }
            ].map((member, i) => (
              <div key={i} className="text-center group">
                <div className="aspect-square rounded-full overflow-hidden mb-6 border-2 border-white/5 group-hover:border-brand-accent transition-all duration-500">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                </div>
                <h4 className="text-xl font-bold text-white">{member.name}</h4>
                <p className="text-brand-gold text-sm uppercase tracking-widest mt-2">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="impact" className="mt-32 bg-brand-surface p-12 rounded-[3rem] border border-white/5">
          <h2 className="text-4xl font-theatre text-white mb-8 text-center">Our Impact</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <span className="text-5xl font-theatre text-brand-accent block mb-2">15+</span>
              <span className="text-xs uppercase tracking-widest text-brand-muted">Productions</span>
            </div>
            <div>
              <span className="text-5xl font-theatre text-brand-gold block mb-2">200+</span>
              <span className="text-xs uppercase tracking-widest text-brand-muted">Club Members</span>
            </div>
            <div>
              <span className="text-5xl font-theatre text-brand-accent block mb-2">5000+</span>
              <span className="text-xs uppercase tracking-widest text-brand-muted">Audience Reached</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

const WorkPage = () => (
  <div className="bg-brand-bg pt-20">
    <section className="relative h-[50vh] flex items-center justify-center text-center px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1514525253344-f81f3f77412b?auto=format&fit=crop&q=80&w=1920" 
          alt="Work" 
          className="w-full h-full object-cover opacity-20 grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/20 via-brand-bg/80 to-brand-bg" />
      </div>
      <div className="relative z-10">
        <h1 className="text-6xl md:text-9xl font-theatre text-white mb-6">Our Work</h1>
        <p className="text-xl md:text-2xl text-brand-gold font-display italic">A showcase of creativity outside the festival.</p>
      </div>
    </section>

    <WorkRows />
  </div>
);

const WorkRows = () => {
  const { productions, getImages } = useContent();
  const artItems = getImages("art").map(i => ({ title: i.label, img: i.url }));
  const btsItems = getImages("bts").map(i => ({ title: i.label, img: i.url }));
  const mediaProds = productions.filter((p: any) => p.category === "Film" || p.category === "Performance");
  return (
    <div className="space-y-32 pb-32">
      <section id="productions">
        <NetflixRow title="Stage Productions" items={productions.filter((p: any) => p.category === "Theatre")} />
      </section>
      <section id="art">
        <NetflixRow title="Art Exhibitions" items={artItems.length > 0 ? artItems : FALLBACK_ART} />
      </section>
      <section id="media">
        <NetflixRow title="Media Projects" items={mediaProds.length > 0 ? mediaProds : productions.slice(3)} />
      </section>
      <section id="bts">
        <NetflixRow title="Behind the Scenes" items={btsItems.length > 0 ? btsItems : FALLBACK_BTS} />
      </section>
    </div>
  );
};

const JoinPage = () => {
  const { getImage } = useContent();
  const heroImg = getImage("hero") || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1920";
  const [form, setForm] = useState({ full_name: "", email: "", interest: "Theatre & Drama", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <div className="bg-brand-bg pt-20">
      <section className="relative h-[60vh] flex items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="Join" className="w-full h-full object-cover opacity-20 grayscale" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/20 via-brand-bg/80 to-brand-bg" />
        </div>
        <div className="relative z-10">
          <h1 className="text-6xl md:text-9xl font-theatre text-white mb-6">Join the Movement</h1>
          <p className="text-xl md:text-2xl text-brand-gold font-display italic">Your creative journey starts here.</p>
        </div>
      </section>

      <section className="py-32 px-6 md:px-12 max-w-5xl mx-auto">
        <div id="club" className="mb-32 text-center">
          <h2 className="text-4xl font-theatre text-white mb-8">Join the Club</h2>
          <p className="text-xl text-brand-muted leading-relaxed mb-12">
            Whether you're an actor, artist, filmmaker, or just someone with a passion for creativity, there's a place for you in the Remix Arts, Media & Drama Club.
          </p>
          <div className="bg-brand-surface p-12 rounded-[3rem] border border-white/5 max-w-2xl mx-auto">
            {status === "success" ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-6" />
                <h3 className="text-2xl font-theatre text-white mb-3">Application Received!</h3>
                <p className="text-brand-muted">Thanks, {form.full_name}! We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">Full Name</label>
                  <input type="text" required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                    className="w-full bg-brand-bg border border-white/10 rounded-sm px-4 py-3 text-white focus:border-brand-accent outline-none transition-colors" placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">Email Address</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-brand-bg border border-white/10 rounded-sm px-4 py-3 text-white focus:border-brand-accent outline-none transition-colors" placeholder="Enter your email" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">Area of Interest</label>
                  <select value={form.interest} onChange={e => setForm({ ...form, interest: e.target.value })}
                    className="w-full bg-brand-bg border border-white/10 rounded-sm px-4 py-3 text-white focus:border-brand-accent outline-none transition-colors">
                    <option>Theatre & Drama</option>
                    <option>Media & Film</option>
                    <option>Visual Arts</option>
                    <option>Music & Choir</option>
                    <option>Production Crew</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">Message (optional)</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3}
                    className="w-full bg-brand-bg border border-white/10 rounded-sm px-4 py-3 text-white focus:border-brand-accent outline-none transition-colors resize-none"
                    placeholder="Tell us a little about yourself..." />
                </div>
                {status === "error" && <p className="text-red-400 text-sm">{errorMsg}</p>}
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={status === "loading"}>
                  {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Application"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div id="volunteer" className="mb-32">
          <h2 className="text-4xl font-theatre text-white mb-16 text-center">Volunteer Opportunities</h2>
          <div id="opps" className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Event Staff", desc: "Help us manage the front of house and audience experience during our productions." },
              { title: "Stage Hands", desc: "Assist the production crew with set changes and technical support." },
              { title: "Media Assistants", desc: "Help our media team capture the magic behind the scenes." },
              { title: "Art Docents", desc: "Guide visitors through our exhibitions and share the stories behind the art." }
            ].map((opp, i) => (
              <div key={i} className="p-8 bg-brand-surface rounded-2xl border border-white/5">
                <h4 className="text-brand-gold font-bold mb-4">{opp.title}</h4>
                <p className="text-sm text-brand-muted">{opp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const TertuliaEditions = () => {
  const { productions } = useContent();
  const theatreProds = productions.filter((p: any) => p.category === "Theatre");
  return (
    <div className="space-y-12">
      {theatreProds.map((ed: any, i: number) => (
        <Link key={i} to={`/tertulia/${ed.year}`} className="block relative h-[400px] rounded-[3rem] overflow-hidden group cursor-pointer">
          <img src={ed.img || ed.image_url} alt={ed.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
          <div className="absolute bottom-10 left-10">
            <span className="text-brand-gold font-bold text-6xl md:text-8xl opacity-20 group-hover:opacity-40 transition-opacity">{ed.year}</span>
            <h4 className="text-2xl md:text-4xl font-display italic text-white -mt-8 group-hover:text-brand-gold transition-colors">{ed.subtitle}</h4>
            <p className="text-brand-gold font-bold uppercase tracking-widest text-[10px] mt-2 opacity-60 group-hover:opacity-100 transition-opacity">By {ed.author}</p>
            <div className="mt-4 flex items-center gap-2 text-brand-gold opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
              <span className="text-[10px] uppercase tracking-widest font-bold">Explore Production</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const ProductionDetailPage = () => {
  const { year } = useParams();
  const { productions } = useContent();
  const production = productions.find((p: any) => p.year === parseInt(year || "0")) || productions[0];

  if (!production) return (
    <div className="bg-brand-bg pt-40 text-center text-brand-muted min-h-screen">
      <p>Production not found.</p>
      <Link to="/tertulia" className="btn-outline mt-8 inline-flex">Back to Tertulia</Link>
    </div>
  );

  const castList = Array.isArray(production.cast) ? production.cast :
    (typeof production.cast_list === "string" ? JSON.parse(production.cast_list || "[]") : (production.cast_list || []));

  return (
    <div className="bg-brand-bg pt-20">
      <section className="relative h-[70vh] flex items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={production.img || production.image_url} 
            alt={production.title} 
            className="w-full h-full object-cover opacity-30 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/20 via-brand-bg/80 to-brand-bg" />
        </div>
        <div className="relative z-10">
          <span className="text-brand-gold font-bold uppercase tracking-[0.4em] text-xs mb-4 block">Tertulia {year}</span>
          <h1 className="text-6xl md:text-9xl font-theatre text-white mb-6">{production.title}</h1>
          <div className="space-y-2">
            <p className="text-xl md:text-3xl text-brand-muted font-display italic">{production.subtitle}</p>
            {production.author && (
              <p className="text-brand-gold font-bold uppercase tracking-[0.2em] text-sm">By {production.author}</p>
            )}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20">
          <div className="space-y-8">
            <h2 className="text-4xl font-theatre text-white">The Production</h2>
            <p className="text-lg text-brand-muted leading-relaxed">
              {production.description || `Tertulia ${year} was a landmark event for the club, pushing the boundaries of student theatre and artistic collaboration.`}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-brand-surface rounded-2xl border border-white/5">
                <span className="text-brand-gold font-bold text-2xl block mb-1">{production.performances || "—"}</span>
                <span className="text-[10px] uppercase tracking-widest text-brand-muted">Performances</span>
              </div>
              <div className="p-6 bg-brand-surface rounded-2xl border border-white/5">
                <span className="text-brand-gold font-bold text-2xl block mb-1">{production.attendees ? `${(production.attendees/1000).toFixed(1)}k` : "—"}</span>
                <span className="text-[10px] uppercase tracking-widest text-brand-muted">Attendees</span>
              </div>
            </div>
          </div>
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
            <img src={production.img || production.image_url} alt="Production" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      <section className="py-32 bg-brand-surface">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-theatre text-white mb-16 text-center">Behind the Scenes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden">
                <img src={`https://picsum.photos/seed/bts${year}${i}/600/600`} alt="BTS" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {castList.length > 0 && (
        <section className="py-32 px-6 md:px-12 max-w-5xl mx-auto">
          <h2 className="text-4xl font-theatre text-white mb-16 text-center">Cast & Characters</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {castList.map((member: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-6 bg-brand-surface rounded-2xl border border-white/5 group hover:border-brand-accent transition-all">
                <div className="flex flex-col">
                  <span className="text-brand-gold font-bold text-xl mb-1 group-hover:text-brand-accent transition-colors">{member.character}</span>
                  <span className="text-xs uppercase tracking-widest text-brand-muted">Character</span>
                </div>
                <div className="text-right flex flex-col">
                  <span className="text-white font-display italic text-lg mb-1">{member.actor}</span>
                  <span className="text-[10px] uppercase tracking-widest text-brand-muted">Actor</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="py-32 px-6 text-center">
        <Link to="/tertulia" className="btn-outline inline-flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Tertulia
        </Link>
      </section>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <ContentProvider>
      <Routes>
        {/* Admin panel — full-screen, no navbar/footer */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Public site */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col">
            <ScrollToHash />
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/tertulia" element={<TertuliaPage />} />
                <Route path="/work" element={<WorkPage />} />
                <Route path="/upcoming" element={<UpcomingPage />} />
                <Route path="/join" element={<JoinPage />} />
                <Route path="/tertulia/:year" element={<ProductionDetailPage />} />
                <Route path="/partner" element={<PartnerPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </ContentProvider>
  );
}
