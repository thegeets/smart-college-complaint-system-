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
  KeyRound,
  UserCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
  Wrench
} from 'lucide-react';

export function LandingPage() {
  const { language } = useApp();
  const navigate = useNavigate();
  const isNe = language === 'ne';

  // Quick Tracking input state
  const [quickReference, setQuickReference] = useState('');

  // FAQ Accordion State (Index of currently opened question)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const handleQuickTrackSubmit = (e) => {
    e.preventDefault();
    if (quickReference.trim()) {
      navigate(`/track?ref=${encodeURIComponent(quickReference.trim().toUpperCase())}`);
    } else {
      navigate('/track');
    }
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

  // FAQ Items
  const faqItems = [
    {
      q: isNe 
        ? 'के उजुरी दर्ता गर्न विद्यार्थी खाता वा लगइन आवश्यक पर्छ?' 
        : 'Do I need to create a student account or log in to submit a complaint?',
      a: isNe
        ? 'पर्दैन। सोच कलेज अफ आईटी, पोखराका सम्पूर्ण विद्यार्थीहरूले कुनै पनि खाता वा पासवर्ड नबनाई सिधै उजुरी दर्ता गर्न सक्छन्। दर्ता गरेपछि प्रणालीले एक अद्वितीय सन्दर्भ कोड (Reference ID) र गोप्य ट्र्याकिङ कोड (Tracking Secret) तुरुन्तै प्रदान गर्दछ।'
        : 'No. To ensure maximum accessibility and privacy, students do not need accounts. You can lodge an issue immediately without logging in. Upon successful submission, you will receive a unique Reference ID and Private Tracking Secret.',
    },
    {
      q: isNe 
        ? 'उजुरीको स्थिति कसरी जाँच गर्न सकिन्छ?' 
        : 'How do I check the live status of my complaint and read college responses?',
      a: isNe
        ? 'गृहपृष्ठ वा मेनुबाट "गुनासोको अवस्था" पृष्ठमा जानुहोस्। त्यहाँ उजुरी दर्ता गर्दा प्राप्त भएको Complaint Reference ID र Private Tracking Secret प्रविष्ट गर्नुहोस्। तपाईंले कार्यप्रगति (Submitted, Under Review, In Progress, Resolved) र कलेजको आधिकारिक जवाफ हेर्न सक्नुहुन्छ।'
        : 'Visit the "Track Complaint" page from the navigation bar. Enter both your Complaint Reference ID and Private Tracking Secret. You will see real-time stage transitions and official college responses.',
    },
    {
      q: isNe 
        ? 'यदि मैले मेरो गोप्य ट्र्याकिङ कोड (Tracking Secret) हराएँ भने के गर्ने?' 
        : 'What should I do if I misplace my Private Tracking Secret?',
      a: isNe
        ? 'विद्यार्थीहरूको गोपनीयता सुरक्षाका लागि ट्र्याकिङ कोड केवल दर्ता गर्दा एक पटक मात्र देखाइन्छ। यदि कोड हराएमा, कलेज प्रशासनलाई info@sochcollege.edu.np मा आफ्नो विद्यार्थी परिचयपत्र र उजुरीको विवरणसहित सम्पर्क गर्नुहोस्।'
        : 'For student confidentiality, tracking secrets are hashed on the server and shown strictly once upon submission. If lost, self-service automated recovery is not available in this phase; please contact the campus desk at info@sochcollege.edu.np with your student details.',
    },
    {
      q: isNe 
        ? 'के अन्य विद्यार्थीहरूले मेरो उजुरी वा व्यक्तिगत विवरण हेर्न सक्छन्?' 
        : 'Can other students or public visitors view my grievance?',
      a: isNe
        ? 'सक्दैनन्। यस प्रणालीमा उजुरीहरूको कुनै सार्वजनिक सूची वा खोजी योग्य निर्देशिका हुँदैन। Reference ID र गोप्य Tracking Secret दुवै भएको व्यक्तिले मात्र सम्बन्धित उजुरी हेर्न सक्छ।'
        : 'Strictly no. There is no public list or open directory of student complaints. A complaint can only be viewed by submitting both the matching Reference ID and private tracking secret in an encrypted POST request.',
    },
    {
      q: isNe 
        ? 'के म समस्याको तस्बिर वा त्रुटि लग संलग्न गर्न सक्छु?' 
        : 'What file formats can I attach with my complaint as proof?',
      a: isNe
        ? 'सकिन्छ। तपाईंले ५ MB सम्मको अधिकतम १ फाइल (JPG, PNG वा PDF) संलग्न गर्न सक्नुहुन्छ। प्रणालीले फाइलको वास्तविक बाइनरी ढाँचा स्वचालित रूपमा प्रमाणीकरण गर्छ।'
        : 'Yes. You can upload 1 optional file attachment up to 5 MB in JPG, PNG, or PDF format. Binary signatures are verified on the server to reject disguised executables or scripts.',
    },
    {
      q: isNe 
        ? 'दर्ता भएका उजुरीहरू कसले समीक्षा र समाधान गर्छन्?' 
        : 'Who inspects and resolves the reported campus IT issues?',
      a: isNe
        ? 'उजुरीहरू सोध कलेज अफ आईटीको केन्द्रीय आईटी डेस्क र सम्बन्धित ल्याब सहायक/प्राविधिकहरूद्वारा सिधै समीक्षा गरिन्छ र प्राथमिकताका आधारमा मर्मत सम्पन्न गरिन्छ।'
        : 'Grievance complaints are triaged directly by authorized Soch College of IT laboratory administrators and network technicians, with oversight from the department coordinator.',
    },
  ];

  return (
    <div className="landing-page-wrapper">
      {/* Header Bar */}
      <PublicNavbar />

      {/* =========================================================================
          HERO SECTION — Two Column Master Layout
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
                  ? 'सोच कलेज अफ आईटी, पोखरा — गुनासो व्यवस्थापन प्रणाली' 
                  : 'Soch College of IT, Pokhara — Complaint Management System'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-main-title">
              {isNe ? (
                <>
                  क्याम्पस प्रविधि तथा ल्याब समस्याहरूको <span className="text-teal-highlight">भरपर्दो समाधान।</span>
                </>
              ) : (
                <>
                  Transparent, Accountable Resolution for <span className="text-teal-highlight">Campus IT & Labs.</span>
                </>
              )}
            </h1>

            {/* Supporting Copy */}
            <p className="hero-lead-description">
              {isNe 
                ? 'कम्प्युटर ल्याब, क्याम्पस वाइफाइ, कम्पाइलर तथा कक्षाकोठा सम्बन्धी समस्याहरू कुनै खाता नबनाई सिधै दर्ता गर्नुहोस्। प्राप्त हुने गोप्य ट्र्याकिङ कोड मार्फत वास्तविक समाधान प्रगति अनुगमन गर्नुहोस्।'
                : 'Report computer lab workstation faults, campus Wi-Fi drops, programming compiler errors, or classroom projectors directly without creating an account. Follow real-time college updates with your private tracking secret.'}
            </p>

            {/* Action Buttons */}
            <div className="hero-action-cluster">
              <Link to="/submit" className="btn btn-primary btn-lg hero-btn-primary">
                <PlusCircle size={18} />
                <span>{isNe ? 'उजुरी दर्ता गर्नुहोस्' : 'Submit a Complaint'}</span>
                <ArrowRight size={16} style={{ marginLeft: '4px' }} />
              </Link>

              <Link to="/track" className="btn btn-secondary btn-lg hero-btn-secondary">
                <Search size={17} />
                <span>{isNe ? 'गुनासोको अवस्था' : 'Track Complaint'}</span>
              </Link>
            </div>

            {/* Quick Reassurance Features */}
            <div className="hero-features-strip">
              <div className="hero-feature-pill">
                <CheckCircle2 size={14} color="#0F766E" />
                <span>{isNe ? 'विद्यार्थी लगइन आवश्यक पर्दैन' : 'No Student Account Required'}</span>
              </div>
              <div className="hero-feature-pill">
                <Lock size={13} color="#0F766E" />
                <span>{isNe ? 'गोप्य ट्र्याकिङ कोड' : 'Private Tracking Secret'}</span>
              </div>
              <div className="hero-feature-pill">
                <UserCheck size={14} color="#0F766E" />
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
          SECTION 1: QUICK ACTION GATEWAYS (Submit vs Track)
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
                  <h3 className="gateway-title">{isNe ? 'नयाँ उजुरी दर्ता गर्नुहोस्' : 'Submit a New Complaint'}</h3>
                </div>
              </div>
              <p className="gateway-desc">
                {isNe
                  ? 'ल्याब नम्बर, कम्प्युटर आइडी, र समस्याको विवरण लेख्नुहोस्। आवश्यक भएमा ५ MB सम्मको तस्बिर वा त्रुटि लग संलग्न गर्न सक्नुहुन्छ।'
                  : 'Report broken lab hardware, compiler path errors, slow campus network, or projector defects with optional screenshot proof.'}
              </p>
              <div className="gateway-meta-list">
                <span>✓ {isNe ? 'विद्यार्थी दर्ता गर्नुपर्दैन' : 'No registration required'}</span>
                <span>✓ {isNe ? 'क्याम्पस प्राविधिक क्षेत्र मात्र' : 'Campus IT focused categories'}</span>
              </div>
              <Link to="/submit" className="btn btn-primary btn-md gateway-btn">
                <span>{isNe ? 'फारम खोल्नुहोस्' : 'Open Complaint Form'}</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Gateway Card 2: Track */}
            <div className="gateway-card gateway-card-track">
              <div className="gateway-card-header">
                <div className="gateway-icon-wrap icon-track">
                  <Search size={22} />
                </div>
                <div>
                  <span className="gateway-eyebrow">{isNe ? 'प्रगति अनुगमन' : 'LIVE STATUS'}</span>
                  <h3 className="gateway-title">{isNe ? 'गुनासोको अवस्था' : 'Track an Existing Complaint'}</h3>
                </div>
              </div>
              <p className="gateway-desc">
                {isNe
                  ? 'दर्ता गर्दा प्राप्त भएको Reference ID र Private Tracking Secret प्रयोग गरी वास्तविक स्थिति र कलेजको जवाफ हेर्नुहोस्।'
                  : 'Enter your Reference ID and private tracking secret to check real-time complaint status and documented college responses.'}
              </p>
              <form onSubmit={handleQuickTrackSubmit} className="quick-track-inline-form">
                <input
                  type="text"
                  placeholder={isNe ? "जस्तै: CMP-2026-A8F2K" : "e.g. CMP-2026-A8F2K"}
                  value={quickReference}
                  onChange={(e) => setQuickReference(e.target.value)}
                  className="quick-track-input"
                  aria-label="Complaint Reference ID"
                />
                <button type="submit" className="btn btn-secondary btn-md quick-track-btn">
                  <span>{isNe ? 'ट्र्याक' : 'Track'}</span>
                  <Search size={14} />
                </button>
              </form>
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
                ? 'उजुरी दर्तादेखि कलेजको आधिकारिक समाधानसम्मका स्पष्ट चरणहरू:'
                : 'From initial complaint registration to verified technical resolution and official college response:'}
            </p>
          </div>

          <div className="process-steps-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            
            {/* Step 1 */}
            <div className="process-step-card">
              <div className="step-num-badge">1</div>
              <div className="step-icon-wrap">
                <FileText size={20} color="#15365B" />
              </div>
              <h3 className="step-title">{isNe ? '१. समस्याको विवरण दिनुहोस्' : '1. Submit Details'}</h3>
              <p className="step-desc">
                {isNe
                  ? 'सम्बन्धित आईटी विधा छनोट गर्नुहोस्, ल्याब वा कक्षाकोठा नम्बर उल्लेख गर्नुहोस् र समस्याको लक्षण खुलाउनुहोस्।'
                  : 'Select an IT category, specify the lab room or campus location, and attach an optional screenshot or error log.'}
              </p>
              <div className="step-highlight-tag">
                <span>{isNe ? 'कुनै लगइन आवश्यक पर्दैन' : 'No Account Required'}</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="process-step-card">
              <div className="step-num-badge">2</div>
              <div className="step-icon-wrap">
                <KeyRound size={20} color="#0D8178" />
              </div>
              <h3 className="step-title">{isNe ? '२. ट्र्याकिङ कोड सुरक्षित गर्नुहोस्' : '2. Save Credentials'}</h3>
              <p className="step-desc">
                {isNe
                  ? 'प्रणालीले स्वचालित रूपमा एक Reference ID र गोप्य Tracking Secret उत्पन्न गर्दछ। यसलाई सुरक्षित राख्नुहोस्।'
                  : 'The portal generates a unique Reference ID and private Tracking Secret shown strictly once upon submission.'}
              </p>
              <div className="step-highlight-tag">
                <span>{isNe ? 'सुरक्षित ह्यास व्यवस्थापन' : 'Argon2id Hashed Secret'}</span>
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
                  ? 'कलेज आईटी प्राविधिकहरूले उजुरी समीक्षा गरी कार्यभार खटाउँछन् र मर्मत कार्य अघि बढाउँछन्।'
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
              <h3 className="step-title">{isNe ? '४. समाधान र आधिकारिक जवाफ' : '4. Verified Resolution'}</h3>
              <p className="step-desc">
                {isNe
                  ? 'मर्मत सम्पन्न भएपछि कलेज प्रशासनले आधिकारिक जवाफ र समाधान मिति रेकर्ड गरी उजुरी बन्द गर्छ।'
                  : 'Upon completion, college administration records an official documented response and marks the docket resolved.'}
              </p>
              <div className="step-highlight-tag">
                <span>{isNe ? 'कलेजको आधिकारिक जवाफ' : 'Official College Response'}</span>
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
                <span className="privacy-badge">{isNe ? 'सुरक्षा तथा गोपनीयता' : 'CONFIDENTIALITY GUARANTEE'}</span>
                <h2 className="privacy-title">
                  {isNe ? 'विद्यार्थीको व्यक्तिगत गोपनीयता पूर्ण रूपमा सुरक्षित' : 'Student Privacy by Architecture'}
                </h2>
                <p className="privacy-text">
                  {isNe
                    ? 'हाम्रो प्रणालीमा उजुरीहरूको कुनै सार्वजनिक सूचीकरण हुँदैन। विद्यार्थी परिचयपत्र र नाम केवल कलेज प्रशासनद्वारा समस्याको वास्तविकता जाँच गर्न प्रयोग गरिन्छ र गोप्य ट्र्याकिङ कोड बिना कसैले पनि उजुरी हेर्न सक्दैन।'
                    : 'Complaints cannot be browsed publicly or queried by student roll number alone. Your student ID is strictly used for internal administrative triage. Only holders of the private tracking secret can inspect complaint progress.'}
                </p>
              </div>
            </div>

            <div className="privacy-pillars-list">
              <div className="privacy-pillar-item">
                <Lock size={16} color="#0F766E" />
                <div>
                  <strong>{isNe ? 'कुनै सार्वजनिक सूची छैन' : 'No Public Complaint Directory'}</strong>
                  <p>{isNe ? 'उजुरीहरू बाहिरी आगन्तुकहरूका लागि उपलब्ध हुँदैनन्।' : 'Grievances are never listed in open public feeds.'}</p>
                </div>
              </div>

              <div className="privacy-pillar-item">
                <KeyRound size={16} color="#0F766E" />
                <div>
                  <strong>{isNe ? 'गोप्य टोकन सुरक्षा' : 'Two-Factor Access Control'}</strong>
                  <p>{isNe ? 'Reference ID र Tracking Secret दुवै अनिवार्य हुन्छ।' : 'Requires both Reference ID and private secret via POST.'}</p>
                </div>
              </div>

              <div className="privacy-pillar-item">
                <UserCheck size={16} color="#0F766E" />
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
                ? 'उजुरी दर्ता, ट्र्याकिङ, तथा समाधान प्रक्रिया सम्बन्धी मुख्य प्रश्नहरू र जवाफ:'
                : 'Clear answers regarding grievance submission, tracking, and college resolution:'}
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
                  ? 'अति जरुरी ल्याब समस्या, नेटवर्क डाउन वा हराएको ट्र्याकिङ कोडका लागि कलेज प्रशासनमा सम्पर्क गर्नुहोस्:'
                  : 'For urgent lab workstation hardware issues or lost tracking codes, reach out to the campus desk directly:'}
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
                <Sparkles size={16} color="#0F766E" />
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
