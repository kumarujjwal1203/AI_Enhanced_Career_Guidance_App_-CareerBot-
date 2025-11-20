import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';
import UserModal from '../components/Users/UserModal';
import { FaSearch, FaEye, FaEdit, FaTrash, FaUsers, FaChevronLeft, FaChevronRight, FaSpinner } from 'react-icons/fa';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    isActive: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUsers(filters);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSearch = (e) => setFilters({ ...filters, search: e.target.value, page: 1 });
  const handleFilterChange = (e) => setFilters({ ...filters, isActive: e.target.value, page: 1 });
  const handlePageChange = (newPage) => setFilters({ ...filters, page: newPage });

  const handleEdit = async (user) => {
    try {
      const response = await userAPI.getUser(user._id);
      if (response.data.success) {
        setSelectedUser(response.data.data.user);
        setShowModal(true);
      }
    } catch {
      toast.error('Failed to load user details');
    }
  };

  const handleViewDetails = async (user) => {
    try {
      const response = await userAPI.getUser(user._id);
      if (response.data.success) {
        setSelectedUser(response.data.data);
        setShowDetails(true);
      }
    } catch {
      toast.error('Failed to load user details');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleSave = async (userData) => {
    try {
      await userAPI.updateUser(selectedUser._id, userData);
      toast.success('User updated successfully');
      setShowModal(false);
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const mainColor = '#667eea';
  const textColor = '#1e293b';

  if (loading && users.length === 0) {
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
          color: mainColor,
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>Loading users...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '0', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ 
        marginBottom: '32px',
        background: 'white',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 700, 
          color: textColor, 
          margin: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaUsers style={{ fontSize: '32px', color: mainColor }} />
          User Management
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px', fontWeight: '500' }}>
          Manage and monitor all platform users
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <FaSearch style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '16px',
            color: '#94a3b8'
          }} />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={filters.search}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '14px 16px 14px 46px',
              borderRadius: '14px',
              border: '2px solid #e2e8f0',
              fontSize: '15px',
              outline: 'none',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.3s',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = mainColor;
              e.target.style.boxShadow = `0 0 0 3px rgba(102, 126, 234, 0.1)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
          />
        </div>

        <select
          value={filters.isActive}
          onChange={handleFilterChange}
          style={{
            padding: '14px 20px',
            border: '2px solid #e2e8f0',
            borderRadius: '14px',
            fontSize: '15px',
            outline: 'none',
            background: 'white',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            minWidth: '160px',
            fontWeight: '600',
            color: '#475569',
            fontFamily: 'inherit'
          }}
        >
          <option value="">All Users</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
          }}>
            <tr>
              {['User', 'Email', 'Joined', 'Status', 'Quiz Stats', 'Actions'].map((head) => (
                <th
                  key={head}
                  style={{
                    padding: '18px 20px',
                    textAlign: 'left',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '2px solid #e2e8f0'
                  }}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  <FaSpinner style={{
                    fontSize: '36px',
                    color: mainColor,
                    animation: 'spin 1s linear infinite',
                    marginBottom: '12px'
                  }} />
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>Loading users...</div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>
                    <FaUsers />
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#475569' }}>No users found</div>
                  <div style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your search or filters</div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr 
                  key={user._id} 
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '18px',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>
                          {user.name || 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                          ID: {user._id.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px', color: '#475569', fontSize: '15px', fontWeight: '500' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '18px 20px', color: '#64748b', fontSize: '14px' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        background: user.isActive ? 
                          'linear-gradient(135deg, #10b981 0%, #34d399 100%)' : 
                          'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '13px',
                        boxShadow: user.isActive ? 
                          '0 2px 8px rgba(16, 185, 129, 0.3)' : 
                          '0 2px 8px rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    <div>
                      <div style={{ fontSize: '15px', color: '#475569', fontWeight: '600' }}>
                        {user.quizStats?.totalAttempts || 0} attempts
                      </div>
                      <div style={{ fontSize: '13px', color: mainColor, fontWeight: 700, marginTop: '4px' }}>
                        {user.quizStats?.averageScore || 0}% avg
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleViewDetails(user)}
                        title="View Details"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.2) 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px',
                          cursor: 'pointer',
                          color: '#3b82f6',
                          fontSize: '16px',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.2) 100%)';
                          e.target.style.color = '#3b82f6';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        title="Edit User"
                        style={{
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.2) 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px',
                          cursor: 'pointer',
                          color: '#f59e0b',
                          fontSize: '16px',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.2) 100%)';
                          e.target.style.color = '#f59e0b';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        title="Delete User"
                        style={{
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.2) 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px',
                          cursor: 'pointer',
                          color: '#ef4444',
                          fontSize: '16px',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.2) 100%)';
                          e.target.style.color = '#ef4444';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '28px',
            background: 'white',
            padding: '20px 28px',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}
        >
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
            style={{
              background: filters.page === 1 ? '#f1f5f9' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: filters.page === 1 ? '#94a3b8' : 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              cursor: filters.page === 1 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s',
              boxShadow: filters.page === 1 ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (filters.page !== 1) {
                e.target.style.transform = 'translateX(-4px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateX(0)';
              e.target.style.boxShadow = filters.page === 1 ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
          >
            <FaChevronLeft /> Previous
          </button>

          <div style={{ fontSize: '15px', color: '#475569', textAlign: 'center', fontWeight: '600' }}>
            Page <span style={{ 
              color: mainColor, 
              fontSize: '18px',
              fontWeight: '700',
              padding: '0 8px'
            }}>{pagination.currentPage}</span> of {pagination.totalPages}
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: '500' }}>
              ({pagination.totalUsers} total users)
            </div>
          </div>

          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page === pagination.totalPages}
            style={{
              background: filters.page === pagination.totalPages ? '#f1f5f9' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: filters.page === pagination.totalPages ? '#94a3b8' : 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              cursor: filters.page === pagination.totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s',
              boxShadow: filters.page === pagination.totalPages ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (filters.page !== pagination.totalPages) {
                e.target.style.transform = 'translateX(4px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateX(0)';
              e.target.style.boxShadow = filters.page === pagination.totalPages ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
          >
            Next <FaChevronRight />
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {/* View Details */}
      {showDetails && selectedUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center'
            }}
          >
            <h2 style={{ color: mainColor }}>User Details</h2>
            <p style={{ color: '#555', marginTop: '12px' }}>{selectedUser?.user?.email}</p>
            <button
              onClick={() => setShowDetails(false)}
              style={{
                background: mainColor,
                color: 'white',
                padding: '10px 24px',
                border: 'none',
                borderRadius: '10px',
                marginTop: '24px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
