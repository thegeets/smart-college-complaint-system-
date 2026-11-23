import React, { useState, useEffect, useRef } from 'react';
import { m, useInView, useReducedMotion } from 'framer-motion';

/**
 * TypewriterTerminal
 * Terminal showcase that reveals lines sequentially with a typing effect and blinking cursor.
 * Includes a live-ticking SLA countdown timer ("Remaining: 18h 41m 58s") and soft dot hover glows.
 * Pauses timers when off-screen or tab is hidden via Page Visibility API.
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

  // Tick only when both in viewport and tab is visible
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

  // Structured lines per tab
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
        { text: '> Student Account: SOCH-CSIT-2023-045 (Verified)', color: '#CBD5E1' },
        { text: '> Privacy Guard: Active (Individual account protection)', color: '#CBD5E1' },
        { text: '> Public Directory: None (Complaints are never exposed publicly)', color: '#CBD5E1' },
        { text: '> Access Permission: Student owner & assigned staff only', color: '#38BDF8' },
        { text: '> Confidentiality Status: Fully Protected & Isolated', color: '#4ADE80' },
      ],
    },
    {
      comment: isNe ? '// ४-चरणबद्ध प्रगति स्थिति' : '// RESOLUTION PROGRESS STAGES',
      tag: 'STAGE 3 OF 4',
      tagColor: '#C084FC',
      tagBg: 'rgba(168, 85, 247, 0.16)',
      lines: [
        { text: '[10:15 AM] 1. Submitted: Report lodged for Lab 2: Workstation #14', color: '#CBD5E1' },
        { text: '[10:45 AM] 2. Reviewed: Assigned to Bikash Sharma – Senior Technician', color: '#CBD5E1' },
        { text: '[11:20 AM] 3. In Progress: Hardware inspection & cable testing', color: '#FCD34D' },
        { text: '> Technician Update: RJ-45 connector crimped & latency verified', color: '#38BDF8' },
        { text: '[Next Step] 4. Resolved: Closing remarks logged to student dashboard', color: '#94A3B8' },
      ],
    },
    {
      comment: isNe ? '// पुरानो उजुरी खातामा जोड्ने' : '// CLAIM PREVIOUS TICKET',
      tag: 'TICKET LINKED',
      tagColor: '#FDE047',
      tagBg: 'rgba(234, 179, 8, 0.16)',
      lines: [
        { text: '> Input Reference Code: #SCCS-2026-084', color: '#CBD5E1' },
        { text: '> Secret Verification: Authenticated', color: '#CBD5E1' },
        { text: '> Account Assignment: Linked to SOCH-CSIT-2023-045', color: '#38BDF8' },
        { text: '> Success: Ticket is permanently available in "My Complaints"', color: '#4ADE80' },
      ],
    },
  ];

  const currentTab = tabContent[activeFeatureTab] || tabContent[0];
  const [typedCount, setTypedCount] = useState(1);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const timeouts = [];
    const count = currentTab.lines.length;

    const t0 = setTimeout(() => {
      setTypedCount(1);
    }, 0);
    timeouts.push(t0);

    for (let idx = 1; idx < count; idx++) {
      const t = setTimeout(() => {
        setTypedCount((prev) => Math.max(prev, idx + 1));
      }, idx * 180);
      timeouts.push(t);
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [activeFeatureTab, shouldReduceMotion, currentTab.lines]);

  const visibleLines = shouldReduceMotion
    ? currentTab.lines
    : currentTab.lines.slice(0, typedCount);

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
            minHeight: '140px',
          }}
        >
          {visibleLines.map((line, i) => (
            <m.div
              key={`${activeFeatureTab}-${i}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
              style={{ color: line.color }}
            >
              {line.text}
            </m.div>
          ))}

          {/* Blinking Typewriter Cursor */}
          {!shouldReduceMotion && typedCount <= currentTab.lines.length && (
            <span className="terminal-cursor" aria-hidden="true">
              ▋
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TypewriterTerminal;
