import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Monitor,
  Wifi,
  Terminal,
  Tv,
  ArrowRight,
  Search
} from 'lucide-react';

export function HeroVisual() {
  const { language } = useApp();
  const isNe = language === 'ne';

  const commonIssues = [
    {
      category: 'Computer Lab / Hardware',
      title: isNe ? 'कम्प्युटर ल्याब तथा हार्डवेयर' : 'Workstations & Lab Hardware',
      desc: isNe ? 'पीसी बुट नहुने, मनिटर वा माउस खराबी' : 'PC boot failure, monitor, keyboard, or RAM issues',
      icon: Monitor,
    },
    {
      category: 'Internet / Wi-Fi / Network',
      title: isNe ? 'इन्टरनेट तथा क्याम्पस वाइफाइ' : 'Wi-Fi & Campus Network',
      desc: isNe ? 'ल्याब कनेक्सन ड्रप, कमजोर वाइफाइ कभरेज' : 'Signal drops, disconnected ports, slow network',
      icon: Wifi,
    },
    {
      category: 'Software / Programming Tools',
      title: isNe ? 'प्रोग्रामिङ सफ्टवेयर तथा टुल्स' : 'Developer Tools & Compilers',
      desc: isNe ? 'GCC, Java, Python, IDE वा लिनक्स समस्या' : 'Compiler toolchain errors, IDE bugs, DB service',
      icon: Terminal,
    },
    {
      category: 'Classroom Technology / Projector',
      title: isNe ? 'कक्षाकोठा प्रोजेक्टर तथा प्रविधि' : 'Classroom Projectors & AV',
      desc: isNe ? 'एचडीएमआई केबल, प्रोजेक्टर फ्लिकर, अडियो' : 'Flickering ceiling display, broken HDMI, audio',
      icon: Tv,
    },
  ];

  return (
    <div className="hero-task-card" aria-label={isNe ? 'द्रुत समस्या रिपोर्ट' : 'Quick IT Report'}>
      <div className="hero-task-header">
        <span className="hero-task-tag">
          {isNe ? 'उजुरी दर्ता विधा छनोट' : 'Select Problem Area'}
        </span>
        <h2 className="hero-task-title">
          {isNe ? 'कस्तो समस्या देखा परेको छ?' : 'What needs technical repair?'}
        </h2>
        <p className="hero-task-subtitle">
          {isNe
            ? 'सम्बन्धित विधा छनोट गरी सिधै उजुरी फारममा जानुहोस्:'
            : 'Select an area to jump straight to the submission form with category pre-filled:'}
        </p>
      </div>

      <div className="hero-task-grid">
        {commonIssues.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.category}
              to={`/submit?category=${encodeURIComponent(item.category)}`}
              className="hero-task-tile"
              title={`Report ${item.title}`}
            >
              <div className="hero-tile-icon-box">
                <Icon size={18} aria-hidden="true" />
              </div>
              <div className="hero-tile-content">
                <div className="hero-tile-title-row">
                  <span className="hero-tile-title">{item.title}</span>
                  <ArrowRight size={14} className="hero-tile-arrow" aria-hidden="true" />
                </div>
                <p className="hero-tile-desc">{item.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="hero-task-footer">
        <Link to="/track" className="hero-task-track-link">
          <Search size={14} aria-hidden="true" />
          <span>{isNe ? 'पहिले दर्ता भएको उजुरी ट्र्याक गर्नुहोस्' : 'Looking to track a previously filed ticket?'}</span>
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export default HeroVisual;
