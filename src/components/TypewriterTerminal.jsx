import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';

/**
 * TypewriterTerminal
 * Terminal showcase displaying 5 complete lines per feature with line-by-line reveal
 * and smooth cross-fade transitions.
 * Includes a live-ticking SLA countdown timer and hover glowing window dots.
 */
export function TypewriterTerminal({ activeFeatureTab = 0, isNe = false }) {
  const terminalRef = useRef(null);
  const isInView = useInView(terminalRef, { margin: '80px' });
  const shouldReduceMotion = useReducedMotion();

  const INITIAL_REMAINING_SEC = 18 * 3600 + 42 * 60 + 15;
  const formatCountdown = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `Remaining: ${hrs}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  };

  const slaRef = useRef(null);
  const remainingSecRef = useRef(INITIAL_REMAINING_SEC);
  const [countdownText, setCountdownText] = useState(() => formatCountdown(INITIAL_REMAINING_SEC));
  const [isTabVisible, setIsTabVisible] = useState(
    typeof document !== 'undefined' ? !document.hidden : true
  );

  // Page Visibility API tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Tick SLA countdown only when both in viewport and tab is visible
  useEffect(() => {
    if (!isInView || !isTabVisible) return;

    const timer = setInterval(() => {
      remainingSecRef.current = Math.max(0, remainingSecRef.current - 1);
      const formatted = formatCountdown(remainingSecRef.current);
      setCountdownText(formatted);
      if (slaRef.current) {
        slaRef.current.textContent = formatted;
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isInView, isTabVisible]);

  // Structured 5 complete lines per feature view
  const tabContent = [
    {
      comment: isNe ? '// नमुना उजुरी खटन तथा जिम्मेवारी' : '// SAMPLE TICKET ASSIGNMENT',
      tag: 'SAMPLE TICKET',
      tagColor: '#34D399',
      tagBg: 'rgba(16, 185, 129, 0.16)',
      lines: [
        { text: '> Ticket Reference: #SCCS-2026-084', color: '#CBD5E1' },
        { text: '> Issue Category: Wi-Fi & Campus Network', color: '#CBD5E1' },
        { text: '> Urgency: High Priority [Classroom practical affected]', color: '#CBD5E1' },
        { text: '> Assigned Staff: Bikash Sharma – Senior Technician', color: '#38BDF8' },
        { text: '> Target SLA: Target response within 24–48 hours', color: '#60A5FA' },
      ],
    },
    {
      comment: isNe ? '// विद्यार्थी तथ्याङ्क गोपनीयता' : '// STUDENT DATA PRIVACY',
      tag: 'CONFIDENTIAL',
      tagColor: '#93C5FD',
      tagBg: 'rgba(59, 130, 246, 0.16)',
      lines: [
        { text: '> Ticket Reference: #SCCS-2026-112', color: '#CBD5E1' },
        { text: '> Issue Category: Computer Lab & Workstations', color: '#CBD5E1' },
        { text: '> Privacy Guard: Active (Individual account protection)', color: '#CBD5E1' },
        { text: '> Access Permission: Student owner & assigned staff only', color: '#38BDF8' },
        { text: '> Confidentiality: Isolated feed [Zero public exposure]', color: '#4ADE80' },
      ],
    },
    {
      comment: isNe ? '// ४-चरणबद्ध प्रगति स्थिति' : '// RESOLUTION PROGRESS STAGES',
      tag: 'STAGE 3 OF 4',
      tagColor: '#C084FC',
      tagBg: 'rgba(168, 85, 247, 0.16)',
      lines: [
        { text: '> Ticket Reference: #SCCS-2026-097 [Lab 2: Workstation #14]', color: '#CBD5E1' },
        { text: '[10:15 AM] 1. Submitted: Hardware fault report logged', color: '#CBD5E1' },
        { text: '[10:45 AM] 2. Under Review: Assigned to Bikash Sharma', color: '#CBD5E1' },
        { text: '[11:20 AM] 3. In Progress: RJ-45 cable testing & crimping', color: '#FCD34D' },
        { text: '[Upcoming] 4. Resolved: Verified fix & closing remarks', color: '#38BDF8' },
      ],
    },
    {
      comment: isNe ? '// पुरानो उजुरी खातामा जोड्ने' : '// CLAIM PREVIOUS TICKET',
      tag: 'TICKET LINKED',
      tagColor: '#FDE047',
      tagBg: 'rgba(234, 179, 8, 0.16)',
      lines: [
        { text: '> Ticket Reference: #SCCS-2026-052 [Guest Submission]', color: '#CBD5E1' },
        { text: '> Issue Category: Programming Tools & Software', color: '#CBD5E1' },
        { text: '> Secret Verification: Authenticated with 6-digit key', color: '#CBD5E1' },
        { text: '> Account Assignment: Linked to SOCH-CSIT-2023-045', color: '#38BDF8' },
        { text: '> Target SLA: Synced to personal student dashboard', color: '#4ADE80' },
      ],
    },
  ];

  const currentTab = tabContent[activeFeatureTab] || tabContent[0];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.04,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const lineVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.22,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div ref={terminalRef} className="demo-viewport-card" aria-live="polite">
      {/* Top Bar with Three Glowing Dots, Title, and Live Countdown */}
      <div className="demo-terminal-bar">
        <div className="terminal-dots">
          <span className="terminal-dot red" title="Close window" />
          <span className="terminal-dot yellow" title="Minimize window" />
          <span className="terminal-dot green" title="Maximize window" />
        </div>
        <span className="terminal-title">soch-campus-desk // sample-ticket-review</span>

        {/* Live SLA Countdown Badge */}
        <div className="terminal-sla-badge" title="Live SLA response timer">
          <span className="sla-pulse-dot" />
          <span ref={slaRef}>{countdownText}</span>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="demo-terminal-content">
        <AnimatePresence mode="wait">
          <m.div
            key={activeFeatureTab}
            variants={shouldReduceMotion ? undefined : containerVariants}
            initial={shouldReduceMotion ? false : 'hidden'}
            animate="visible"
            exit="exit"
            style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ color: '#60A5FA', fontWeight: 600, fontSize: '0.8125rem' }}>
                {currentTab.comment}
              </span>
              <span
                style={{
                  backgroundColor: currentTab.tagBg,
                  color: currentTab.tagColor,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {currentTab.tag}
              </span>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.8125rem',
                lineHeight: 1.75,
                color: '#CBD5E1',
                minHeight: '150px',
              }}
            >
              {currentTab.lines.map((line, i) => (
                <m.div
                  key={`${activeFeatureTab}-${i}`}
                  variants={shouldReduceMotion ? undefined : lineVariants}
                  style={{ color: line.color, wordBreak: 'break-word' }}
                >
                  {line.text}
                </m.div>
              ))}
            </div>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TypewriterTerminal;
