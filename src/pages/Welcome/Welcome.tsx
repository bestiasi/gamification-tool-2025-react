import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/config';
import './Welcome.css';

function Welcome() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to my requests page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/requests');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Extract first name from email or display name
  const getFirstName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0].toUpperCase();
    }
    return 'BESTAN';
  };

  return (
    <div className="welcome-page">
      <div className="welcome-container">
        <div className="welcome-content">
          <h1 className="welcome-title">
            BINE AI VENIT PE BEST GAMIFICATION TOOL <br /> 
            {getFirstName()}!
          </h1>
          <button 
            className="welcome-button"
            onClick={() => navigate('/requests')}
          >
            VEZI CERERILE TALE
          </button>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
