import React, { useState, useEffect, useCallback } from 'react';
import { resourceAPI } from '../services/api';
import { toast } from 'react-toastify';
import ResourceModal from '../components/Resources/ResourceModal';
import { FaPlus, FaSearch, FaClock, FaEye, FaLink, FaEdit, FaTrash, FaSpinner, FaBookOpen } from 'react-icons/fa';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: ''
  });
  const [selectedResource, setSelectedResource] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const categories = ['Course', 'Article', 'Video', 'Book', 'Tool', 'Tutorial', 'Other'];

  const categoryColors = {
    course: { bg: 'rgba(103, 80, 164, 0.1)', color: '#6750A4', icon: '🎓' },
    article: { bg: 'rgba(33, 150, 243, 0.1)', color: '#2196F3', icon: '📰' },
    video: { bg: 'rgba(244, 67, 54, 0.1)', color: '#F44336', icon: '🎥' },
    book: { bg: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', icon: '📚' },
    tool: { bg: 'rgba(255, 152, 0, 0.1)', color: '#FF9800', icon: '🛠️' },
    tutorial: { bg: 'rgba(156, 39, 176, 0.1)', color: '#9C27B0', icon: '💡' },
    other: { bg: 'rgba(96, 125, 139, 0.1)', color: '#607D8B', icon: '📋' }
  };

  const difficultyColors = {
    beginner: { bg: '#E8F5E9', color: '#4CAF50' },
    intermediate: { bg: '#FFF3E0', color: '#FF9800' },
    advanced: { bg: '#FFEBEE', color: '#F44336' }
  };

  // ✅ FIX: useCallback ensures ESLint satisfaction
  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const response = await resourceAPI.getResources(filters);
      if (response.data.success) {
        setResources(response.data.data.resources);
        setPagination(response.data.data.pagination);
      }
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleSearch = (e) => setFilters({ ...filters, search: e.target.value, page: 1 });
  const handleCategoryChange = (e) => setFilters({ ...filters, category: e.target.value, page: 1 });

  const handleCreate = () => {
    setSelectedResource(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceAPI.deleteResource(id);
        toast.success('Resource deleted successfully');
        fetchResources();
      } catch {
        toast.error('Failed to delete resource');
      }
    }
  };

  const handleToggleStatus = async (resource) => {
    try {
      await resourceAPI.updateResource(resource._id, { isActive: !resource.isActive });
      toast.success(`Resource ${!resource.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchResources();
    } catch {
      toast.error('Failed to update resource status');
    }
  };

  const handleSave = async (data) => {
    try {
      if (modalMode === 'create') {
        await resourceAPI.createResource(data);
        toast.success('Resource created successfully');
      } else {
        await resourceAPI.updateResource(selectedResource._id, data);
        toast.success('Resource updated successfully');
      }
      setShowModal(false);
      fetchResources();
    } catch {
      toast.error(`Failed to ${modalMode} resource`);
    }
  };

  const shadow = '0 4px 20px rgba(0,0,0,0.08)';

  if (loading && resources.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '60vh'
      }}>
        <FaSpinner style={{
          fontSize: '48px',
          color: '#667eea',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '16px' }}>Loading resources...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      padding: '0',
      background: '#f8fafc',
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#fff', borderRadius: '20px', padding: '28px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '32px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaBookOpen style={{ fontSize: '32px', color: '#667eea' }} />
            Resource Management
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '16px', fontWeight: '500' }}>
            Manage and monitor all learning resources
          </p>
        </div>

        <button
          onClick={handleCreate}
          style={{
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(102,80,164,0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '15px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(102,80,164,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(102,80,164,0.3)';
          }}
        >
          <FaPlus /> Add Resource
        </button>
      </div>

      <div style={{
        display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px'
      }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
          <FaSearch style={{
            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '16px', color: '#94a3b8'
          }} />
          <input
            type="text"
            placeholder="Search resources..."
            value={filters.search}
            onChange={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%', padding: '14px 16px 14px 46px', borderRadius: '14px',
              border: searchFocused ? '2px solid #667eea' : '2px solid #e2e8f0',
              outline: 'none', transition: '0.3s', fontSize: '15px',
              backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <select
          value={filters.category}
          onChange={handleCategoryChange}
          style={{
            padding: '14px 20px',
            border: '2px solid #e2e8f0',
            borderRadius: '14px',
            minWidth: '180px',
            fontSize: '15px',
            cursor: 'pointer',
            backgroundColor: 'white',
            fontWeight: '600',
            color: '#475569',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            fontFamily: 'inherit'
          }}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Resource Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {resources.map((r, i) => {
          const cat = categoryColors[r.category?.toLowerCase()] || categoryColors.other;
          const diff = difficultyColors[r.difficulty?.toLowerCase()] || difficultyColors.beginner;
          return (
            <div
              key={r._id}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: hoveredCard === i ? '0 8px 24px rgba(0,0,0,0.1)' : shadow,
                transition: '0.3s',
                transform: hoveredCard === i ? 'translateY(-6px)' : 'none',
                overflow: 'hidden'
              }}
            >
              <div style={{
                padding: '16px 24px', display: 'flex', justifyContent: 'space-between',
                borderBottom: '1px solid #EEE', background: '#FAFBFC'
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: cat.bg, color: cat.color, fontWeight: 600,
                  padding: '6px 14px', borderRadius: '8px'
                }}>{cat.icon} {r.category}</span>
                <span style={{
                  background: diff.bg, color: diff.color, fontWeight: 600,
                  padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem'
                }}>{r.difficulty}</span>
              </div>

              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '1.1rem', fontWeight: 600, color: '#222', marginBottom: '6px'
                }}>{r.title}</h3>
                <p style={{
                  fontSize: '0.9rem', color: '#555', marginBottom: '12px',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>{r.description}</p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                  {r.duration && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaClock /> {r.duration}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaEye /> {r.viewCount} views
                  </span>
                  {r.isPremium && <span style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: '#7C2D12', padding: '4px 10px', borderRadius: '6px', fontWeight: 700
                  }}>⭐ Premium</span>}
                </div>
              </div>

              <div style={{
                borderTop: '1px solid #EEE',
                padding: '16px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFBFC'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ position: 'relative', width: '44px', height: '24px' }}>
                    <input
                      type="checkbox"
                      checked={r.isActive}
                      onChange={() => handleToggleStatus(r)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: r.isActive ? '#4CAF50' : '#CCC', borderRadius: '24px',
                      transition: '0.3s'
                    }}>
                      <span style={{
                        position: 'absolute', height: '18px', width: '18px', left: '3px', bottom: '3px',
                        background: '#fff', borderRadius: '50%',
                        transform: r.isActive ? 'translateX(20px)' : 'none', transition: '0.3s'
                      }}></span>
                    </span>
                  </label>
                  <span style={{
                    color: r.isActive ? '#4CAF50' : '#999', fontWeight: 600
                  }}>{r.isActive ? 'Active' : 'Inactive'}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => window.open(r.url, '_blank')}
                    style={{
                      background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: '10px',
                      padding: '10px', cursor: 'pointer', color: '#3b82f6', fontSize: '16px',
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(59,130,246,0.1)';
                      e.target.style.color = '#3b82f6';
                    }}
                  ><FaLink /></button>
                  <button
                    onClick={() => handleEdit(r)}
                    style={{
                      background: 'rgba(245,158,11,0.1)', border: 'none', borderRadius: '10px',
                      padding: '10px', cursor: 'pointer', color: '#f59e0b', fontSize: '16px',
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(245,158,11,0.1)';
                      e.target.style.color = '#f59e0b';
                    }}
                  ><FaEdit /></button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    style={{
                      background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '10px',
                      padding: '10px', cursor: 'pointer', color: '#ef4444', fontSize: '16px',
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(239,68,68,0.1)';
                      e.target.style.color = '#ef4444';
                    }}
                  ><FaTrash /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <ResourceModal
          resource={selectedResource}
          mode={modalMode}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          categories={categories}
        />
      )}
    </div>
  );
};

export default Resources;
