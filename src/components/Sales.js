import React, { useEffect, useState } from 'react';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';
import axios from "axios";
import { Pagination } from 'react-bootstrap';
import '../assets/table.css';

const SalesList = () => {
    const [sales, setSales] = useState([]);
    const [originalSales, setOriginalSales] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [salesPerPage, setSalesPerPage] = useState(5);
    const [sortBy, setSortBy] = useState({ key: '', order: '' });

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = () => {
        axios.get('http://localhost:80/api/sales.php/')
            .then(response => {
                if (Array.isArray(response.data)) {
                    setSales(response.data);
                    setOriginalSales(response.data);
                } else {
                    console.error('Sales data is not an array');
                }
            })
            .catch(error => {
                console.error('Error fetching sales:', error);
            });
    };

    const handleFilter = (event) => {
        const searchText = event.target.value.toLowerCase();
        const filteredSales = originalSales.filter(sale => 
            String(sale.order_id).toLowerCase().includes(searchText) ||
            String(sale.product_name).toLowerCase().includes(searchText) ||
            String(sale.order_date).toLowerCase().includes(searchText) ||
            String(sale.total).toLowerCase().includes(searchText)
        );
        setSales(searchText ? filteredSales : originalSales);
    };

    const handleSort = (key) => {
        let order = 'asc';
        if (sortBy.key === key && sortBy.order === 'asc') {
            order = 'desc';
        }
        setSortBy({ key: key, order: order });
        const sortedSales = [...sales].sort((a, b) => {
            const valueA = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
            const valueB = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];
            if (valueA < valueB) {
                return order === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return order === 'asc' ? 1 : -1;
            }
            return 0;
        });
        setSales(sortedSales);
    };

    const getSortIcon = (key) => {
        if (sortBy.key === key) {
            return sortBy.order === 'asc' ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />;
        }
        return null;
    };

    // Separate Date and Time formatting functions
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options); // Only date
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        return date.toLocaleTimeString('en-US', timeOptions); // Only time in 12-hour format
    };

    const formatCurrency = (amount) => {
        return parseFloat(amount).toLocaleString('en-US', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const indexOfLastSale = currentPage * salesPerPage;
    const indexOfFirstSale = indexOfLastSale - salesPerPage;
    const currentSales = sales.slice(indexOfFirstSale, indexOfLastSale);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handlePerPageChange = (e) => {
        setCurrentPage(1);
        setSalesPerPage(Number(e.target.value));
    };

    return (
        <div className='container mt-4'>
            <h1 style={{ textAlign: 'left', fontWeight: 'bold' }}>Sales List</h1>
            <div className='d-flex justify-content-between align-items-center'>
                <div className="input-group" style={{ width: '25%', marginBottom: '10px' }}>
                    <input type="text" className="form-control" onChange={handleFilter} placeholder="Search" />
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-striped table-hover custom-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th className="text-center" onClick={() => handleSort('order_id')}>
                                Order #{getSortIcon('order_id')}
                            </th>
                            <th className="text-center" onClick={() => handleSort('product_name')}>
                                Product/Service Sold {getSortIcon('product_name')}
                            </th>
                            <th className="text-center" onClick={() => handleSort('order_date')}>
                                Date of Sale {getSortIcon('order_date')}
                            </th>
                            <th className="text-center" onClick={() => handleSort('order_date')}>
                                Time of Sale {getSortIcon('order_date')}
                            </th>
                            <th className="text-center" onClick={() => handleSort('quantity')}>
                                Quantity {getSortIcon('quantity')}
                            </th>
                            <th className="text-center" onClick={() => handleSort('total')}>
                                Total {getSortIcon('total')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSales.map((sale, key) => (
                            <tr key={key}>
                                <td className="text-center">{sale.order_id}</td>
                                <td className="text-center">{sale.product_name}</td>
                                <td className="text-center">{formatDate(sale.order_date)}</td>
                                <td className="text-center">{formatTime(sale.order_date)}</td>
                                <td className="text-center">{sale.quantity}</td>
                                <td className="text-center">{formatCurrency(sale.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="d-flex justify-content-between mb-3">
                <div className="d-flex align-items-center">
                    <div className="col-md-auto">
                        <label htmlFor="itemsPerPage" className="form-label me-2">Items per page:</label>
                    </div>
                    <div className="col-md-5">
                        <select id="itemsPerPage" className="form-select" value={salesPerPage} onChange={handlePerPageChange}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
                <Pagination>
                    {Array.from({ length: Math.ceil(sales.length / salesPerPage) }, (_, index) => (
                        <Pagination.Item key={index} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                            {index + 1}
                        </Pagination.Item>
                    ))}
                </Pagination>
            </div>
        </div>
    );
};

export default SalesList;
