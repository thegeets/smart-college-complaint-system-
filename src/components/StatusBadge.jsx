import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  Search, 
  Wrench, 
  CheckCircle2, 
  XCircle, 
  AlertCircle
} from 'lucide-react';

export function StatusBadge({ status }) {
  const { getStatusLabel } = useApp();

  const getStatusConfig = (val) => {
    switch (val) {
      case 'Submitted':
        return {
          className: 'badge-status-submitted',
          icon: <Clock size={12} />,
        };
      case 'Under Review':
        return {
          className: 'badge-status-review',
          icon: <Search size={12} />,
        };
      case 'In Progress':
        return {
          className: 'badge-status-progress',
          icon: <Wrench size={12} />,
        };
      case 'Resolved':
        return {
          className: 'badge-status-resolved',
          icon: <CheckCircle2 size={12} />,
        };
      case 'Rejected':
        return {
          className: 'badge-status-rejected',
          icon: <XCircle size={12} />,
        };
      default:
        return {
          className: 'badge-status-submitted',
          icon: <Clock size={12} />,
        };
    }
  };

  const config = getStatusConfig(status);
  const localizedLabel = getStatusLabel(status);

  return (
    <span className={`badge ${config.className}`}>
      {config.icon}
      <span>{localizedLabel}</span>
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const { getPriorityLabel } = useApp();

  const getPriorityConfig = (val) => {
    switch (val) {
      case 'Urgent':
        return {
          className: 'badge-priority-urgent',
          icon: <AlertCircle size={12} />,
        };
      case 'High':
        return {
          className: 'badge-priority-high',
          icon: <AlertCircle size={12} />,
        };
      case 'Medium':
        return {
          className: 'badge-priority-medium',
          icon: null,
        };
      case 'Low':
      default:
        return {
          className: 'badge-priority-low',
          icon: null,
        };
    }
  };

  const config = getPriorityConfig(priority);
  const localizedLabel = getPriorityLabel(priority);

  return (
    <span className={`badge ${config.className}`}>
      {config.icon}
      <span>{localizedLabel}</span>
    </span>
  );
}

export function CategoryBadge({ category }) {
  const { getCategoryLabel } = useApp();
  const localizedLabel = getCategoryLabel(category);

  return (
    <span className="badge badge-category">
      <span>{localizedLabel}</span>
    </span>
  );
}

export default StatusBadge;
