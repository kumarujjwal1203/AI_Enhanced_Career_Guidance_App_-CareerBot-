import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { toast } from 'react-toastify';
import StatCard from '../components/Dashboard/StatCard';
import UserGrowthChart from '../components/Dashboard/UserGrowthChart';
import { FaUsers, FaCheckCircle, FaEdit, FaTrophy, FaBookOpen, FaChartLine, FaSync } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    dashboardPage: {
      padding: '0'
    },
    pageHeader: {
      marginBottom: '24px'
    },
    pageHeading: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1A1A1A',
      marginBottom: '8px'
    },
    pageDescription: {
      color: '#666666',
      fontSize: '1rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    dashboardCard: {
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'box-shadow 0.3s'
    },
    cardHeader: {
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1A1A1A',
      margin: 0
    },
    cardSubtitle: {
      fontSize: '0.875rem',
      color: '#999999'
    },
    quickStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px'
    },
    statItem: {
      padding: '16px',
      background: '#F5F5F5',
      borderRadius: '8px',
      transition: 'transform 0.3s'
    },
    statLabel: {
      display: 'block',
      fontSize: '0.875rem',
      color: '#666666',
      marginBottom: '8px'
    },
    statValue: {
      display: 'block',
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#6750A4'
    },
    quickActions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    actionCard: {
      background: 'linear-gradient(135deg, #6750A4 0%, #8270B8 100%)',
      color: 'white',
      padding: '24px',
      borderRadius: '12px',
      textDecoration: 'none',
      border: 'none',
      cursor: 'pointer',
      transition: 'transform 0.3s, box-shadow 0.3s',
      textAlign: 'left',
      display: 'block'
    },
    actionIcon: {
      fontSize: '2.5rem',
      marginBottom: '12px',
      display: 'block'
    },
    actionTitle: {
      fontSize: '1.125rem',
      fontWeight: 600,
      marginBottom: '8px',
      margin: '0 0 8px 0'
    },
    actionDescription: {
      fontSize: '0.875rem',
      opacity: 0.9,
      margin: 0
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '16px'
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: '4px solid #E0E0E0',
      borderTopColor: '#6750A4',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.dashboardPage}>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageHeading}>Dashboard Overview</h1>
        <p style={styles.pageDescription}>Monitor your platform's performance and user activity</p>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          title="Total Users"
          value={stats?.users?.total || 0}
          icon={<FaUsers />}
          color="primary"
          trend={stats?.users?.newThisMonth > 0 ? 'up' : 'neutral'}
          trendValue={`+${stats?.users?.newThisMonth || 0} this month`}
        />
        
        <StatCard
          title="Active Users"
          value={stats?.users?.active || 0}
          icon={<FaCheckCircle />}
          color="success"
          trend="neutral"
          trendValue={`${Math.round((stats?.users?.active / stats?.users?.total) * 100) || 0}% of total`}
        />
        
        <StatCard
          title="Quiz Attempts"
          value={stats?.quizzes?.totalAttempts || 0}
          icon={<FaEdit />}
          color="info"
          trend={stats?.quizzes?.attemptsToday > 0 ? 'up' : 'neutral'}
          trendValue={`${stats?.quizzes?.attemptsToday || 0} today`}
        />
        
        <StatCard
          title="Average Score"
          value={`${stats?.quizzes?.averageScore || 0}%`}
          icon={<FaTrophy />}
          color="warning"
          trend={stats?.quizzes?.averageScore >= 70 ? 'up' : 'down'}
          trendValue={stats?.quizzes?.averageScore >= 70 ? 'Excellent' : 'Needs improvement'}
        />
      </div>

      <div style={styles.dashboardGrid}>
        <div style={styles.dashboardCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>User Growth</h3>
            <span style={styles.cardSubtitle}>Last 7 Days</span>
          </div>
          <UserGrowthChart data={stats?.userGrowth || []} />
        </div>

        <div style={styles.dashboardCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Quick Stats</h3>
          </div>
          <div style={styles.quickStats}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Resources</span>
              <span style={styles.statValue}>{stats?.resources?.total || 0}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Active Resources</span>
              <span style={styles.statValue}>{stats?.resources?.active || 0}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>New Users (Month)</span>
              <span style={styles.statValue}>{stats?.users?.newThisMonth || 0}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Quizzes Today</span>
              <span style={styles.statValue}>{stats?.quizzes?.attemptsToday || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.quickActions}>
        <Link to="/users" style={styles.actionCard}>
          <span style={styles.actionIcon}><FaUsers /></span>
          <h4 style={styles.actionTitle}>Manage Users</h4>
          <p style={styles.actionDescription}>View and manage user accounts</p>
        </Link>
        <Link to="/resources" style={styles.actionCard}>
          <span style={styles.actionIcon}><FaBookOpen /></span>
          <h4 style={styles.actionTitle}>Add Resource</h4>
          <p style={styles.actionDescription}>Create learning resources</p>
        </Link>
        <Link to="/performance" style={styles.actionCard}>
          <span style={styles.actionIcon}><FaChartLine /></span>
          <h4 style={styles.actionTitle}>View Analytics</h4>
          <p style={styles.actionDescription}>Check performance metrics</p>
        </Link>
        <button style={styles.actionCard} onClick={fetchStats}>
          <span style={styles.actionIcon}><FaSync /></span>
          <h4 style={styles.actionTitle}>Refresh Data</h4>
          <p style={styles.actionDescription}>Update dashboard stats</p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
