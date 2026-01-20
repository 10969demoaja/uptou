import React from 'react';
import { Wrench, ArrowLeft, Clock } from 'lucide-react';
import './UnderMaintenance.css';

interface UnderMaintenanceProps {
  onBack: () => void;
  title?: string;
  message?: string;
}

const UnderMaintenance: React.FC<UnderMaintenanceProps> = ({ 
  onBack, 
  title = "Sedang Dalam Perbaikan",
  message = "Fitur ini sedang dalam pengembangan dan akan segera tersedia. Mohon maaf atas ketidaknyamanannya."
}) => {
  return (
    <div className="under-maintenance">
      <div className="maintenance-container">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Kembali
        </button>
        
        <div className="maintenance-content">
          <div className="maintenance-icon">
            <Wrench size={80} />
          </div>
          
          <h1 className="maintenance-title">{title}</h1>
          <p className="maintenance-message">{message}</p>
          
          <div className="maintenance-details">
            <div className="detail-item">
              <Clock size={20} />
              <span>Estimasi: Segera hadir</span>
            </div>
          </div>
          
          <div className="maintenance-actions">
            <button className="primary-btn" onClick={onBack}>
              Kembali Belanja
            </button>
          </div>
        </div>
        
        <div className="maintenance-footer">
          <p>Tim UPTOU sedang bekerja keras untuk memberikan pengalaman terbaik</p>
        </div>
      </div>
    </div>
  );
};

export default UnderMaintenance; 