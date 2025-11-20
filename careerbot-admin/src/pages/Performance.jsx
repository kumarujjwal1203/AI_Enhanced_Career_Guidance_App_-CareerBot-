import React, { useState, useEffect } from 'react';
import { performanceAPI } from '../services/api';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FaTrophy, FaChartBar, FaBookOpen, FaUsers, FaMedal, FaSpinner } from 'react-icons/fa';

const Performance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const response = await performanceAPI.getPerformance();
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px'
      }}>
        <FaSpinner style={{
          fontSize: '48px',
          color: '#667eea',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>Loading performance data...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#fa709a'];

  const styles = {
    pageContainer: {
      padding: '0',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    pageHeader: {
      marginBottom: '32px',
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      padding: '32px',
      borderRadius: '20px',
      border: '1px solid rgba(102, 126, 234, 0.2)'
    },
    pageHeading: {
      fontSize: '32px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    pageDescription: {
      color: '#64748b',
      fontSize: '16px',
      fontWeight: '500'
    },
    performanceGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: '28px',
      marginBottom: '32px'
    },
    performanceCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      transition: 'all 0.3s'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '2px solid #f1f5f9'
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      margin: 0
    },
    cardSubtitle: {
      fontSize: '14px',
      color: '#94a3b8',
      fontWeight: '500',
      marginTop: '4px',
      display: 'block'
    },
    topStudentsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    studentItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(102, 126, 234, 0.1)',
      transition: 'all 0.3s'
    },
    studentRank: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    rankBadge: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: '700',
      color: 'white',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
    rank1: {
      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
      color: '#d97706',
      fontSize: '20px'
    },
    rank2: {
      background: 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)',
      color: '#64748b'
    },
    rank3: {
      background: 'linear-gradient(135deg, #cd7f32 0%, #e89a6e 100%)',
      color: '#92400e'
    },
    studentInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      flex: 1
    },
    studentAvatar: {
      width: '52px',
      height: '52px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: '700',
      color: 'white',
      border: '3px solid white',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    studentDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    studentName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e293b'
    },
    studentEmail: {
      fontSize: '13px',
      color: '#64748b'
    },
    studentStats: {
      display: 'flex',
      gap: '20px'
    },
    statColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px'
    },
    statValue: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#667eea'
    },
    statLabel: {
      fontSize: '12px',
      color: '#94a3b8',
      fontWeight: '500'
    },
    chartWrapper: {
      marginTop: '16px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#94a3b8'
    },
    emptyStateIcon: {
      fontSize: '64px',
      marginBottom: '16px',
      opacity: 0.4
    },
    emptyStateText: {
      fontSize: '16px',
      fontWeight: '500'
    },
    tableCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      marginTop: '32px'
    },
    dataTable: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      marginTop: '20px'
    },
    tableHeader: {
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      borderRadius: '12px'
    },
    tableHeaderCell: {
      padding: '16px 20px',
      textAlign: 'left',
      fontSize: '14px',
      fontWeight: '700',
      color: '#475569',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '2px solid #e2e8f0'
    },
    tableRow: {
      transition: 'all 0.2s',
      borderBottom: '1px solid #f1f5f9'
    },
    tableCell: {
      padding: '16px 20px',
      fontSize: '15px',
      color: '#334155'
    },
    topicCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    topicIcon: {
      fontSize: '24px'
    },
    topicName: {
      fontWeight: '600',
      color: '#1e293b'
    },
    scoreBadge: {
      display: 'inline-block',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '15px',
      fontWeight: '700',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    scoreBadgeHigh: {
      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      color: 'white'
    },
    scoreBadgeMedium: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      color: 'white'
    },
    scoreBadgeLow: {
      background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      color: 'white'
    },
    progressBar: {
      width: '100%',
      height: '10px',
      background: '#f1f5f9',
      borderRadius: '10px',
      overflow: 'hidden',
      position: 'relative'
    },
    progressFill: {
      height: '100%',
      borderRadius: '10px',
      transition: 'width 0.6s ease',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageHeading}>
          <FaTrophy style={{ fontSize: '32px' }} />
          Performance Analytics
        </h1>
        <p style={styles.pageDescription}>Monitor student performance and quiz analytics</p>
      </div>

      <div style={styles.performanceGrid}>
        {/* Top Students */}
        <div 
          style={styles.performanceCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
          }}
        >
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>
                <FaTrophy style={{ color: '#fbbf24' }} />
                Top Performing Students
              </h3>
              <span style={styles.cardSubtitle}>Based on average quiz scores</span>
            </div>
          </div>
          <div style={styles.topStudentsList}>
            {data?.topStudents && data.topStudents.length > 0 ? (
              data.topStudents.map((student, index) => (
                <div 
                  key={index} 
                  style={styles.studentItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(6px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={styles.studentRank}>
                    <span style={{
                      ...styles.rankBadge,
                      ...(index === 0 ? styles.rank1 : index === 1 ? styles.rank2 : index === 2 ? styles.rank3 : {
                        background: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
                        color: '#475569'
                      })
                    }}>
                      {index === 0 ? <FaMedal /> : index + 1}
                    </span>
                  </div>
                  <div style={styles.studentInfo}>
                    <div style={styles.studentAvatar}>
                      {student.user?.name ? student.user.name.charAt(0).toUpperCase() : student.user?.email.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.studentDetails}>
                      <span style={styles.studentName}>{student.user?.name || 'N/A'}</span>
                      <span style={styles.studentEmail}>{student.user?.email}</span>
                    </div>
                  </div>
                  <div style={styles.studentStats}>
                    <div style={styles.statColumn}>
                      <span style={styles.statValue}>{student.averageScore}%</span>
                      <span style={styles.statLabel}>Avg Score</span>
                    </div>
                    <div style={styles.statColumn}>
                      <span style={styles.statValue}>{student.totalAttempts}</span>
                      <span style={styles.statLabel}>Attempts</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}><FaUsers /></div>
                <p style={styles.emptyStateText}>No performance data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Topic Performance */}
        <div 
          style={styles.performanceCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
          }}
        >
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>
                <FaChartBar style={{ color: '#667eea' }} />
                Topic Performance
              </h3>
              <span style={styles.cardSubtitle}>Quiz performance by topic</span>
            </div>
          </div>
          <div style={styles.chartWrapper}>
            {data?.topicPerformance && data.topicPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.topicPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="topic" 
                    stroke="#64748b"
                    style={{ fontSize: '13px', fontWeight: '500' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '13px', fontWeight: '500' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
                  />
                  <Bar dataKey="averageScore" radius={[12, 12, 0, 0]}>
                    {data.topicPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}><FaChartBar /></div>
                <p style={styles.emptyStateText}>No topic data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topic Statistics Table */}
      {data?.topicPerformance && data.topicPerformance.length > 0 && (
        <div style={styles.tableCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <FaBookOpen style={{ color: '#764ba2' }} />
              Detailed Topic Statistics
            </h3>
          </div>
          <table style={styles.dataTable}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Topic</th>
                <th style={styles.tableHeaderCell}>Average Score</th>
                <th style={styles.tableHeaderCell}>Total Attempts</th>
                <th style={styles.tableHeaderCell}>Students</th>
                <th style={styles.tableHeaderCell}>Performance</th>
              </tr>
            </thead>
            <tbody>
              {data.topicPerformance.map((topic, index) => (
                <tr 
                  key={index} 
                  style={styles.tableRow}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={styles.tableCell}>
                    <div style={styles.topicCell}>
                      <span style={styles.topicIcon}><FaBookOpen /></span>
                      <span style={styles.topicName}>{topic.topic}</span>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.scoreBadge,
                      ...(topic.averageScore >= 80 ? styles.scoreBadgeHigh : 
                         topic.averageScore >= 60 ? styles.scoreBadgeMedium : styles.scoreBadgeLow)
                    }}>
                      {topic.averageScore}%
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <strong>{topic.totalAttempts}</strong>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaUsers style={{ color: '#667eea' }} />
                      {topic.totalStudents}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.progressBar}>
                      <div 
                        style={{
                          ...styles.progressFill,
                          width: `${topic.averageScore}%`,
                          background: topic.averageScore >= 80 ? 
                            'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : 
                            topic.averageScore >= 60 ? 
                            'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' : 
                            'linear-gradient(90deg, #ef4444 0%, #f87171 100%)'
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Performance;
