import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

function HomeRedirect() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        navigate('/my-requests');
        return;
      }

      try {
        // Check if user is an admin
        const adminDoc = await getDoc(doc(db, 'admins', user.email));
        
        if (adminDoc.exists()) {
          // User is admin - redirect to admin panel
          navigate('/admin');
        } else {
          // Regular user - redirect to my requests
          navigate('/my-requests');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        // Default to my-requests on error
        navigate('/my-requests');
      } finally {
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  if (checking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 200px)',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Se încarcă...
      </div>
    );
  }

  return null;
}

export default HomeRedirect;
