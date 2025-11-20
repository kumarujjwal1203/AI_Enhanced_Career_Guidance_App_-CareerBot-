import React, { useState } from 'react';

const UserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    phone: user?.phone || '',
    isActive: user?.isActive ?? true
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-out'
  };

  const modalContentStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '24px',
    width: '90%',
    maxWidth: '540px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 24px 48px rgba(103, 80, 164, 0.25), 0 8px 16px rgba(0, 0, 0, 0.1)',
    animation: 'slideUp 0.3s ease-out',
    border: '1px solid rgba(103, 80, 164, 0.1)'
  };

  const modalHeaderStyle = {
    padding: '32px 32px 24px 32px',
    borderBottom: '2px solid rgba(103, 80, 164, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, rgba(103, 80, 164, 0.05) 0%, rgba(103, 80, 164, 0.02) 100%)'
  };

  const headerTitleStyle = {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #6750A4 0%, #8B5CF6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px'
  };

  const closeBtnStyle = {
    background: 'rgba(103, 80, 164, 0.1)',
    border: 'none',
    borderRadius: '12px',
    width: '40px',
    height: '40px',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6750A4',
    transition: 'all 0.2s ease',
    fontWeight: '300'
  };

  const modalFormStyle = {
    padding: '32px'
  };

  const formGroupStyle = {
    marginBottom: '24px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4A5568',
    letterSpacing: '0.3px',
    textTransform: 'uppercase'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    fontSize: '16px',
    border: '2px solid #E2E8F0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    fontFamily: 'inherit',
    color: '#2D3748',
    boxSizing: 'border-box'
  };

  const checkboxGroupStyle = {
    marginTop: '28px',
    padding: '20px',
    backgroundColor: 'rgba(103, 80, 164, 0.05)',
    borderRadius: '16px',
    border: '2px solid rgba(103, 80, 164, 0.15)'
  };

  const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#2D3748'
  };

  const checkboxInputStyle = {
    width: '22px',
    height: '22px',
    marginRight: '14px',
    cursor: 'pointer',
    accentColor: '#6750A4',
    transform: 'scale(1.1)'
  };

  const modalFooterStyle = {
    padding: '24px 32px 32px 32px',
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
    borderTop: '2px solid rgba(103, 80, 164, 0.1)',
    background: 'linear-gradient(180deg, rgba(103, 80, 164, 0.02) 0%, transparent 100%)'
  };

  const btnSecondaryStyle = {
    padding: '14px 32px',
    fontSize: '15px',
    fontWeight: '600',
    border: '2px solid #E2E8F0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#4A5568',
    letterSpacing: '0.3px',
    minWidth: '120px'
  };

  const btnPrimaryStyle = {
    padding: '14px 32px',
    fontSize: '15px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'linear-gradient(135deg, #6750A4 0%, #8B5CF6 100%)',
    color: 'white',
    letterSpacing: '0.3px',
    minWidth: '120px',
    boxShadow: '0 4px 12px rgba(103, 80, 164, 0.3)'
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes slideUp {
            from {
              transform: translateY(30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={modalOverlayStyle} onClick={onClose}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <div style={modalHeaderStyle}>
            <h2 style={headerTitleStyle}>
              {user ? 'Edit User' : 'Add New User'}
            </h2>
            <button 
              style={closeBtnStyle} 
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(103, 80, 164, 0.2)';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(103, 80, 164, 0.1)';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} style={modalFormStyle}>
            <div style={formGroupStyle}>
              <label htmlFor="email" style={labelStyle}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6750A4';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103, 80, 164, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="user@example.com"
              />
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="name" style={labelStyle}>Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6750A4';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103, 80, 164, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="John Doe"
              />
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="phone" style={labelStyle}>Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6750A4';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103, 80, 164, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div style={checkboxGroupStyle}>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  style={checkboxInputStyle}
                />
                <span>Active User</span>
              </label>
            </div>

            <div style={modalFooterStyle}>
              <button 
                type="button" 
                style={btnSecondaryStyle} 
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F7FAFC';
                  e.currentTarget.style.borderColor = '#6750A4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={btnPrimaryStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(103, 80, 164, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(103, 80, 164, 0.3)';
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UserModal;
