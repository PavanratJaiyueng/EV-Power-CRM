import React, { useState, useEffect } from 'react';
import api from '../api';
import { STATUS_LIST, PRODUCT_LIST } from './StatusBadge';
import './LeadForm.css';

const DEFAULT = {
  customer_name: '', phone: '', product_interest: 'Solar',
  budget: '', status: 'New', note: '',
};

export default function LeadForm({ lead, onClose, onSaved }) {
  const [form, setForm] = useState(DEFAULT);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) setForm({ ...DEFAULT, ...lead, budget: lead.budget ?? '' });
  }, [lead]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, budget: form.budget ? Number(form.budget) : null };
      if (lead) await api.put(`/leads/${lead.id}`, payload);
      else await api.post('/leads', payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{lead ? 'แก้ไข Lead' : 'เพิ่ม Lead ใหม่'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="lead-form">
          <div className="form-row">
            <div className="form-group">
              <label>ชื่อลูกค้า *</label>
              <input value={form.customer_name} onChange={e => set('customer_name', e.target.value)} required placeholder="กรอกชื่อลูกค้า" />
            </div>
            <div className="form-group">
              <label>เบอร์โทร *</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="0xx-xxx-xxxx" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>สินค้าที่สนใจ *</label>
              <select value={form.product_interest} onChange={e => set('product_interest', e.target.value)}>
                {PRODUCT_LIST.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>งบประมาณ (บาท)</label>
              <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="เช่น 150000" min="0" />
            </div>
          </div>
          <div className="form-group">
            <label>สถานะ</label>
            <div className="status-radio">
              {STATUS_LIST.map(s => (
                <label key={s} className={`radio-pill ${form.status === s ? 'selected' : ''}`}>
                  <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => set('status', s)} />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>หมายเหตุ</label>
            <textarea value={form.note} onChange={e => set('note', e.target.value)} rows={3} placeholder="บันทึกข้อมูลเพิ่มเติม..." />
          </div>
          {error && <div className="form-error">⚠ {error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>ยกเลิก</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : lead ? 'บันทึกการแก้ไข' : 'เพิ่ม Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
