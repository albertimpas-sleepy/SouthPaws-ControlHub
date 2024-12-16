import React, { useState, useEffect } from 'react';
import { BsArrowRightCircleFill } from 'react-icons/bs';
import { Link } from "react-router-dom";
import axios from 'axios';
import { FaBox, FaUserTie, FaTags, FaClipboardList } from 'react-icons/fa';

// Reusable Card Component
const Card = ({ title, value, link, color, icon }) => (
  <div className="card" style={{ width: "24rem", backgroundColor: color, border: "none", margin: '10px' }}>
    <div className="card-body">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h5 className="card-title" style={{ fontSize: '28px', color: 'white', fontWeight: 'bold' }}>{value}</h5>
          <p className="card-text" style={{ fontSize: '28px', color: 'white', fontWeight: 'bold' }}>{title}</p>
        </div>
        <div>
          {icon}
        </div>
      </div>
    </div>
    <Link to={link} className="btn btn-primary" style={{ backgroundColor: color, border: 'none', fontSize: '22px', fontWeight: '700' }}>
      View <BsArrowRightCircleFill />
    </Link>
  </div>
);

const Dashboard = () => {
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalSuppliers, setTotalSuppliers] = useState(0);

  const totalRevenue = 7890; // Replace with actual value

  useEffect(() => {
    axios.get('http://localhost:80/api/category.php/')
      .then(response => setTotalCategories(response.data.total_categories))
      .catch(error => console.error('Error fetching total categories:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:80/api/products.php/')
      .then(response => setTotalProducts(response.data.total_products))
      .catch(error => console.error('Error fetching total products:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:80/api/suppliers.php/')
      .then(response => setTotalSuppliers(response.data.total_suppliers))
      .catch(error => console.error('Error fetching total appointments:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:80/api/clients.php/')
      .then(response => setTotalClients(response.data.total_clients))
      .catch(error => console.error('Error fetching total clients:', error));
  }, []);

  return (
    <div className='container mt-4'>
      <h1 style={{ textAlign: 'left', fontWeight: 'bold' }}>Dashboard</h1>
      <div className='card-container' style={{ display: 'flex', flexWrap: 'wrap' }}>
      <Card
          title="Products"
          value={totalProducts}
          link="/products"
          color="#31B44C"
          icon={<FaBox size={50} style={{ fill: '#fff' }} />}
        />
        <Card
          title="Categories"
          value={totalCategories}
          link="/category"
          color="#006CB7"
          icon={<FaTags size={50} style={{ fill: '#fff' }} />}
        />
        <Card
          title="Suppliers"
          value={totalSuppliers}
          link="/suppliers"
          color="#31B44C"
          icon={<FaUserTie size={50} style={{ fill: '#fff' }} />}
        />
        <Card
          title="Clients"
          value={totalClients}
          link="/information/clients"
          color="#006CB7"
          icon={<FaClipboardList size={50} style={{ fill: '#fff' }} />}
        />
        <Card
          title="Total Revenue"
          value={`₱ ${totalRevenue}`}
          link="/revenue"
          color="#31B44C"
          icon={<FaBox size={50} style={{ fill: '#fff' }} />}
        />
      </div>
    </div>
  );
}

export default Dashboard;
