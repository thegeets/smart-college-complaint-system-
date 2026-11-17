import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Search,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Layers
} from 'lucide-react';

export function HeroVisual() {
  const { language } = useApp();
  const isNe = language === 'ne';

  const stages = [
    {
      num: '01',
      title: isNe ? 'उजुरी दर्ता' : 'Submitted',
      icon: FileText,
      tag: isNe ? 'पहिलो चरण' : 'Stage 1',
      desc: isNe
        ? 'कम्प्युटर ल्याब, वाइफाइ वा सफ्टवेयर समस्या विवरण र ऐच्छिक प्रमाणसहित दर्ता गरिन्छ।'
        : 'Student lodges issue with lab room, workstation ID, description, and screenshot proof.',
    },
    {
      num: '02',
      title: isNe ? 'छानबिन तथा खटन' : 'Under Review',
      icon: Search,
      tag: isNe ? 'दोस्रो चरण' : 'Stage 2',
      desc: isNe
        ? 'कलेज प्राविधिक डेस्कद्वारा समस्याको प्रकृति र प्राथमिकता जाँच गरी प्राविधिक खटाइन्छ।'
        : 'Campus IT desk evaluates severity, verifies symptoms, and assigns technician.',
    },
    {
      num: '03',
      title: isNe ? 'मर्मत तथा प्रगति' : 'In Progress',
      icon: Wrench,
      tag: isNe ? 'तेस्रो चरण' : 'Stage 3',
      desc: isNe
        ? 'हार्डवेयर मर्मत, केबलिङ, सफ्टवेयर कन्फिगरेसन वा नेटवर्क समस्या समाधान गरिन्छ।'
        : 'On-campus repair, switch reconfiguration, OS patch, or hardware replacement in progress.',
    },
    {
      num: '04',
      title: isNe ? 'प्रमाणित समाधान' : 'Resolved',
      icon: CheckCircle2,
      tag: isNe ? 'अन्तिम चरण' : 'Stage 4',
      desc: isNe
        ? 'मर्मत सम्पन्न भएपछि आधिकारिक विवरणसहित विद्यार्थी ड्यासबोर्डमा सूचना अद्यावधिक हुन्छ।'
        : 'Technician confirms work; documented resolution notes appear in student dashboard.',
    },
  ];

  return (
    <div className="hero-workflow-card" aria-label={isNe ? 'उजुरी समाधान कार्यप्रणाली' : 'Complaint Resolution Workflow'}>
      {/* Workflow Card Header */}
      <div className="hero-workflow-header">
        <div className="hero-workflow-title-group">
          <span className="hero-workflow-badge">
            <Layers size={13} aria-hidden="true" />
            <span>{isNe ? 'कलेज कार्यविधि' : 'Standard College Workflow'}</span>
          </span>
          <h3 className="hero-workflow-title">
            {isNe ? 'उजुरी समाधानका ४ चरणहरू' : '4-Stage Resolution Pipeline'}
          </h3>
          <p className="hero-workflow-subtitle">
            {isNe
              ? 'दर्तादेखि प्राविधिक समाधानसम्मका पारदर्शी प्रशासनिक चरणहरू'
              : 'Transparent, accountable handling from initial lodge to verified campus fix'}
          </p>
        </div>
      </div>

      {/* Workflow Steps Container (Responsive: Grid on desktop, vertical timeline on narrow screens) */}
      <div className="hero-workflow-steps">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div key={stage.num} className="hero-workflow-step-item">
              <div className="hero-step-rail">
                <div className="hero-step-num-bubble">
                  <Icon size={14} aria-hidden="true" />
                </div>
                {idx < stages.length - 1 && <div className="hero-step-connector-line" />}
              </div>
              <div className="hero-step-body">
                <div className="hero-step-meta">
                  <span className="hero-step-tag">{stage.tag}</span>
                  <span className="hero-step-order">{stage.num}</span>
                </div>
                <h4 className="hero-step-heading">{stage.title}</h4>
                <p className="hero-step-desc">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Institutional Service Guarantees Footer */}
      <div className="hero-workflow-footer">
        <div className="hero-workflow-guarantee">
          <ShieldCheck size={15} className="hero-guarantee-icon" aria-hidden="true" />
          <span>
            {isNe
              ? 'विद्यार्थी खाताद्वारा सुरक्षित • ड्यासबोर्डमा प्रत्यक्ष अपडेट'
              : 'Authenticated Student Access • Real-Time Dashboard Updates'}
          </span>
        </div>
        <div className="hero-workflow-timeframe">
          <Clock size={13} aria-hidden="true" />
          <span>{isNe ? 'औसत छानबिन २४ घण्टाभित्र' : 'Standard 24h Triage'}</span>
        </div>
      </div>
    </div>
  );
}

export default HeroVisual;
