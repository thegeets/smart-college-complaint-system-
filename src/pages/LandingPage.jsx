import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { m, AnimatePresence, useScroll, useTransform, useReducedMotion, useInView } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { HeroVisual } from '../components/HeroVisual';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { TiltCard } from '../components/TiltCard';
import { MagneticButton } from '../components/MagneticButton';
import { TypewriterTerminal } from '../components/TypewriterTerminal';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import {
  fadeUp,
  scaleIn,
  staggerContainer,
  MOTION_EASE,
  Reveal,
} from '../lib/motion';
import {
  PlusCircle,
  ArrowRight,
  Mail,
  Phone,
  Monitor,
  Wifi,
  Terminal,
  BookOpen,
  Laptop,
  Tv,
  CheckCircle2,
  Search,
  FileText,
  ShieldCheck,
  Lock,
  UserCheck,
  Clock,
  ChevronDown,
  MapPin,
  Wrench,
  Sparkles,
  ArrowUp,
  LayoutGrid,
  Activity,
} from 'lucide-react';

export function LandingPage() {
  const { language, isStudentLoggedIn } = useApp();
  const isNe = language === 'ne';
  const shouldReduceMotion = useReducedMotion();

  // FAQ Accordion State (item 0 open by default)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Interactive Platform Showcase tab state & auto-rotation
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const [hasUserInteractedFeature, setHasUserInteractedFeature] = useState(false);
  const showcaseSectionRef = useRef(null);
  const isShowcaseInView = useInView(showcaseSectionRef, { margin: '-40px' });
  const [isLandingPageVisible, setIsLandingPageVisible] = useState(
    typeof document !== 'undefined' ? !document.hidden : true
  );

  useEffect(() => {
    const handleVis = () => {
      setIsLandingPageVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, []);

  // Auto-rotate through the 4 features every 5s until user interacts
  useEffect(() => {
    if (hasUserInteractedFeature || shouldReduceMotion || !isShowcaseInView || !isLandingPageVisible) {
      return;
    }

    const interval = setInterval(() => {
      setActiveFeatureTab((prev) => (prev + 1) % 4);
    }, 5000);

    return () => clearInterval(interval);
  }, [hasUserInteractedFeature, shouldReduceMotion, isShowcaseInView, isLandingPageVisible]);

  const handleSelectFeatureTab = (index) => {
    setHasUserInteractedFeature(true);
    setActiveFeatureTab(index);
  };

  // Floating Back to Top button visibility (appears after 600px of scroll)
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Scroll Parallax for Hero Ambient Elements
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 600], [0, 50]);

  // Page Visibility API: pause looping CSS/ambient animations when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.documentElement.classList.add('animations-paused');
      } else {
        document.documentElement.classList.remove('animations-paused');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.documentElement.classList.remove('animations-paused');
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  // 6 Authorized IT Categories
  const categoryDetails = [
    {
      key: 'Internet / Wi-Fi / Network',
      icon: Wifi,
      title: isNe ? 'इन्टरनेट तथा क्याम्पस वाइफाइ' : 'Wi-Fi & Campus Network',
      desc: isNe
        ? 'कम्प्युटर ल्याबमा इन्टरनेट विच्छेद, कमजोर वाइफाइ कभरेज तथा स्वीच पोर्ट खराबी।'
        : 'Lab network drops, weak Wi-Fi coverage, router packet loss, and physical switch port issues.',
      examples: ['Lab 1 & 2 Wi-Fi disconnects', 'Ethernet jack non-functional', 'DNS routing latency'],
    },
    {
      key: 'Computer Lab / Hardware',
      icon: Monitor,
      title: isNe ? 'कम्प्युटर ल्याब तथा हार्डवेयर' : 'Computer Lab & Workstations',
      desc: isNe
        ? 'कम्प्युटर बुट नहुने, मनिटर डिस्प्ले खराबी, मेकानिकल किबोर्ड वा माउस समस्या।'
        : 'PC boot errors, monitor artifacts, non-responsive keyboards, RAM faults, and lab peripheral defects.',
      examples: ['Workstation power supply failure', 'Keyboard key switch broken', 'Blue-screen bootloop'],
    },
    {
      key: 'Software / Programming Tools',
      icon: Terminal,
      title: isNe ? 'प्रोग्रामिङ सफ्टवेयर तथा टुल्स' : 'Programming Tools & OS',
      desc: isNe
        ? 'GCC/G++ कम्पाइलर पाथ, Java JDK, Python वातावरण, MySQL तथा लिनक्स ओएस खराबी।'
        : 'Compiler path mismatches, IDE crashes, Python venv corruptions, DBMS services, and Linux OS setup.',
      examples: ['C++ compiler toolchain path error', 'MySQL daemon stopped on PC 08', 'VS Code terminal error'],
    },
    {
      key: 'Classroom Technology / Projector',
      icon: Tv,
      title: isNe ? 'कक्षाकोठा प्रोजेक्टर तथा प्रविधि' : 'Classroom Projectors & Tech',
      desc: isNe
        ? 'एचडीएमआई (HDMI) केबल खराबी, प्रोजेक्टर रङ परिवर्तन, अडियो प्रणाली तथा स्मार्ट बोर्ड।'
        : 'Ceiling projector color band flickering, loose HDMI cables, soundbar faults, and display screens.',
      examples: ['Projector flickering red tint in Hall B', 'Broken HDMI head', 'Audio amplifier hum'],
    },
    {
      key: 'Programming Classes / Assignments',
      icon: BookOpen,
      title: isNe ? 'प्रोग्रामिङ कक्षा तथा प्रयोगात्मक ल्याब' : 'Programming Classes & Labs',
      desc: isNe
        ? 'प्रयोगात्मक ल्याब समय व्यवस्थापन, सफ्टवेयर लाइब्रेरी अनुपलब्धता तथा ल्याब वातावरण।'
        : 'Required software libraries unavailable during C++/Java practicals, and workstation availability.',
      examples: ['OpenGL libraries missing for CG practical', 'Graphics driver crash in DSA lab'],
    },
    {
      key: 'IT Project / Supervision',
      icon: Laptop,
      title: isNe ? 'आईटी प्रोजेक्ट तथा ल्याब सुपरिवेक्षण' : 'IT Project & Senior Labs',
      desc: isNe
        ? 'कलेज सातौँ/आठौँ सेमेस्टर प्रोजेक्ट वर्कस्टेसन, स्थानीय सर्भर भीएम तथा डेटासेट पहुँच।'
        : 'Project workstation setups, local virtual machine environments, and server allocation for student practicals.',
      examples: ['Project VM network bridge down', 'Local testing database port blocked'],
    },
  ];

  // Features demonstration tabs
  const platformFeatures = [
    {
      id: 'triage',
      title: isNe ? '२४–४८ घण्टा भित्र सम्बोधन' : 'Target Response within 24–48 Hours',
      desc: isNe
        ? 'तपाईंले दर्ता गरेको प्रत्येक प्राविधिक समस्या तुरुन्तै सम्बन्धित ल्याब प्राविधिकलाई खटाइन्छ।'
        : 'Every report is routed to on-campus technicians with clear, transparent turnaround times.',
      icon: Clock,
    },
    {
      id: 'privacy',
      title: isNe ? 'विद्यार्थी गोपनीयताको पूर्ण सुरक्षा' : 'Your Complaints are Strictly Private',
      desc: isNe
        ? 'तपाईंको उजुरी पूर्ण रूपमा गोप्य रहन्छ र केवल तपाईं र आधिकारिक प्राविधिक टोलीले मात्र हेर्न सक्छन्।'
        : 'Your complaints are private and only visible to you and authorized IT staff.',
      icon: ShieldCheck,
    },
    {
      id: 'timeline',
      title: isNe ? '४-चरणमा स्पष्ट प्रगति विवरण' : 'Clear 4-Stage Resolution Pipeline',
      desc: isNe
        ? 'उजुरी दर्तादेखि प्राविधिक मर्मत र अन्तिम समाधानसम्मको प्रत्येक चरण सहजै हेर्नुहोस्।'
        : 'Follow your issue step-by-step from submission to on-site testing and verified fix.',
      icon: Sparkles,
    },
    {
      id: 'legacy',
      title: isNe ? 'पुरानो उजुरी खातामा जोड्ने सुविधा' : 'Link Previous Guest Complaints',
      desc: isNe
        ? 'पहिले दर्ता गरिएका उजुरीहरू आफ्नो सन्दर्भ कोड मार्फत विद्यार्थी ड्यासबोर्डमा जोड्न सक्नुहुन्छ।'
        : 'Easily link earlier guest tickets to your student account using your Reference ID and secret.',
      icon: Laptop,
    },
  ];

  // FAQ Items tailored to mandatory student authentication & dashboard
  const faqItems = [
    {
      q: isNe
        ? 'के उजुरी दर्ता र ट्र्याक गर्न विद्यार्थी खाता आवश्यक पर्छ?'
        : 'Do I need a student account to submit or track a complaint?',
      a: isNe
        ? 'हो। जवाफदेहिता, सुरक्षित ड्यासबोर्ड अनुगमन र आधिकारिक सूचना आदानप्रदानका लागि विद्यार्थीहरूले आफ्नो नाम, विद्यार्थी परिचयपत्र (Student ID) र सेमेस्टर प्रविष्ट गरी दर्ता गर्नुपर्दछ। दर्ता हुनासाथ खाता तुरुन्त सक्रिय हुन्छ र सिधै उजुरी दर्ता तथा "मेरो उजुरीहरू" ड्यासबोर्डबाट अनुगमन गर्न सकिन्छ।'
        : 'Yes. To ensure accountability, reliable progress tracking, and authenticated privacy, students register with their name, student ID, and semester. Once registered, your account is immediately active to submit complaints and track resolutions directly from your dashboard.',
    },
    {
      q: isNe
        ? 'उजुरीको स्थिति कसरी जाँच गर्ने र कलेजको जवाफ कसरी हेर्ने?'
        : 'How do I check the live status of my complaint and read college responses?',
      a: isNe
        ? 'विद्यार्थी खाता लगइन गरेपछि मेनु वा ड्यासबोर्डबाट "मेरो उजुरीहरू" (My Complaints) खण्डमा जानुहोस्। त्यहाँ दर्ता भएका सम्पूर्ण उजुरीहरूको चरणबद्ध प्रगति (Submitted → Under Review → In Progress → Resolved) र प्राविधिक टोलीको आधिकारिक जवाफ हेर्न सकिन्छ।'
        : 'Sign in to your student account and navigate to "My Complaints" in your dashboard. You will see real-time stage transitions (Submitted → Under Review → In Progress → Resolved) along with documented responses and timestamps from the college IT team.',
    },
    {
      q: isNe
        ? 'पहिला दर्ता गरिएको पुरानो उजुरी (Legacy Complaint) कसरी हेर्ने?'
        : 'What if I submitted a complaint previously without a student account?',
      a: isNe
        ? 'पुरानो प्रणालीबाट दर्ता भएका उजुरीहरू सुरक्षित छन्। विद्यार्थी ड्यासबोर्डमा लगइन गरी "Claim Legacy Complaint" सुविधा मार्फत पुरानो Reference ID र गोप्य Tracking Secret प्रविष्ट गरेर त्यस उजुरीलाई आफ्नो नयाँ विद्यार्थी खातासँग जोड्न सकिन्छ।'
        : 'Legacy complaints submitted before mandatory student accounts are preserved safely. Log in to your student dashboard and use the "Claim Legacy Complaint" feature with your original Reference ID and Tracking Secret to link it directly to your account.',
    },
    {
      q: isNe
        ? 'के अन्य विद्यार्थीहरू वा बाहिरी व्यक्तिहरूले मेरो उजुरी हेर्न सक्छन्?'
        : 'Can other students or public visitors view my complaint details or attachments?',
      a: isNe
        ? 'सक्दैनन्। प्रत्येक विद्यार्थीको उजुरी व्यक्तिगत र प्रमाणीकृत ड्यासबोर्डमा मात्र सीमित रहन्छ। प्रणालीमा कुनै सार्वजनिक उजुरी सूची हुँदैन र केवल सम्बन्धित विद्यार्थी तथा कलेज आईटी प्रशासनले मात्र विवरण तथा संलग्न फाइलहरू हेर्न पाउँछन्।'
        : 'Strictly no. Complaints and attachments are strictly protected by session authentication and ownership validation. There is no public directory, and students cannot access each other’s complaints, attachments, or replies.',
    },
    {
      q: isNe
        ? 'उजुरीसँगै कुन ढाँचाका फाइलहरू संलग्न गर्न सकिन्छ?'
        : 'What file formats can I attach with my complaint as proof?',
      a: isNe
        ? 'तपाईंले ५ MB सम्मको अधिकतम १ फाइल (JPG, PNG वा PDF) संलग्न गर्न सक्नुहुन्छ। सर्भरले फाइलको वास्तविक बाइनरी ढाँचा प्रमाणीकरण गर्छ।'
        : 'You can attach 1 optional file up to 5 MB in JPG, PNG, or PDF format. Binary signatures and MIME types are verified on the server to prevent malicious uploads.',
    },
    {
      q: isNe
        ? 'दर्ता भएका क्याम्पस आईटी समस्याहरू कसले समाधान गर्छन्?'
        : 'Who inspects and resolves reported campus IT issues?',
      a: isNe
        ? 'उजुरीहरू सोच कलेज अफ आईटीको आधिकारिक कम्प्युटर ल्याब प्रशासक तथा नेटवर्क प्राविधिकहरूद्वारा सिधै समीक्षा र प्राथमिकताका आधारमा मर्मत गरिन्छ।'
        : 'Complaints are triaged directly by authorized Soch College of IT laboratory administrators and network technicians, with coordination from the academic IT department.',
    },
  ];

  // Word-by-word headline animation setup
  const titleWordsEn1 = ['Student', 'Campus', 'IT', 'Service', '&'];
  const titleWordsEn2 = ['Grievance', 'Portal'];
  const titleWordsNe1 = ['विद्यार्थी', 'क्याम्पस', 'आईटी', 'सेवा', 'तथा'];
  const titleWordsNe2 = ['उजुरी', 'पोर्टल'];

  const wordAnimation = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: MOTION_EASE },
    },
  };

  return (
    <div className="landing-page-wrapper" id="top">
      {/* Sticky Header Bar with Frosted Glass & Scroll Progress */}
      <PublicNavbar />

      <main id="main-content">
        {/* =========================================================================
            HERO SECTION — Balanced Two Column Layout (Comfortably Above the Fold)
            ========================================================================= */}
        <section className="hero-master-section">
          {/* Atmospheric Ambient Lighting & Grid with Parallax & Slow Drift (26s+) */}
          <m.div
            className="cinematic-hero-bg"
            aria-hidden="true"
            style={shouldReduceMotion ? {} : { y: heroParallaxY }}
          >
            <div className="hero-mesh-grid" />
            <div className="ambient-orb ambient-orb-1" />
            <div className="ambient-orb ambient-orb-2" />
            <div className="ambient-orb ambient-orb-3" />
          </m.div>

          <div className="hero-master-container">
            {/* Left Column: Staggered Entrance (Badge, Heading, Copy, Actions, Badges) */}
            <m.div
              className="hero-content-column"
              variants={staggerContainer(0.08, 0.04)}
              initial={shouldReduceMotion ? false : 'hidden'}
              animate="visible"
            >
              {/* Trust Eyebrow Tag */}
              <m.div className="hero-trust-tag" variants={fadeUp(0, 14)}>
                <span className="live-pulse-dot" aria-hidden="true" />
                <ShieldCheck size={14} className="hero-trust-icon" />
                <span>
                  {isNe
                    ? 'सोच कलेज अफ आईटी, पोखरा — आधिकारिक विद्यार्थी आईटी डेस्क'
                    : 'Soch College of IT, Pokhara — Official Student IT Desk'}
                </span>
              </m.div>

              {/* Main Headline with Word-by-Word Reveal & Accent Shimmer */}
              <h1 className="hero-main-title">
                {isNe ? (
                  <>
                    <span className="hero-title-words-group">
                      {titleWordsNe1.map((word, i) => (
                        <m.span
                          key={i}
                          variants={wordAnimation}
                          style={{ display: 'inline-block', marginRight: '0.28em' }}
                        >
                          {word}
                        </m.span>
                      ))}
                    </span>{' '}
                    <span className="hero-title-accent shimmer-text">
                      {titleWordsNe2.map((word, i) => (
                        <m.span
                          key={i}
                          variants={wordAnimation}
                          style={{ display: 'inline-block', marginRight: '0.28em' }}
                        >
                          {word}
                        </m.span>
                      ))}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="hero-title-words-group">
                      {titleWordsEn1.map((word, i) => (
                        <m.span
                          key={i}
                          variants={wordAnimation}
                          style={{ display: 'inline-block', marginRight: '0.28em' }}
                        >
                          {word}
                        </m.span>
                      ))}
                    </span>{' '}
                    <span className="hero-title-accent shimmer-text">
                      {titleWordsEn2.map((word, i) => (
                        <m.span
                          key={i}
                          variants={wordAnimation}
                          style={{ display: 'inline-block', marginRight: '0.28em' }}
                        >
                          {word}
                        </m.span>
                      ))}
                    </span>
                  </>
                )}
              </h1>

              {/* Supporting Copy */}
              <m.p className="hero-lead-description" variants={fadeUp(0.16, 14)}>
                {isNe
                  ? 'कम्प्युटर ल्याब, क्याम्पस वाइफाइ, प्रोजेक्टर तथा सफ्टवेयरसम्बन्धी समस्याहरू आधिकारिक रूपमा दर्ता गर्नुहोस् र आफ्नो विद्यार्थी ड्यासबोर्डबाट प्रत्यक्ष समाधानको प्रगति हेर्नुहोस्।'
                  : 'Submit technical reports for computer lab workstations, campus Wi-Fi, classroom projectors, and programming environments. Track verified updates directly from your student dashboard.'}
              </m.p>

              {/* Action Buttons Cluster with Magnetic Hover & Arrow Glide */}
              <m.div className="hero-action-cluster" variants={fadeUp(0.22, 14)}>
                <MagneticButton>
                  <Link
                    to="/submit"
                    className="btn btn-primary btn-lg hero-btn-primary animated-hover-btn"
                  >
                    <PlusCircle size={18} />
                    <span>{isNe ? 'उजुरी दर्ता गर्नुहोस्' : 'Submit a Complaint'}</span>
                    <m.span
                      className="btn-arrow-icon"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                    </m.span>
                  </Link>
                </MagneticButton>

                {isStudentLoggedIn ? (
                  <Link to="/dashboard" className="btn btn-secondary btn-lg hero-btn-secondary">
                    <FileText size={17} />
                    <span>{isNe ? 'मेरो उजुरीहरू' : 'My Complaints'}</span>
                  </Link>
                ) : (
                  <Link to="/track" className="btn btn-secondary btn-lg hero-btn-secondary">
                    <Search size={17} />
                    <span>{isNe ? 'उजुरी ट्र्याक गर्नुहोस्' : 'Track Complaint'}</span>
                  </Link>
                )}
              </m.div>

              {/* High-Trust Verification Badges Strip */}
              <m.div className="hero-trust-badges-strip" variants={fadeUp(0.28, 14)}>
                <div className="hero-trust-badge-item">
                  <CheckCircle2 size={13} className="trust-badge-icon" />
                  <span>
                    {isNe
                      ? COLLEGE_CONFIG.contact.targetSlaPhraseNe
                      : COLLEGE_CONFIG.contact.targetSlaPhrase}
                  </span>
                </div>
                <div className="hero-trust-badge-item">
                  <ShieldCheck size={13} className="trust-badge-icon" />
                  <span>{isNe ? 'प्रमाणीकृत विद्यार्थी सुरक्षा' : 'Student Privacy Guaranteed'}</span>
                </div>
                <div className="hero-trust-badge-item">
                  <Clock size={13} className="trust-badge-icon" />
                  <span>{isNe ? 'प्रत्यक्ष ४-चरणीय ट्र्याकिङ' : 'Live 4-Stage Tracking'}</span>
                </div>
              </m.div>
            </m.div>

            {/* Right Column: Hero Visual Card (Spring In & Gentle Float) */}
            <div className="hero-visual-column">
              <HeroVisual />
            </div>
          </div>

          {/* Slim Trust Strip at Hero Bottom (Fade-up stagger on load, 2x2 grid on mobile) */}
          <div className="hero-trust-strip-container">
            <m.div
              className="hero-trust-strip"
              variants={staggerContainer(0.06, 0.12)}
              initial={shouldReduceMotion ? false : 'hidden'}
              animate="visible"
            >
              <m.div className="hero-trust-strip-item" variants={fadeUp(0, 8)}>
                <LayoutGrid size={15} className="trust-strip-icon" aria-hidden="true" />
                <span>{isNe ? '६ सेवा विधाहरू' : '6 Service Areas'}</span>
              </m.div>

              <div className="trust-strip-divider" aria-hidden="true" />

              <m.div className="hero-trust-strip-item" variants={fadeUp(0, 8)}>
                <Clock size={15} className="trust-strip-icon" aria-hidden="true" />
                <span>{isNe ? '२४-४८ घण्टामा समाधान' : '24–48h Response'}</span>
              </m.div>

              <div className="trust-strip-divider" aria-hidden="true" />

              <m.div className="hero-trust-strip-item" variants={fadeUp(0, 8)}>
                <Activity size={15} className="trust-strip-icon" aria-hidden="true" />
                <span>{isNe ? '४-चरण प्रत्यक्ष ट्र्याकिङ' : '4-Stage Tracking'}</span>
              </m.div>

              <div className="trust-strip-divider" aria-hidden="true" />

              <m.div className="hero-trust-strip-item" variants={fadeUp(0, 8)}>
                <ShieldCheck size={15} className="trust-strip-icon" aria-hidden="true" />
                <span>{isNe ? 'सुरक्षित तथा गोप्य' : 'Private & Secure'}</span>
              </m.div>
            </m.div>
          </div>

          {/* Soft Curved & Gradient Divider at Hero Bottom Edge */}
          <div className="hero-bottom-curve-divider" aria-hidden="true">
            <svg
              viewBox="0 0 1440 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              className="hero-curve-svg"
            >
              <path
                d="M0,0 C420,24 1020,24 1440,0 L1440,36 L0,36 Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
        </section>

        {/* =========================================================================
            STATISTICS & OPERATIONAL HIGHLIGHTS STRIP (Count-Up on View)
            ========================================================================= */}
        <section className="home-stats-strip">
          <div className="container">
            <m.div
              className="home-stats-grid"
              variants={staggerContainer(0.08)}
              initial={shouldReduceMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              {/* Stat 1: 6 Categories */}
              <m.div
                className="home-stat-card"
                variants={fadeUp(0, 14)}
                whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
              >
                <div className="home-stat-icon-box royal-blue">
                  <Monitor size={22} />
                </div>
                <div className="home-stat-content">
                  <div className="home-stat-num">
                    <AnimatedNumber value={6} /> Categories
                  </div>
                  <div className="home-stat-label">
                    {isNe ? 'स्वीकृत ल्याब तथा आईटी विधा' : 'Dedicated IT Service Areas'}
                  </div>
                </div>
              </m.div>

              {/* Stat 2: 24–48 Hours */}
              <m.div
                className="home-stat-card"
                variants={fadeUp(0.08, 14)}
                whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
              >
                <div className="home-stat-icon-box navy">
                  <Clock size={22} />
                </div>
                <div className="home-stat-content">
                  <div className="home-stat-num">
                    <AnimatedNumber value={24} />–48 Hours
                  </div>
                  <div className="home-stat-label">
                    {isNe ? 'औसत समीक्षा तथा खटन' : 'Target Response Time'}
                  </div>
                </div>
              </m.div>

              {/* Stat 3: 4 Stages */}
              <m.div
                className="home-stat-card"
                variants={fadeUp(0.16, 14)}
                whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
              >
                <div className="home-stat-icon-box royal-blue">
                  <CheckCircle2 size={22} />
                </div>
                <div className="home-stat-content">
                  <div className="home-stat-num">
                    <AnimatedNumber value={4} /> Stages
                  </div>
                  <div className="home-stat-label">
                    {isNe ? 'पारदर्शी चरणबद्ध प्रगति' : 'Tracked Resolution Pipeline'}
                  </div>
                </div>
              </m.div>

              {/* Stat 4: 100% Secure */}
              <m.div
                className="home-stat-card"
                variants={fadeUp(0.24, 14)}
                whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
              >
                <div className="home-stat-icon-box navy">
                  <ShieldCheck size={22} />
                </div>
                <div className="home-stat-content">
                  <div className="home-stat-num">
                    <AnimatedNumber value={100} />% Secure
                  </div>
                  <div className="home-stat-label">
                    {isNe ? 'विद्यार्थी गोपनीयता संरक्षण' : 'Student Privacy Guaranteed'}
                  </div>
                </div>
              </m.div>
            </m.div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 1: AUTHORIZED IT CATEGORIES (3D Tilt & Staggered Reveal)
            ========================================================================= */}
        <section id="categories" className="home-categories-section">
          <div className="container">
            <Reveal>
              <div className="section-heading-block">
                <span className="section-subheading">
                  {isNe ? 'सोच कलेज अफ आईटी — सेवा क्षेत्रहरू' : 'CAMPUS IT SERVICE AREAS'}
                </span>
                <h2 className="section-main-heading">
                  {isNe ? 'तपाईं के-के दर्ता गर्न सक्नुहुन्छ?' : 'Complaint Categories'}
                </h2>
                <p className="section-lead-copy">
                  {isNe
                    ? 'कलेज पाठ्यक्रम तथा प्रयोगात्मक ल्याब सञ्चालनका लागि निर्धारित ६ प्राविधिक सेवा विधाहरू:'
                    : 'Dedicated categories for computer lab workstations, campus networking, software stacks, and classroom hardware:'}
                </p>
              </div>
            </Reveal>

            <m.div
              className="categories-rich-grid"
              variants={staggerContainer(0.08)}
              initial={shouldReduceMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              {categoryDetails.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <m.div key={idx} variants={fadeUp(idx * 0.05, 16)}>
                    <TiltCard maxTilt={4}>
                      <div className="category-rich-card">
                        {/* Top Accent Bar that sweeps in on hover */}
                        <div className="card-top-sweep-accent" aria-hidden="true" />

                        <div className="category-card-top">
                          <div className="category-icon-box">
                            <Icon size={20} />
                          </div>
                          <span className="category-index-badge">0{idx + 1}</span>
                        </div>

                        <h3 className="category-card-title">{cat.title}</h3>
                        <p className="category-card-desc">{cat.desc}</p>

                        <div className="category-examples-box">
                          <span className="examples-label">
                            {isNe ? 'उदाहरणहरू:' : 'Common Reports:'}
                          </span>
                          <ul className="examples-list">
                            {cat.examples.map((ex, i) => (
                              <li key={i}>{ex}</li>
                            ))}
                          </ul>
                        </div>

                        <Link
                          to={`/submit?category=${encodeURIComponent(cat.key)}`}
                          className="category-action-link"
                          title={`Report this issue: ${cat.title}`}
                        >
                          <span>{isNe ? 'यस विधामा उजुरी दिनुहोस्' : 'Report this issue'}</span>
                          <ArrowRight size={14} className="category-arrow-icon" />
                        </Link>
                      </div>
                    </TiltCard>
                  </m.div>
                );
              })}
            </m.div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: SERVICE ASSURANCE & TYPEWRITER TERMINAL SHOWCASE
            ========================================================================= */}
        <section className="interactive-showcase-section">
          <div className="container">
            <Reveal>
              <div className="section-heading-block">
                <span className="section-subheading">
                  {isNe ? 'सेवा प्रत्याभूति' : 'SERVICE GUARANTEES'}
                </span>
                <h2 className="section-main-heading">
                  {isNe ? 'समस्या समाधान कसरी हुन्छ?' : 'How the System Resolves Your Issues'}
                </h2>
                <p className="section-lead-copy">
                  {isNe
                    ? 'पारदर्शी समयसीमा, विद्यार्थी गोपनीयता, र चरणबद्ध प्राविधिक समाधान:'
                    : 'Clear turnaround times, guaranteed student privacy, and documented updates every step of the way:'}
                </p>
              </div>
            </Reveal>

            <div ref={showcaseSectionRef} className="interactive-demo-container">
              {/* Left Column: Interactive Feature Selector Pills */}
              <div className="demo-tab-selector" role="tablist">
                {platformFeatures.map((feat, index) => {
                  const TabIcon = feat.icon;
                  const isActive = activeFeatureTab === index;
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelectFeatureTab(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectFeatureTab(index);
                        }
                      }}
                      onMouseEnter={() => handleSelectFeatureTab(index)}
                      className={`demo-tab-card ${isActive ? 'active' : ''}`}
                    >
                      <div className="demo-tab-icon">
                        <TabIcon size={18} />
                      </div>
                      <div>
                        <h4 className="demo-tab-title">{feat.title}</h4>
                        <p className="demo-tab-desc">{feat.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Sample Ticket Terminal Showcase with Live SLA Countdown */}
              <TypewriterTerminal activeFeatureTab={activeFeatureTab} isNe={isNe} />
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: FOUR-STEP RESOLUTION PROCESS ("HOW IT WORKS")
            ========================================================================= */}
        <section id="process" className="home-process-section">
          <div className="container">
            <Reveal>
              <div className="section-heading-block">
                <span className="section-subheading">
                  {isNe ? 'सहज तथा पारदर्शी कार्यप्रणाली' : 'TRANSPARENT WORKFLOW'}
                </span>
                <h2 className="section-main-heading">
                  {isNe ? 'समस्या दर्तादेखि समाधानसम्मको ४-चरणीय प्रक्रिया' : 'How the System Works in 4 Steps'}
                </h2>
                <p className="section-lead-copy">
                  {isNe
                    ? 'विद्यार्थी दर्तादेखि कलेजको आधिकारिक समाधानसम्मका स्पष्ट चरणहरू:'
                    : 'From student registration and complaint submission to desk triage and verified technical resolution:'}
                </p>
              </div>
            </Reveal>

            {/* Stepper Grid with Animated Connecting SVG Line */}
            <div className="process-steps-wrapper">
              <svg
                className="process-connecting-svg-line"
                aria-hidden="true"
                viewBox="0 0 1000 4"
                preserveAspectRatio="none"
              >
                <m.line
                  x1="40"
                  y1="2"
                  x2="960"
                  y2="2"
                  stroke="#D5E1F7"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  initial={shouldReduceMotion ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 1.1, ease: MOTION_EASE }}
                />
              </svg>

              <m.div
                className="process-steps-grid"
                variants={staggerContainer(0.1)}
                initial={shouldReduceMotion ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
              >
                {/* Step 1 */}
                <m.div
                  className="process-step-card"
                  variants={scaleIn(0)}
                  whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="step-num-badge">1</div>
                  <div className="step-icon-wrap">
                    <FileText size={20} color="#101D35" />
                  </div>
                  <div className="step-status-chip status-submitted">
                    {isNe ? 'चरण १: दर्ता' : 'Status: Submitted'}
                  </div>
                  <h3 className="step-title">{isNe ? '१. प्रमाणीकृत दर्ता' : '1. Authenticated Submission'}</h3>
                  <p className="step-desc">
                    {isNe
                      ? 'विद्यार्थी खाताबाट लगइन गरी समस्या विधा, ल्याब वा कोठा नम्बर, र विवरण प्रविष्ट गर्नुहोस्।'
                      : 'Log in to your student account, pick the IT category, state the lab room or PC number, and attach optional screenshots.'}
                  </p>
                </m.div>

                {/* Step 2 */}
                <m.div
                  className="process-step-card"
                  variants={scaleIn(0.08)}
                  whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="step-num-badge">2</div>
                  <div className="step-icon-wrap">
                    <Search size={20} color="#203B64" />
                  </div>
                  <div className="step-status-chip status-review">
                    {isNe ? 'चरण २: समीक्षा' : 'Status: Under Review'}
                  </div>
                  <h3 className="step-title">{isNe ? '२. प्रशासनिक समीक्षा' : '2. Desk Review & Triage'}</h3>
                  <p className="step-desc">
                    {isNe
                      ? 'ल्याब प्रशासनले उजुरी अध्ययन गर्छ, प्राथमिकता निर्धारण गर्छ र प्राविधिकलाई खटाउँछ।'
                      : 'College IT staff evaluate the reported fault, verify hardware/network symptoms, and assign an on-site technician.'}
                  </p>
                </m.div>

                {/* Step 3 */}
                <m.div
                  className="process-step-card"
                  variants={scaleIn(0.16)}
                  whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="step-num-badge">3</div>
                  <div className="step-icon-wrap">
                    <Wrench size={20} color="#5278C8" />
                  </div>
                  <div className="step-status-chip status-progress">
                    {isNe ? 'चरण ३: प्रगतिमा' : 'Status: In Progress'}
                  </div>
                  <h3 className="step-title">{isNe ? '३. प्राविधिक मर्मत कार्य' : '3. On-Site Inspection & Repair'}</h3>
                  <p className="step-desc">
                    {isNe
                      ? 'प्राविधिक टोलीले ल्याबमा पुगेर तार, उपकरण वा सफ्टवेयर मर्मत गर्छ।'
                      : 'IT specialists inspect the workstation, replace faulty cables/RAM, reconfigure switches, or update compilers.'}
                  </p>
                </m.div>

                {/* Step 4 */}
                <m.div
                  className="process-step-card"
                  variants={scaleIn(0.24)}
                  whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="step-num-badge">4</div>
                  <div className="step-icon-wrap">
                    <CheckCircle2 size={20} color="#15803D" />
                  </div>
                  <div className="step-status-chip status-resolved">
                    {isNe ? 'चरण ४: समाधान' : 'Status: Resolved'}
                  </div>
                  <h3 className="step-title">{isNe ? '४. समाधान तथा जवाफ' : '4. Resolution & Official Reply'}</h3>
                  <p className="step-desc">
                    {isNe
                      ? 'मर्मत सम्पन्न भएपछि प्राविधिक टिप्पणी रेकर्ड हुन्छ र तपाईंको ड्यासबोर्डमा स्थिति अद्यावधिक हुन्छ।'
                      : 'Staff document the repair details with date and time. Your student dashboard updates with the official closing remarks.'}
                  </p>
                </m.div>
              </m.div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: STUDENT PRIVACY & DATA CONFIDENTIALITY
            ========================================================================= */}
        <section id="privacy" className="home-privacy-section">
          <div className="container">
            <Reveal>
              <div className="privacy-card-banner">
                <div className="privacy-banner-left">
                  <div className="privacy-shield-icon-wrap">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <span className="privacy-badge">
                      {isNe ? 'सुरक्षा तथा गोपनीयता' : 'CONFIDENTIALITY & ACCESS'}
                    </span>
                    <h2 className="privacy-title">
                      {isNe ? 'विद्यार्थीको व्यक्तिगत उजुरी पूर्ण रूपमा सुरक्षित' : 'Student Privacy Guaranteed'}
                    </h2>
                    <p className="privacy-text">
                      {isNe
                        ? 'तपाईंको उजुरी पूर्ण रूपमा गोप्य रहन्छ र केवल तपाईं र आधिकारिक प्राविधिक टोलीले मात्र हेर्न सक्छन्। प्रणालीमा कुनै सार्वजनिक सूची हुँदैन र कसैले पनि अरूको उजुरी हेर्न पाउँदैन।'
                        : 'Your complaints are private and only visible to you and authorized IT staff. There is no public grievance feed, and cross-account access is strictly prevented by session authentication.'}
                    </p>
                  </div>
                </div>

                <div className="privacy-pillars-list">
                  <div className="privacy-pillar-item">
                    <Lock size={16} color="#5278C8" />
                    <div>
                      <strong>{isNe ? 'कुनै सार्वजनिक सूची छैन' : 'No Public Complaint Directory'}</strong>
                      <p>
                        {isNe
                          ? 'उजुरीहरू बाहिरी आगन्तुकहरूका लागि उपलब्ध हुँदैनन्।'
                          : 'Grievances are never listed in open public feeds.'}
                      </p>
                    </div>
                  </div>

                  <div className="privacy-pillar-item">
                    <ShieldCheck size={16} color="#5278C8" />
                    <div>
                      <strong>{isNe ? 'प्रमाणीकृत पहुँच नियन्त्रण' : 'Role & Ownership Enforcement'}</strong>
                      <p>
                        {isNe
                          ? 'केवल आफ्ना उजुरी मात्र हेर्न मिल्ने कडा सुरक्षा।'
                          : 'Strict ownership checks ensure only you see your data.'}
                      </p>
                    </div>
                  </div>

                  <div className="privacy-pillar-item">
                    <UserCheck size={16} color="#5278C8" />
                    <div>
                      <strong>{isNe ? 'प्रत्यक्ष कलेज खटन' : 'Direct Campus Triage'}</strong>
                      <p>
                        {isNe
                          ? 'कलेज प्रशासन तथा सम्बन्धित डेस्कद्वारा प्रत्यक्ष सम्बोधन।'
                          : 'Handled directly by authorized college desk administration.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: FREQUENTLY ASKED QUESTIONS (Smooth Height Accordion)
            ========================================================================= */}
        <section id="faqs" className="home-faq-section">
          <div className="container">
            <Reveal>
              <div className="section-heading-block">
                <span className="section-subheading">
                  {isNe ? 'सहयोग तथा जानकारी' : 'HELP & COMMON INQUIRIES'}
                </span>
                <h2 className="section-main-heading">
                  {isNe ? 'बारम्बार सोधिने प्रश्नहरू' : 'Frequently Asked Questions'}
                </h2>
                <p className="section-lead-copy">
                  {isNe
                    ? 'उजुरी दर्ता, विद्यार्थी खाता, तथा समाधान प्रक्रिया सम्बन्धी मुख्य प्रश्नहरू र जवाफ:'
                    : 'Clear answers regarding student accounts, complaint submission, dashboard tracking, and resolution:'}
                </p>
              </div>
            </Reveal>

            <div className="faq-accordion-container">
              {faqItems.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className={`faq-accordion-card ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-question-text">{faq.q}</span>
                      <m.span
                        className="faq-toggle-icon"
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.22, ease: MOTION_EASE }}
                      >
                        <ChevronDown size={18} />
                      </m.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <m.div
                          className="faq-answer-panel"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.26, ease: MOTION_EASE }}
                        >
                          <p>{faq.a}</p>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: CAMPUS HELPDESK & DIRECT CONTACT (Animated Gradient CTA Banner)
            ========================================================================= */}
        <section id="contact" className="home-contact-section">
          <div className="container">
            <Reveal>
              <div className="contact-banner-box animated-cta-gradient">
                <div className="contact-banner-header">
                  <span className="section-subheading">{isNe ? 'सिधै सम्पर्क' : 'ASSISTANCE'}</span>
                  <h2 className="contact-main-title">
                    {COLLEGE_CONFIG.name} — {isNe ? 'सम्पर्क डेस्क' : 'Campus Support Desk'}
                  </h2>
                  <p className="contact-main-desc">
                    {isNe
                      ? 'अति जरुरी ल्याब समस्या, नेटवर्क डाउन वा खाता सहयोगका लागि कलेज प्रशासनमा सम्पर्क गर्नुहोस्:'
                      : 'For urgent lab workstation hardware issues or account assistance, reach out to the campus desk directly:'}
                  </p>
                </div>

                <div className="contact-cards-grid">
                  {/* Telephone */}
                  <div className="contact-info-card">
                    <div className="contact-icon-bubble">
                      <Phone size={20} />
                    </div>
                    <div className="contact-card-body">
                      <span className="contact-card-label">{isNe ? 'कलेज फोन' : 'Direct Telephone'}</span>
                      <a href={`tel:${COLLEGE_CONFIG.contact.phone}`} className="contact-card-val">
                        {COLLEGE_CONFIG.contact.phone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="contact-info-card">
                    <div className="contact-icon-bubble">
                      <Mail size={20} />
                    </div>
                    <div className="contact-card-body">
                      <span className="contact-card-label">{isNe ? 'इमेल सम्पर्क' : 'Campus IT Email'}</span>
                      <a href={`mailto:${COLLEGE_CONFIG.contact.email}`} className="contact-card-val">
                        {COLLEGE_CONFIG.contact.email}
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="contact-info-card">
                    <div className="contact-icon-bubble">
                      <MapPin size={20} />
                    </div>
                    <div className="contact-card-body">
                      <span className="contact-card-label">{isNe ? 'कलेज ठेगाना' : 'Campus Location'}</span>
                      <span className="contact-card-val-text">
                        {COLLEGE_CONFIG.contact.campusAddress}
                      </span>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="contact-info-card">
                    <div className="contact-icon-bubble">
                      <Clock size={20} />
                    </div>
                    <div className="contact-card-body">
                      <span className="contact-card-label">{isNe ? 'कार्यालय समय' : 'Operating Hours'}</span>
                      <span className="contact-card-val-text">
                        {isNe ? COLLEGE_CONFIG.contact.officeHoursNe : COLLEGE_CONFIG.contact.officeHours}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Call to Action with Periodic Attention Pulse (Every 8s) */}
                <div className="contact-banner-footer">
                  <div className="contact-footer-text">
                    <Wrench size={16} color="#5278C8" />
                    <span>
                      {isNe
                        ? 'नयाँ समस्या दर्ता गर्न तयार हुनुहुन्छ?'
                        : 'Ready to report an IT problem?'}
                    </span>
                  </div>
                  <Link to="/submit" className="btn btn-primary btn-md cta-pulse-button">
                    <PlusCircle size={15} />
                    <span>{isNe ? 'उजुरी फारम खोल्नुहोस्' : 'Open Complaint Form'}</span>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Floating Accessible "Back to Top" Action with Smooth Scale Entrance */}
      <AnimatePresence>
        {showBackToTop && (
          <m.button
            type="button"
            className="back-to-top-btn visible"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label={isNe ? 'माथि स्क्रोल गर्नुहोस्' : 'Scroll back to top'}
            title={isNe ? 'माथि स्क्रोल गर्नुहोस्' : 'Back to top'}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.22, ease: MOTION_EASE }}
          >
            <ArrowUp size={18} />
          </m.button>
        )}
      </AnimatePresence>

      {/* Redesigned Motion Footer */}
      <Footer />
    </div>
  );
}

export default LandingPage;
