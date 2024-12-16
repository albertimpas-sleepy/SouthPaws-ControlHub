import React, { useState, useEffect } from 'react'; 
import axios from "axios";
import { Pagination } from 'react-bootstrap';
import '../assets/table.css';

const LogHistory = () => {
    const [logs, setLogs] = useState([]);
    const [originalLogs, setOriginalLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage, setLogsPerPage] = useState(5); 
    const [sortBy, setSortBy] = useState({ key: '', order: '' });

    const handleFilter = (event) => {
        const searchText = event.target.value.toLowerCase();
        const newData = originalLogs.filter(row => {
            return (
                String(row.id).toLowerCase().includes(searchText) ||
                String(row.username).toLowerCase().includes(searchText) ||
                String(row.event_type).toLowerCase().includes(searchText)
            );
        });
        setLogs(searchText ? newData : originalLogs);
    };
    
    useEffect(() => {
        getLogs();
    }, []);

    const getLogs = () => {
        axios.get('http://localhost:80/api/logs.php/')
            .then(response => {
                console.log(response.data);
                if (Array.isArray(response.data.logs)) {
                    setLogs(response.data.logs);
                    setOriginalLogs(response.data.logs);
                } else {
                    console.error('Logs data is not an array');
                }
            })
            .catch(error => {
                console.error('Error fetching logs:', error);
            });
    };

    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handlePerPageChange = (e) => {
        setCurrentPage(1);
        setLogsPerPage(Number(e.target.value));
    };

    const handleSort = (key) => {
        let order = 'asc';
        if (sortBy.key === key && sortBy.order === 'asc') {
            order = 'desc';
        }
        setSortBy({ key: key, order: order });
        const sortedLogs = [...logs].sort((a, b) => {
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
        setLogs(sortedLogs);
    };

    const getSortIcon = (key) => {
        if (sortBy.key === key) {
            return sortBy.order === 'asc' ? '▲' : '▼';
        }
        return null;
    };

    return (
        <div className='container mt-4'>
            <h1 style={{ textAlign: 'left', fontWeight: 'bold' }}>Log History</h1>
            <div className='d-flex justify-content-between align-items-center'>
                <div className="input-group" style={{ width: '25%', marginBottom: '10px' }}>
                    <input type="text" className="form-control" onChange={handleFilter} placeholder="Search" />
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-striped table-hover custom-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th className="text-center" onClick={() => handleSort('id')}>
                                ID
                                {getSortIcon('id')} 
                            </th>
                            <th className="text-center" onClick={() => handleSort('username')}>
                                Username
                                {getSortIcon('username')} 
                            </th>
                            <th className="text-center" onClick={() => handleSort('event_type')}>
                                Event Type
                                {getSortIcon('event_type')} 
                            </th>
                            <th className="text-center" onClick={() => handleSort('event_time')}>
                                Event Time
                                {getSortIcon('event_time')} 
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentLogs.map((log, key) =>
                            <tr key={key}>
                                <td className="text-center">{log.id}</td>
                                <td className="text-center">{log.username}</td>
                                <td className="text-center">{log.event_type}</td>
                                <td className="text-center">{log.event_time}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="d-flex justify-content-between mb-3">
                <div className="d-flex align-items-center">
                    <div className="col-md-auto">
                        <label htmlFor="itemsPerPage" className="form-label me-2">Items per page:</label>
                    </div>
                    <div className="col-md-5">
                        <select id="itemsPerPage" className="form-select" value={logsPerPage} onChange={handlePerPageChange}>
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
                    {Array.from({length: Math.ceil(logs.length / logsPerPage)}, (_, index) => (
                        <Pagination.Item key={index} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                            {index + 1}
                        </Pagination.Item>
                    ))}
                </Pagination>
            </div>
        </div>
    );
}

export default LogHistory;
