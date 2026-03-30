import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { StatusBadge, ProductBadge } from '../components/StatusBadge';
import LeadForm from '../components/LeadForm';
import './LeadDetail.css';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const fetchLead = async () => {
    const res = await api.get(`/leads/${id}`);
    setLead(res.data);
  };

  useEffect(() => { fetchLead(); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('ลบ lead นี้?')) return;
    await api.delete(`/leads/${id}`);
    navigate('/leads');
  };

  if (!lead) return <div className="loading">⚡ กำลังโหลด...</div>;

  const fields = [
    { label: 'ชื่อลูกค้า', value: lead.customer_name },
    { label: 'เบอร์โทร', value: lead.phone },
    { label: 'สินค้าที่สนใจ', value: <ProductBadge product={lead.product_interest} /> },
    { label: 'งบประมาณ', value: lead.budget ? `฿${Number(lead.budget).toLocaleString()}` : '-' },
    { label: 'สถานะ', value: <StatusBadge status={lead.status} /> },
    { label: 'วันที่สร้าง', value: new Date(lead.created_at + 'Z').toLocaleString('th-TH') },
    { label: 'อัปเดตล่าสุด', value: new Date(lead.updated_at + 'Z').toLocaleString('th-TH') },
  ];

  return (
    <div className="lead-detail">
      <div className="detail-nav">
        <button className="btn-back" onClick={() => navigate('/leads')}>← กลับ</button>
        <div className="detail-actions">
          <button className="btn-edit" onClick={() => setShowEdit(true)}>✏️ แก้ไข</button>
          <button className="btn-del" onClick={handleDelete}>🗑 ลบ</button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="detail-card">
            <div className="detail-title-row">
              <h1>{lead.customer_name}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <div className="detail-fields">
              {fields.map(f => (
                <div className="detail-field" key={f.label}>
                  <span className="field-label">{f.label}</span>
                  <span className="field-value">{f.value}</span>
                </div>
              ))}
            </div>
            {lead.note && (
              <div className="detail-note">
                <div className="note-label">📝 หมายเหตุ</div>
                <div className="note-text">{lead.note}</div>
              </div>
            )}
          </div>
        </div>

        <div className="detail-side">
          <div className="detail-card">
            <h3>📋 Activity Log</h3>
            {lead.activities?.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: 13, marginTop: 12 }}>ยังไม่มี activity</p>
            ) : (
              <div className="activity-list">
                {lead.activities?.map(a => (
                  <div className="activity-item" key={a.id}>
                    <div className="activity-action">{a.action}</div>
                    {a.old_value && a.new_value && (
                      <div className="activity-change">
                        <span className="old">{a.old_value}</span>
                        <span> → </span>
                        <span className="new">{a.new_value}</span>
                      </div>
                    )}
                    {!a.old_value && a.new_value && (
                      <div className="activity-change"><span className="new">{a.new_value}</span></div>
                    )}
                    <div className="activity-time">
                      {new Date(a.created_at + 'Z').toLocaleString('th-TH')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <LeadForm
          lead={lead}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); fetchLead(); }}
        />
      )}
    </div>
  );
}
