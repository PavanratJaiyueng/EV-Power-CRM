import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Activities.css';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/activities').then(r => {
      setActivities(r.data);
      setLoading(false);
    });
  }, []);

  const ACTION_ICON = {
    'Created lead': '🆕',
    'Status changed': '🔄',
    'Note updated': '📝',
  };

  return (
    <div className="activities-page">
      <div className="page-header">
        <h1>Activity Log</h1>
        <p>บันทึกการเปลี่ยนแปลงทั้งหมดในระบบ</p>
      </div>

      {loading ? (
        <div className="loading">⚡ กำลังโหลด...</div>
      ) : activities.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>📋</div>
          <p>ยังไม่มี activity</p>
        </div>
      ) : (
        <div className="activity-timeline">
          {activities.map(a => (
            <div className="timeline-item" key={a.id}>
              <div className="timeline-icon">
                {ACTION_ICON[a.action] || '📌'}
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-action">{a.action}</span>
                  <span className="timeline-lead" onClick={() => navigate(`/leads/${a.lead_id}`)}>
                    👤 {a.customer_name}
                  </span>
                </div>
                {a.old_value && a.new_value && (
                  <div className="timeline-change">
                    <span className="t-old">{a.old_value}</span>
                    <span className="t-arrow">→</span>
                    <span className="t-new">{a.new_value}</span>
                  </div>
                )}
                {!a.old_value && a.new_value && (
                  <div className="timeline-change">
                    <span className="t-new">{a.new_value}</span>
                  </div>
                )}
                <div className="timeline-time">
                  {new Date(a.created_at + 'Z').toLocaleString('th-TH')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
