import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { removeToken } from '../../utils/auth';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaChartLine, FaUsers, FaBookOpen, FaTrophy, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: <FaChartLine />, label: 'Dashboard', subtitle: 'Overview', exact: true },
    { path: '/users', icon: <FaUsers />, label: 'Users', subtitle: 'Manage accounts' },
    { path: '/resources', icon: <FaBookOpen />, label: 'Resources', subtitle: 'Learning content' },
    { path: '/performance', icon: <FaTrophy />, label: 'Performance', subtitle: 'Analytics & Stats' }
  ];

  const styles = {
    sidebar: {
      width: isOpen ? '280px' : '80px',
      height: '100vh',
      background: 'linear-gradient(180deg, #6750A4 0%, #5940A0 50%, #4F378B 100%)',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1000,
      boxShadow: '4px 0 24px rgba(103, 80, 164, 0.15)',
      overflow: 'hidden'
    },
    sidebarHeader: {
      padding: isOpen ? '28px 20px' : '28px 16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      background: 'rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)'
    },
    sidebarLogo: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      color: 'white',
      justifyContent: isOpen ? 'flex-start' : 'center'
    },
    logoIcon: {
      fontSize: '2.2rem',
      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
    },
    logoText: {
      fontSize: '1.4rem',
      fontWeight: 700,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      letterSpacing: '0.5px',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    },
    logoSubtext: {
      fontSize: '0.7rem',
      opacity: 0.8,
      marginTop: '-4px',
      display: 'block',
      letterSpacing: '1.5px',
      textTransform: 'uppercase'
    },
    sidebarNav: {
      flex: 1,
      padding: '24px 0',
      overflowY: 'auto',
      overflowX: 'hidden'
    },
    navList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    navItem: {
      margin: '6px 12px'
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: isOpen ? '14px 18px' : '14px 0',
      color: 'rgba(255, 255, 255, 0.75)',
      textDecoration: 'none',
      borderRadius: '12px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: '0.95rem',
      fontWeight: 500,
      position: 'relative',
      justifyContent: isOpen ? 'flex-start' : 'center',
      cursor: 'pointer'
    },
    navLinkActive: {
      background: 'rgba(255, 255, 255, 0.18)',
      color: 'white',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      transform: 'translateX(4px)'
    },
    navLinkHover: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      transform: 'translateX(2px)'
    },
    navIcon: {
      fontSize: '1.4rem',
      minWidth: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
    },
    navContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    },
    navLabel: {
      fontSize: '0.95rem',
      fontWeight: 600,
      letterSpacing: '0.3px'
    },
    navSubtitle: {
      fontSize: '0.7rem',
      opacity: 0.7,
      fontWeight: 400
    },
    sidebarFooter: {
      padding: '16px 12px',
      borderTop: '1px solid rgba(255, 255, 255, 0.12)',
      background: 'rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)'
    },
    logoutButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: isOpen ? '14px 18px' : '14px 0',
      background: 'rgba(244, 67, 54, 0.15)',
      border: '1px solid rgba(244, 67, 54, 0.3)',
      color: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: '0.95rem',
      fontWeight: 600,
      justifyContent: isOpen ? 'flex-start' : 'center',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    divider: {
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
      margin: '20px 12px'
    }
  };

  const [hoveredIndex, setHoveredIndex] = React.useState(null);
  const [logoutHovered, setLogoutHovered] = React.useState(false);

  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <div style={styles.sidebarLogo}>
          <span style={styles.logoIcon}><FaGraduationCap /></span>
          {isOpen && (
            <div>
              <span style={styles.logoText}>CareerBot</span>
              <span style={styles.logoSubtext}>Admin Portal</span>
            </div>
          )}
        </div>
      </div>

      <nav style={styles.sidebarNav}>
        <ul style={styles.navList}>
          {menuItems.map((item, index) => (
            <li key={item.path} style={styles.navItem}>
              <NavLink
                to={item.path}
                end={item.exact}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                  ...(hoveredIndex === index && !isActive ? styles.navLinkHover : {})
                })}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {isOpen && (
                  <div style={styles.navContent}>
                    <span style={styles.navLabel}>{item.label}</span>
                    {item.subtitle && <span style={styles.navSubtitle}>{item.subtitle}</span>}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div style={styles.divider}></div>
      </nav>

      <div style={styles.sidebarFooter}>
        <button 
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
          style={{
            ...styles.logoutButton,
            ...(logoutHovered ? {
              background: 'rgba(244, 67, 54, 0.25)',
              transform: 'scale(1.02)',
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
            } : {})
          }}
        >
          <span style={styles.navIcon}><FaSignOutAlt /></span>
          {isOpen && <span style={styles.navLabel}>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
