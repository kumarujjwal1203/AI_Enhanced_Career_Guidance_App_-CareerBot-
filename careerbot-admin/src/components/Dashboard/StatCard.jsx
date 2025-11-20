import React from 'react';
import { FaArrowUp, FaArrowDown, FaArrowRight } from 'react-icons/fa';

const StatCard = ({ title, value, icon, color, trend, trendValue }) => {
  const colorSchemes = {
    primary: {
      bg: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
      icon: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#667eea',
      shadow: 'rgba(102, 126, 234, 0.3)'
    },
    success: {
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
      icon: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      text: '#10b981',
      shadow: 'rgba(16, 185, 129, 0.3)'
    },
    info: {
      bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
      icon: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      text: '#3b82f6',
      shadow: 'rgba(59, 130, 246, 0.3)'
    },
    warning: {
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
      icon: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      text: '#f59e0b',
      shadow: 'rgba(245, 158, 11, 0.3)'
    }
  };

  const currentColor = colorSchemes[color] || colorSchemes.primary;

  const styles = {
    statCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      border: `2px solid ${currentColor.text}20`,
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100%',
      height: '100%',
      background: currentColor.bg,
      opacity: 0.5,
      pointerEvents: 'none'
    },
    statCardContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '20px',
      position: 'relative',
      zIndex: 1
    },
    statInfo: {
      flex: 1
    },
    statTitle: {
      fontSize: '14px',
      color: '#64748b',
      fontWeight: '600',
      marginBottom: '12px',
      display: 'block',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statValueLarge: {
      fontSize: '36px',
      fontWeight: '800',
      color: '#1e293b',
      margin: '0 0 12px 0',
      letterSpacing: '-1px'
    },
    statTrend: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#64748b',
      padding: '6px 12px',
      background: trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)',
      borderRadius: '8px',
      width: 'fit-content'
    },
    statIconCircle: {
      width: '72px',
      height: '72px',
      borderRadius: '18px',
      background: currentColor.icon,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      boxShadow: `0 8px 20px ${currentColor.shadow}`,
      color: 'white',
      transform: 'rotate(-5deg)',
      transition: 'transform 0.3s'
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <FaArrowUp />;
    if (trend === 'down') return <FaArrowDown />;
    return <FaArrowRight />;
  };

  return (
    <div 
      style={styles.statCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = `0 12px 40px ${currentColor.shadow}`;
        e.currentTarget.querySelector('.icon-circle').style.transform = 'rotate(0deg) scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        e.currentTarget.querySelector('.icon-circle').style.transform = 'rotate(-5deg) scale(1)';
      }}
    >
      <div style={styles.backgroundPattern}></div>
      <div style={styles.statCardContent}>
        <div style={styles.statInfo}>
          <span style={styles.statTitle}>{title}</span>
          <h2 style={styles.statValueLarge}>{value}</h2>
          {trendValue && (
            <div style={styles.statTrend}>
              {getTrendIcon()}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="icon-circle" style={styles.statIconCircle}>
          <span>{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
