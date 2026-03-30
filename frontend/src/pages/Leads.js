import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { StatusBadge, ProductBadge, STATUS_LIST, PRODUCT_LIST } from '../components/StatusBadge';
import LeadForm from '../components/LeadForm';
import './Leads.css';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus !== 'All') params.status = filterStatus;
      const res = await api.get('/leads', { params });
      setLeads(res.data);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const deleteLead = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('ลบ lead นี้?')) return;
    await api.delete(`/leads/${id}`);
    fetchLeads();
  };

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div>
          <h1>Leads</h1>
          <p>ทั้งหมด {leads.length} รายการ</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + เพิ่ม Lead ใหม่
        </button>
      </div>

      <div className="leads-toolbar">
        <input
          className="search-input"
          placeholder="🔍 ค้นหาชื่อหรือเบอร์..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-tabs">
          {['All', ...STATUS_LIST].map(s => (
            <button
              key={s}
              className={`filter-tab ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'All' ? 'ทั้งหมด' : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">⚡ กำลังโหลด...</div>
      ) : leads.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>📭</div>
          <p>ไม่พบ Lead ที่ค้นหา</p>
        </div>
      ) : (
        <div className="leads-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ชื่อลูกค้า</th>
                <th>เบอร์โทร</th>
                <th>สินค้าที่สนใจ</th>
                <th>งบประมาณ</th>
                <th>สถานะ</th>
                <th>วันที่สร้าง</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id} onClick={() => navigate(`/leads/${l.id}`)} style={{ cursor: 'pointer' }}>
                  <td style={{ color: '#aaa', fontSize: 12 }}>{l.id}</td>
                  <td><strong>{l.customer_name}</strong></td>
                  <td>{l.phone}</td>
                  <td><ProductBadge product={l.product_interest} /></td>
                  <td>{l.budget ? `฿${Number(l.budget).toLocaleString()}` : '-'}</td>
                  <td><StatusBadge status={l.status} /></td>
                  <td style={{ fontSize: 12, color: '#888' }}>
                    {new Date(l.created_at + 'Z').toLocaleDateString('th-TH')}
                  </td>
                  <td>
                    <button className="btn-delete" onClick={e => deleteLead(e, l.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <LeadForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchLeads(); }}
        />
      )}
    </div>
  );
}
