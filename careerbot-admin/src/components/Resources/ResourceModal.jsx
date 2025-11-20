import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const ResourceModal = ({ resource, mode, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState({
    title: resource?.title || '',
    description: resource?.description || '',
    category: resource?.category || 'Course',
    url: resource?.url || '',
    imageUrl: resource?.imageUrl || '',
    tags: resource?.tags?.join(', ') || '',
    difficulty: resource?.difficulty || 'Beginner',
    duration: resource?.duration || '',
    isPremium: resource?.isPremium || false,
    isActive: resource?.isActive ?? true
  });

  const palette = {
    primary: '#6750A4',
    gradient: 'linear-gradient(135deg, #6750A4 0%, #4F378B 100%)',
    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };
    onSave(dataToSave);
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        className="modal-content large-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 12px 40px rgba(103, 80, 164, 0.2)',
          width: '90%',
          maxWidth: '780px',
          padding: '32px',
          position: 'relative',
          animation: 'fadeIn 0.3s ease-in-out',
        }}
      >
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            input, select, textarea {
              transition: all 0.2s ease;
            }
            input:focus, select:focus, textarea:focus {
              border-color: #6750A4 !important;
              box-shadow: 0 0 0 3px rgba(103, 80, 164, 0.15);
            }
            button {
              transition: all 0.3s ease;
            }
          `}
        </style>

        {/* Header */}
        <div
          className="modal-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            borderBottom: '1px solid #eee',
            paddingBottom: '16px',
          }}
        >
          <h2
            style={{
              background: palette.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontSize: '1.6rem',
            }}
          >
            {mode === 'create' ? 'Create New Resource' : 'Edit Resource'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#94a3b8',
              transition: '0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#ef4444';
              e.target.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#94a3b8';
              e.target.style.transform = 'rotate(0deg)';
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <label style={{ fontWeight: 600 }}>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter resource title"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #ddd',
                  fontSize: '0.95rem',
                  marginTop: '6px',
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontWeight: 600 }}>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #ddd',
                  fontSize: '0.95rem',
                  marginTop: '6px',
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Enter resource description"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1.5px solid #ddd',
                fontSize: '0.95rem',
                marginTop: '6px',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <label style={{ fontWeight: 600 }}>URL *</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                placeholder="https://example.com/resource"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #ddd',
                  marginTop: '6px',
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontWeight: 600 }}>Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #ddd',
                  marginTop: '6px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontWeight: 600 }}>Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #ddd',
                  marginTop: '6px',
                }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontWeight: 600 }}>Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 2 hours, 5 days"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #ddd',
                  marginTop: '6px',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="javascript, react, frontend"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1.5px solid #ddd',
                marginTop: '6px',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <input
                type="checkbox"
                name="isPremium"
                checked={formData.isPremium}
                onChange={handleChange}
                style={{ transform: 'scale(1.2)' }}
              />
              Premium
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                style={{ transform: 'scale(1.2)' }}
              />
              Active
            </label>
          </div>

          {/* Footer */}
          <div
            className="modal-footer"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
              marginTop: '24px',
              borderTop: '1px solid #eee',
              paddingTop: '16px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: '2px solid #ccc',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#555',
              }}
              onMouseEnter={(e) => (e.target.style.borderColor = palette.primary)}
              onMouseLeave={(e) => (e.target.style.borderColor = '#ccc')}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: 'none',
                background: palette.gradient,
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(103,80,164,0.3)',
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)')}
            >
              {mode === 'create' ? 'Create Resource' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceModal;
