import React from 'react';

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color = 'blue', 
  helper, 
  onClick 
}) {
  return (
    <div 
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <div className="stat-value">{value}</div>
        {helper && <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>{helper}</div>}
      </div>
      {Icon && (
        <div className={`stat-icon-wrapper ${color}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}

export default StatCard;
