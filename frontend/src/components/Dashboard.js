import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ token, setToken }) {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      const [statsRes, itemsRes, customersRes, salesRes] = await Promise.all([
        axios.get('/api/sales/stats/summary', config),
        axios.get('/api/items', config),
        axios.get('/api/customers', config),
        axios.get('/api/sales', config)
      ]);
      
      setStats(statsRes.data.result || statsRes.data.data);
      setItems(itemsRes.data.result?.items || itemsRes.data.data || []);
      setCustomers(customersRes.data.result?.customers || customersRes.data.data || []);
      setSales(salesRes.data.result?.sales || salesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        setToken(null);
      }
    }
  };

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <div className="dashboard">
      <header>
        <h1>Smart Canteen Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Sales</h3>
            <p>{stats.summary.totalSales}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p>₹{stats.summary.totalRevenue?.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Items</h3>
            <p>{items.length}</p>
          </div>
          <div className="stat-card">
            <h3>Customers</h3>
            <p>{customers.length}</p>
          </div>
        </div>
      )}

      <div className="data-section">
        <h2>Recent Sales</h2>
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.slice(0, 5).map(sale => (
              <tr key={sale._id}>
                <td>{sale.invoiceNumber}</td>
                <td>{sale.customer?.companyName}</td>
                <td>₹{sale.totalAmount}</td>
                <td>{sale.paymentStatus}</td>
                <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
