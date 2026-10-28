import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { HeroVisual } from '../components/HeroVisual';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
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
  ChevronUp,
  MapPin,
  Sparkles,
  Wrench,
  LogIn,
  UserPlus
} from 'lucide-react';

export function LandingPage() {
  const { language, isStudentLoggedIn, studentUser } = useApp();
  const navigate = useNavigate();
  const isNe = language === 'ne';

  // FAQ Accordion State (Index of currently opened question)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  // 6 Authorized IT Categories with tailored icons and descriptions
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

  // FAQ Items tailored to mandatory student authentication & dashboard
  const faqItems = [
    {
      q: isNe 
        ? 'के उजुरी दर्ता र ट्र्याक गर्न विद्यार्थी खाता आवश्यक पर्छ?' 
        : 'Do I need a student account to submit or track a complaint?',
      a: isNe
        ? 'हो। जवाफदेहिता, सुरक्षित ड्यासबोर्ड अनुगमन र आधिकारिक सूचना आदानप्रदानका लागि विद्यार्थीहरूले आफ्नो विद्यार्थी परिचयपत्र र इमेल मार्फत दर्ता गर्नुपर्दछ। दर्ता गरेपछि इमेल स्वामित्व पुष्टि गरी उजुरी दर्ता तथा "मेरो उजुरीहरू" ड्यासबोर्डबाट अनुगमन गर्न सकिन्छ।'
        : 'Yes. To ensure accountability, reliable progress tracking, and authenticated privacy, students must register with their name, student ID, and semester. Email verification is required before lodging complaints or accessing personal history.',
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

  return (
    <div className="landing-page-wrapper">
      {/* Header Bar */}
      <PublicNavbar />

      {/* =========================================================================
          HERO SECTION — Balanced Two Column Layout
          ========================================================================= */}
      <section className="hero-master-section">
        <div className="hero-master-container">
          
          {/* Left Column: Institutional Value, Headline, Copy, Action Cluster */}
          <div className="hero-content-column">
            
            {/* Trust Eyebrow Tag */}
            <div className="hero-trust-tag">
              <ShieldCheck size={14} className="hero-trust-icon" />
              <span>
                {isNe 
                  ? 'सोच कलेज अफ आईटी, पोखरा — विद्यार्थी आईटी पोर्टल' 
                  : 'Soch College of IT, Pokhara — Student IT Portal'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-main-title">
              {isNe ? (
                <>
                  क्याम्पस आईटी समस्याहरू दर्ता गर्नुहोस् र आफ्नो <span className="text-teal-highlight">विद्यार्थी ड्यासबोर्डबाट</span> प्रगति हेर्नुहोस्।
                </>
              ) : (
                <>
                  Report campus IT issues and follow updates from your <span className="text-teal-highlight">student dashboard.</span>
                </>
              )}
            </h1>

            {/* Supporting Copy */}
            <p className="hero-lead-description">
              {isNe 
                ? 'कम्प्युटर ल्याब, वाइफाइ, प्रोजेक्टर तथा अन्य क्याम्पस आईटी समस्याहरू दर्ता गर्न लगइन गर्नुहोस्। प्रगति र आधिकारिक जवाफहरू एकै ठाउँमा हेर्नुहोस्।'
                : 'Sign in to report computer lab, Wi-Fi, projector, and other campus IT issues. View progress and replies in one place.'}
            </p>

            {/* Action Buttons */}
            <div className="hero-action-cluster">
              <Link to="/submit" className="btn btn-primary btn-lg hero-btn-primary">
                <PlusCircle size={18} />
                <span>{isNe ? 'उजुरी दर्ता गर्नुहोस्' : 'Submit a Complaint'}</span>
                <ArrowRight size={16} style={{ marginLeft: '4px' }} />
              </Link>

              {isStudentLoggedIn ? (
                <Link to="/student/complaints" className="btn btn-secondary btn-lg hero-btn-secondary">
                  <FileText size={17} />
                  <span>{isNe ? 'मेरो उजुरीहरू' : 'My Complaints'}</span>
                </Link>
              ) : (
                <Link to="/login?redirect=/student/complaints" className="btn btn-secondary btn-lg hero-btn-secondary">
                  <LogIn size={17} />
                  <span>{isNe ? 'उजुरी ट्र्याक गर्न लगइन' : 'Login to Track Complaints'}</span>
                </Link>
              )}
            </div>

            {/* Quick Reassurance Features */}
            <div className="hero-features-strip">
              <div className="hero-feature-pill">
                <UserCheck size={14} color="#0D8178" />
                <span>{isNe ? 'विद्यार्थी खाता आवश्यक' : 'Student Account Required'}</span>
              </div>
              <div className="hero-feature-pill">
                <CheckCircle2 size={14} color="#0D8178" />
                <span>{isNe ? 'ड्यासबोर्डमा उजुरी ट्र्याकिङ' : 'Track Complaints in Your Dashboard'}</span>
              </div>
              <div className="hero-feature-pill">
                <ShieldCheck size={14} color="#0D8178" />
                <span>{isNe ? 'कलेज प्रशासनद्वारा प्रत्यक्ष समीक्षा' : 'Direct Campus Desk Review'}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Live Grievance Tracking Interactive Preview Console */}
          <div className="hero-visual-column">
            <HeroVisual />
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 1: QUICK ACTION GATEWAYS (Submit vs My Complaints Dashboard)
          ========================================================================= */}
      <section className="home-quick-gateways-section">
        <div className="container">
          <div className="gateways-grid">
            
            {/* Gateway Card 1: Submit */}
            <div className="gateway-card gateway-card-submit">
              <div className="gateway-card-header">
                <div className="gateway-icon-wrap icon-submit">
                  <PlusCircle size={22} />
                </div>
                <div>
                  <span className="gateway-eyebrow">{isNe ? 'नयाँ समस्या' : 'LODGE GRIEVANCE'}</span>
                  <h3 className="gateway-title">{isNe ? 'नयाँ उजुरी दर्ता गर्नुहोस्' : 'Submit a Complaint'}</h3>
                </div>
              </div>
              <p className="gateway-desc">
                {isNe
                  ? 'ल्याब नम्बर, कम्प्युटर आइडी, र समस्याको विवरण लेख्नुहोस्। आवश्यक भएमा ५ MB सम्मको तस्बिर वा त्रुटि प्रमाण संलग्न गर्नुहोस्।'
                  : 'Report broken lab hardware, compiler path errors, slow campus network, or projector defects with optional screenshot proof.'}
              </p>
              <div className="gateway-meta-list">
                <span>✓ {isNe ? 'विद्यार्थी खाता आवश्यक' : 'Student account required'}</span>
                <span>✓ {isNe ? 'क्याम्पस प्राविधिक क्षेत्र मात्र' : 'Campus IT focused categories'}</span>
              </div>
              <Link to="/submit" className="btn btn-primary btn-md gateway-btn">
                <span>{isNe ? 'उजुरी फारम खोल्नुहोस्' : 'Open Complaint Form'}</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Gateway Card 2: Track Complaints in Your Dashboard */}
            <div className="gateway-card gateway-card-track">
              <div className="gateway-card-header">
                <div className="gateway-icon-wrap icon-track">
                  <FileText size={22} />
                </div>
                <div>
                  <span className="gateway-eyebrow">{isNe ? 'विद्यार्थी पोर्टल' : 'STUDENT PORTAL'}</span>
                  <h3 className="gateway-title">{isNe ? 'मेरो उजुरीहरू ड्यासबोर्ड' : 'Track in Your Dashboard'}</h3>
                </div>
              </div>
              <p className="gateway-desc">
                {isNe
                  ? 'आफ्नो विद्यार्थी खाताबाट दर्ता गरिएका सम्पूर्ण उजुरीहरूको वास्तविक समयमा प्रगति र कलेजको जवाफ हेर्नुहोस्।'
                  : 'Sign in with your verified student account to inspect active stages, college replies, and your full complaint history.'}
              </p>
              
              {isStudentLoggedIn ? (
                <div>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(13, 129, 120, 0.08)',
                    border: '1px solid rgba(13, 129, 120, 0.2)',
                    fontSize: '0.8125rem',
                    color: '#0D8178',
                    fontWeight: '600',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <UserCheck size={14} />
                    <span>
                      {isNe ? `लगइन गरिएको: ${studentUser?.name || 'विद्यार्थी'}` : `Logged in as: ${studentUser?.name || 'Student'}`}
                    </span>
                  </div>
                  <Link to="/student/complaints" className="btn btn-secondary btn-md gateway-btn">
                    <span>{isNe ? 'मेरो उजुरीहरू हेर्नुहोस्' : 'View My Complaints'}</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link to="/login?redirect=/student/complaints" className="btn btn-secondary btn-md gateway-btn">
                    <LogIn size={15} />
                    <span>{isNe ? 'उजुरी ट्र्याक गर्न लगइन' : 'Login to Track Complaints'}</span>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', paddingTop: '4px' }}>
                    <span>{isNe ? 'खाता छैन?' : "New student?"}</span>
                    <Link to="/register" style={{ color: '#0D8178', fontWeight: '600', textDecoration: 'none' }}>
                      {isNe ? 'विद्यार्थी दर्ता गर्नुहोस्' : 'Create Student Account →'}
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: AUTHORIZED IT CATEGORIES
          ========================================================================= */}
      <section id="categories" className="home-categories-section">
        <div className="container">
          
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

          <div className="categories-rich-grid">
            {categoryDetails.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="category-rich-card">
                  <div className="category-card-top">
                    <div className="category-icon-box">
                      <Icon size={20} />
                    </div>
                    <span className="category-index-badge">0{idx + 1}</span>
                  </div>

                  <h3 className="category-card-title">{cat.title}</h3>
                  <p className="category-card-desc">{cat.desc}</p>

                  <div className="category-examples-box">
                    <span className="examples-label">{isNe ? 'उदाहरणहरू:' : 'Common Reports:'}</span>
                    <ul className="examples-list">
                      {cat.examples.map((ex, i) => (
                        <li key={i}>{ex}</li>
                      ))}
                    </ul>
                  </div>

                  <Link 
                    to={`/submit?category=${encodeURIComponent(cat.key)}`} 
                    className="category-action-link"
                    title={`Submit grievance for ${cat.title}`}
                  >
                    <span>{isNe ? 'यस विधामा उजुरी दिनुहोस्' : 'Report this issue'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: FOUR-STEP RESOLUTION PROCESS ("HOW IT WORKS")
          ========================================================================= */}
      <section id="process" className="home-process-section">
        <div className="container">
          
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

          <div className="process-steps-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            
            {/* Step 1 */}
            <div className="process-step-card">
              <div className="step-num-badge">1</div>
              <div className="step-icon-wrap">
                <UserCheck size={20} color="#15365B" />
              </div>
              <h3 className="step-title">{isNe ? '१. दर्ता र इमेल पुष्टि' : '1. Register & Verify'}</h3>
              <p className="step-desc">
                {isNe
                  ? 'आफ्नो विद्यार्थी परिचयपत्र, सेमेस्टर, र इमेल मार्फत खाता बनाउनुहोस्। इमेलमा प्राप्त कोडबाट इमेल स्वामित्व पुष्टि गर्नुहोस्।'
                  : 'Create your student account with your Student ID, semester, and email. Confirm email ownership via verification code.'}
              </p>
              <div className="step-highlight-tag">
                <span>{isNe ? 'विद्यार्थी खाता आवश्यक' : 'Student Account Required'}</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="process-step-card">
              <div className="step-num-badge">2</div>
              <div className="step-icon-wrap">
                <FileText size={20} color="#0D8178" />
              </div>
              <h3 className="step-title">{isNe ? '२. उजुरी दर्ता गर्नुहोस्' : '2. Submit Complaint'}</h3>
              <p className="step-desc">
                {isNe
                  ? 'सम्बन्धित आईटी विधा छनोट गर्नुहोस्, ल्याब वा कक्षाकोठा नम्बर उल्लेख गर्नुहोस् र समस्याको विवरणसहित प्रमाण संलग्न गर्नुहोस्।'
                  : 'Select the IT category, specify the lab room or PC number, describe the symptoms, and upload optional screenshot proof.'}
              </p>
              <div className="step-highlight-tag">
                <span>{isNe ? 'प्रमाणीकृत उजुरी दर्ता' : 'Authenticated Submission'}</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="process-step-card">
              <div className="step-num-badge">3</div>
              <div className="step-icon-wrap">
                <Wrench size={20} color="#15365B" />
              </div>
              <h3 className="step-title">{isNe ? '३. प्राविधिक समीक्षा तथा मर्मत' : '3. Desk Triage & Repair'}</h3>
              <p className="step-desc">
                {isNe
                  ? 'कलेज आईटी प्राविधिकहरूले उजुरी समीक्षा गरी कार्यभार खटाउँछन् र क्याम्पसमै मर्मत कार्य अघि बढाउँछन्।'
                  : 'Soch College IT technicians triage reported hardware, network, or tools and initiate active on-campus repairs.'}
              </p>
              <div className="step-highlight-tag">
                <span>{isNe ? 'सक्रिय मर्मत कार्य' : 'Active IT Triage'}</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="process-step-card">
              <div className="step-num-badge">4</div>
              <div className="step-icon-wrap">
                <CheckCircle2 size={20} color="#15803D" />
              </div>
              <h3 className="step-title">{isNe ? '४. ड्यासबोर्डमा प्रत्यक्ष अपडेट' : '4. Dashboard Resolution'}</h3>
              <p className="step-desc">
                {isNe
                  ? 'मर्मत सम्पन्न भएपछि कलेज प्रशासनले आधिकारिक जवाफ रेकर्ड गर्छ। तपाईंको ड्यासबोर्डमा स्थिति अद्यावधिक हुन्छ।'
                  : 'Follow real-time status transitions and read documented staff replies directly in your personal student dashboard.'}
              </p>
              <div className="step-highlight-tag">
                <span>{isNe ? 'मेरो उजुरी ड्यासबोर्ड' : 'My Complaints Dashboard'}</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: STUDENT PRIVACY & DATA CONFIDENTIALITY
          ========================================================================= */}
      <section id="privacy" className="home-privacy-section">
        <div className="container">
          <div className="privacy-card-banner">
            
            <div className="privacy-banner-left">
              <div className="privacy-shield-icon-wrap">
                <ShieldCheck size={32} />
              </div>
              <div>
                <span className="privacy-badge">{isNe ? 'सुरक्षा तथा गोपनीयता' : 'CONFIDENTIALITY & ACCESS'}</span>
                <h2 className="privacy-title">
                  {isNe ? 'विद्यार्थीको व्यक्तिगत उजुरी पूर्ण रूपमा सुरक्षित' : 'Student Privacy by Architecture'}
                </h2>
                <p className="privacy-text">
                  {isNe
                    ? 'हाम्रो प्रणालीमा उजुरीहरूको कुनै सार्वजनिक निर्देशिका हुँदैन। प्रत्येक विद्यार्थीको उजुरी, संलग्न प्रमाण, र प्राविधिक जवाफ केवल सम्बन्धित विद्यार्थी र कलेज आईटी प्रशासनले मात्र हेर्न सक्छन्।'
                    : 'Complaints cannot be browsed publicly or accessed across accounts. Your student ID is strictly used for campus IT triage, and ownership checks enforce that only you can access your complaint details, attachments, and replies.'}
                </p>
              </div>
            </div>

            <div className="privacy-pillars-list">
              <div className="privacy-pillar-item">
                <Lock size={16} color="#0D8178" />
                <div>
                  <strong>{isNe ? 'कुनै सार्वजनिक सूची छैन' : 'No Public Complaint Directory'}</strong>
                  <p>{isNe ? 'उजुरीहरू बाहिरी आगन्तुकहरूका लागि उपलब्ध हुँदैनन्।' : 'Grievances are never listed in open public feeds.'}</p>
                </div>
              </div>

              <div className="privacy-pillar-item">
                <ShieldCheck size={16} color="#0D8178" />
                <div>
                  <strong>{isNe ? 'प्रमाणीकृत पहुँच नियन्त्रण' : 'Role & Ownership Enforcement'}</strong>
                  <p>{isNe ? 'केवल आफ्ना उजुरी मात्र हेर्न मिल्ने कडा सुरक्षा।' : 'Strict server-side ownership checks on every request.'}</p>
                </div>
              </div>

              <div className="privacy-pillar-item">
                <UserCheck size={16} color="#0D8178" />
                <div>
                  <strong>{isNe ? 'प्रशासनिक खटन' : 'Direct Campus Triage'}</strong>
                  <p>{isNe ? 'कलेज प्रशासन तथा सम्बन्धित डेस्कद्वारा प्रत्यक्ष सम्बोधन।' : 'Handled directly by authorized college desk administration.'}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FREQUENTLY ASKED QUESTIONS (FAQ Accordion)
          ========================================================================= */}
      <section id="faqs" className="home-faq-section">
        <div className="container">
          
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
                    <span className="faq-toggle-icon">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="faq-answer-panel">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6: CAMPUS HELPDESK & DIRECT CONTACT
          ========================================================================= */}
      <section id="contact" className="home-contact-section">
        <div className="container">
          
          <div className="contact-banner-box">
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

            {/* Bottom Call to Action */}
            <div className="contact-banner-footer">
              <div className="contact-footer-text">
                <Sparkles size={16} color="#0D8178" />
                <span>{isNe ? 'नयाँ समस्या दर्ता गर्न तयार हुनुहुन्छ?' : 'Ready to report an IT problem?'}</span>
              </div>
              <Link to="/submit" className="btn btn-primary btn-md">
                <PlusCircle size={15} />
                <span>{isNe ? 'उजुरी फारम खोल्नुहोस्' : 'Open Complaint Form'}</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Redesigned Footer */}
      <Footer />
    </div>
  );
}

export default LandingPage;
