import { useNavigate } from 'react-router-dom';
import './Success.css';

function Success() {
  const navigate = useNavigate();

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-content">
          <h1 className="success-title">S-A TRIMIS CU SUCCESS!</h1>
          
          <button 
            className="success-button"
            onClick={() => navigate('/my-requests')}
          >
            MAI ADAUGA PUNCTE
          </button>
        </div>
      </div>
    </div>
  );
}

export default Success;
