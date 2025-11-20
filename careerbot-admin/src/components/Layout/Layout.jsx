import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const styles = {
    layoutContainer: {
      display: 'flex',
      minHeight: '100vh',
      background: '#F5F5F5'
    },
    mainContent: {
      flex: 1,
      marginLeft: sidebarOpen ? '260px' : '70px',
      transition: 'margin-left 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    },
    contentWrapper: {
      flex: 1,
      padding: '24px',
      overflowY: 'auto'
    }
  };

  return (
    <div style={styles.layoutContainer}>
      <Sidebar isOpen={sidebarOpen} />
      <div style={styles.mainContent}>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div style={styles.contentWrapper}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
