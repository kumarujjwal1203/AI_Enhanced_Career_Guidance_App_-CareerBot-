import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { setToken } from '../utils/auth';
import { FaGraduationCap, FaEnvelope, FaLock, FaArrowRight, FaSpinner } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);
      
      if (response.data.success && response.data.data.user.isAdmin) {
        setToken(response.data.data.token);
        toast.success('Login successful!');
        navigate('/');
      } else if (!response.data.data.user.isAdmin) {
        toast.error('Access denied. Admin privileges required.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    loginPage: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    backgroundShapes: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      opacity: 0.1
    },
    shape: {
      position: 'absolute',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      animation: 'float 15s infinite ease-in-out'
    },
    loginContainer: {
      position: 'relative',
      zIndex: 10,
      width: '100%',
      maxWidth: '450px',
      padding: '20px',
      animation: 'slideIn 0.6s ease-out'
    },
    loginCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '48px 40px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    logoSection: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    logoIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      marginBottom: '20px',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
      color: 'white',
      fontSize: '40px'
    },
    logoTitle: {
      fontSize: '32px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '8px'
    },
    logoSubtitle: {
      fontSize: '15px',
      color: '#64748b',
      fontWeight: '500',
      letterSpacing: '0.5px'
    },
    welcomeSection: {
      textAlign: 'center',
      marginBottom: '36px'
    },
    welcomeTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px'
    },
    welcomeText: {
      fontSize: '15px',
      color: '#64748b'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '10px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#334155',
      letterSpacing: '0.3px'
    },
    inputWrapper: {
      position: 'relative'
    },
    inputIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8',
      fontSize: '18px',
      transition: 'color 0.3s'
    },
    input: {
      width: '100%',
      padding: '14px 16px 14px 48px',
      fontSize: '15px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    loginBtn: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      fontWeight: '600',
      color: 'white',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginTop: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      letterSpacing: '0.5px'
    },
    keyframes: `
      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        33% { transform: translateY(-20px) rotate(5deg); }
        66% { transform: translateY(20px) rotate(-5deg); }
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `
  };

  return (
    <>
      <style>{styles.keyframes}</style>
      <div style={styles.loginPage}>
        <div style={styles.backgroundShapes}>
          <div style={{...styles.shape, width: '400px', height: '400px', top: '-100px', left: '-100px'}}></div>
          <div style={{...styles.shape, width: '300px', height: '300px', bottom: '-50px', right: '-50px', animationDelay: '5s'}}></div>
          <div style={{...styles.shape, width: '200px', height: '200px', top: '50%', left: '50%', animationDelay: '10s'}}></div>
        </div>

        <div style={styles.loginContainer}>
          <div style={styles.loginCard}>
            <div style={styles.logoSection}>
              <div style={styles.logoIcon}>
                <FaGraduationCap />
              </div>
              <h1 style={styles.logoTitle}>CareerBot Admin</h1>
              <p style={styles.logoSubtitle}>Professional Admin Dashboard</p>
            </div>

            <div style={styles.welcomeSection}>
              <h2 style={styles.welcomeTitle}>Welcome Back</h2>
              <p style={styles.welcomeText}>Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label htmlFor="email" style={styles.label}>
                  <FaEnvelope /> Email Address
                </label>
                <div style={styles.inputWrapper}>
                  <FaEnvelope style={styles.inputIcon} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="admin@careerbot.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = 'white';
                      e.target.previousElementSibling.style.color = '#667eea';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.previousElementSibling.style.color = '#94a3b8';
                    }}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="password" style={styles.label}>
                  <FaLock /> Password
                </label>
                <div style={styles.inputWrapper}>
                  <FaLock style={styles.inputIcon} />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = 'white';
                      e.target.previousElementSibling.style.color = '#667eea';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.previousElementSibling.style.color = '#94a3b8';
                    }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                style={styles.loginBtn} 
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                {loading ? (
                  <>
                    <FaSpinner style={{animation: 'spin 1s linear infinite'}} />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
