import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firestore } from '../firebase';
import './Empolyer.css';

function Empolyer() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const location = useLocation();

  // Helper function to mask passport number
  const maskPassportNumber = (passportNumber) => {
    if (!passportNumber) return 'N/A';
    if (passportNumber.length <= 4) return passportNumber;
    
    const firstTwo = passportNumber.substring(0, 2);
    const lastTwo = passportNumber.substring(passportNumber.length - 2);
    const maskedLength = passportNumber.length - 4;
    
    return `${firstTwo}${'*'.repeat(maskedLength)}${lastTwo}`;
  };

  // Get document type from URL parameters
  const getDocumentTypeFromURL = () => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('type') || 'all';
  };

  const documentType = getDocumentTypeFromURL();

  // Apply filtering based on document type and search term
  const applyFilter = React.useCallback((data, docType, search) => {
    let filtered = data;

    // Filter by document type if not 'all'
    if (docType !== 'all') {
      const typeMap = {
        'immigration': 'immigration',
        'work_permit': 'work_permit', 
        'lmis': 'lmis',
        'job_offer': 'job_offer',
        'visa': 'visa'
      };
      
      const targetType = typeMap[docType];
      if (targetType) {
        filtered = filtered.filter(applicant => 
          applicant.documentType === targetType
        );
      }
    }

    // Filter by search term
    if (search.trim() !== '') {
      filtered = filtered.filter(applicant =>
        applicant.name.toLowerCase().includes(search.toLowerCase()) ||
        applicant.passportNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredApplicants(filtered);
  }, []);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        
        // Get all applicants (we'll filter client-side due to nested structure)
        const applicantsQuery = query(
          collection(firestore, 'applicants'),
          orderBy('uploadedAt', 'desc')
        );

        const querySnapshot = await getDocs(applicantsQuery);
        const applicantsData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          applicantsData.push({
            id: doc.id,
            name: data.name,
            passportNumber: data.passportNumber,
            documentType: data.documentType,
            status: data.status,
            uploadedAt: data.uploadedAt,
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            docPassword: data.docPassword
          });
        });
        
        setApplicants(applicantsData);
        
        // Apply initial filter based on URL parameter
        applyFilter(applicantsData, documentType, searchTerm);
      } catch (error) {
        console.error('Error fetching applicants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [documentType, applyFilter, searchTerm]); // Fixed: added searchTerm and applyFilter to dependencies

  // Update filtered applicants when search term changes
  useEffect(() => {
    applyFilter(applicants, documentType, searchTerm);
  }, [searchTerm, applicants, documentType, applyFilter]);

  const getPageTitle = () => {
    const titles = {
      'immigration': 'Immigration Documents',
      'work_permit': 'Work Permit Documents', 
      'lmis': 'LMIA Documents',
      'job_offer': 'Job Offer Documents',
      'visa': 'Visa Documents',
      'all': 'All Documents'
    };
    return titles[documentType] || 'Documents';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', label: 'Pending' },
      approved: { class: 'status-approved', label: 'Approved' },
      rejected: { class: 'status-rejected', label: 'Rejected' }
    };
    
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDocumentType = (type) => {
    const typeMap = {
      'immigration': 'Immigration',
      'work_permit': 'Work Permit',
      'lmis': 'LMIA',
      'job_offer': 'Job Offer',
      'visa': 'Visa'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="employer-page">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-page">
      <div className="employer-container">
        <div className="page-header">
          <h1>{getPageTitle()}</h1>
          <p>View and manage applicant documents</p>
        </div>

        <div className="controls-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or passport number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-info">
            <span className="results-count">
              Showing {filteredApplicants.length} of {applicants.length} documents
            </span>
          </div>
        </div>

        {filteredApplicants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No documents found</h3>
            <p>
              {searchTerm 
                ? `No documents match your search for "${searchTerm}"`
                : documentType !== 'all'
                ? `No ${getPageTitle().toLowerCase()} available.`
                : 'No documents available at the moment.'
              }
            </p>
            {documentType !== 'all' && (
              <button 
                className="view-all-btn"
              >
                No Applicants here 
              </button>
            )}
          </div>
        ) : (
          <div className="applicants-table-container">
            <table className="applicants-table">
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Passport Number</th>
                  <th>Document Type</th>
                  <th>Status</th>
                  <th>Upload Date</th>
                  <th>File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map((applicant) => (
                  <tr key={applicant.id} className="applicant-row">
                    <td className="applicant-name">
                      <strong>{applicant.name}</strong>
                    </td>
                    <td className="passport-number">
                      {maskPassportNumber(applicant.passportNumber)}
                    </td>
                    <td className="document-type">
                      {formatDocumentType(applicant.documentType)}
                    </td>
                    <td className="status-cell">
                      {getStatusBadge(applicant.status)}
                    </td>
                    <td className="upload-date">
                      {formatDate(applicant.uploadedAt)}
                    </td>
                    <td className="file-info">
                      {applicant.fileName && (
                        <div className="file-details">
                          <span className="file-name">{applicant.fileName}</span>
                          {applicant.fileUrl && (
                            <a 
                              href={applicant.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="file-link"
                            >
                              View File
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="actions">
                      <a 
                        href={`/employer/document/${applicant.id}`}
                        className="view-btn"
                      >
                        View Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Empolyer;