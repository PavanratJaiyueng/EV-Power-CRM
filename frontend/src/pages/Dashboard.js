import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../api';
import { StatusBadge, ProductBadge, STATUS_CONFIG } from '../components/StatusBadge';
import './Dashboard.css';

const STATUS_COLORS = {
  New: '#0288d1', Contacted: '#f57c00',
  Quotation: '#7b1fa2', Won: '#2e7d32', Lost: '#c62828',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data));
  }, []);

  if (!data) return <div className="loading">⚡ กำลังโหลด...</div>;

  const { total, byStatus, recentLeads } = data;

  const statusOrder = ['New', 'Contacted', 'Quotation', 'Won', 'Lost'];
  const chartData = statusOrder.map(s => ({
    name: s,
    count: byStatus.find(b => b.status === s)?.count || 0,
    color: STATUS_COLORS[s],
  }));

  const statCards = [
    { label: 'ทั้งหมด', value: total, icon: '👥', color: '#1a237e' },
    { label: 'ใหม่', value: byStatus.find(b => b.status === 'New')?.count || 0, icon: '🆕', color: STATUS_COLORS.New },
    { label: 'สำเร็จ', value: byStatus.find(b => b.status === 'Won')?.count || 0, icon: '✅', color: STATUS_COLORS.Won },
    { label: 'เสียลูกค้า', value: byStatus.find(b => b.status === 'Lost')?.count || 0, icon: '❌', color: STATUS_COLORS.Lost },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>ภาพรวมระบบ CRM — EV Power Energy</p>
      </div>

      <div className="stat-cards">
        {statCards.map(c => (
          <div className="stat-card" key={c.label} style={{ borderTop: `4px solid ${c.color}` }}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>สัดส่วน Leads ตามสถานะ</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, count }) => count > 0 ? `${name} (${count})` : ''}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>จำนวน Leads ต่อสถานะ</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-card">
        <div className="recent-header">
          <h3>Leads ล่าสุด</h3>
          <button className="btn-link" onClick={() => navigate('/leads')}>ดูทั้งหมด →</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ชื่อลูกค้า</th>
              <th>เบอร์โทร</th>
              <th>สินค้า</th>
              <th>สถานะ</th>
              <th>งบประมาณ</th>
            </tr>
          </thead>
          <tbody>
            {recentLeads.map(l => (
              <tr key={l.id} onClick={() => navigate(`/leads/${l.id}`)} style={{ cursor: 'pointer' }}>
                <td><strong>{l.customer_name}</strong></td>
                <td>{l.phone}</td>
                <td><ProductBadge product={l.product_interest} /></td>
                <td><StatusBadge status={l.status} /></td>
                <td>{l.budget ? `฿${l.budget.toLocaleString()}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
