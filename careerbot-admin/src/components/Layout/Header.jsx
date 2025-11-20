import React from 'react';
import { FaBars, FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const styles = {
    header: {
      height: '70px',
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      fontFamily: "'Inter', sans-serif"
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    menuButton: {
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      border: 'none',
      padding: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      transition: 'all 0.3s',
      color: '#667eea',
      fontSize: '20px'
    },
    pageTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0,
      letterSpacing: '-0.3px'
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    headerSearch: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    searchIcon: {
      position: 'absolute',
      left: '14px',
      fontSize: '16px',
      color: '#94a3b8'
    },
    searchInput: {
      padding: '10px 14px 10px 42px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      width: '280px',
      outline: 'none',
      transition: 'all 0.3s',
      backgroundColor: '#f8fafc',
      fontFamily: 'inherit'
    },
    notificationButton: {
      position: 'relative',
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      border: 'none',
      padding: '12px',
      cursor: 'pointer',
      borderRadius: '12px',
      fontSize: '18px',
      transition: 'all 0.3s',
      color: '#667eea',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    notificationBadge: {
      position: 'absolute',
      top: '6px',
      right: '6px',
      background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      color: 'white',
      fontSize: '10px',
      padding: '3px 6px',
      borderRadius: '10px',
      fontWeight: '700',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    headerProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 16px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
    },
    profileAvatar: {
      width: '42px',
      height: '42px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      color: 'white',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    profileInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    profileName: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#1e293b'
    },
    profileRole: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '500'
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        <button 
          onClick={toggleSidebar} 
          style={styles.menuButton}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            e.target.style.color = 'white';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
            e.target.style.color = '#667eea';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <FaBars />
        </button>
        <h2 style={styles.pageTitle}>Admin Dashboard</h2>
      </div>

      <div style={styles.headerRight}>
        <div style={styles.headerSearch}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search anything..."
            style={styles.searchInput}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.backgroundColor = 'white';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <button 
          style={styles.notificationButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
            e.currentTarget.style.color = '#667eea';
          }}
        >
          <FaBell />
          <span style={styles.notificationBadge}>3</span>
        </button>

        <div 
          style={styles.headerProfile}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
          }}
        >
          <div style={styles.profileAvatar}>
            <FaUserCircle />
          </div>
          <div style={styles.profileInfo}>
            <span style={styles.profileName}>Admin User</span>
            <span style={styles.profileRole}>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
