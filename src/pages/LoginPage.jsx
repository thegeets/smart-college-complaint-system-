import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * LoginPage has been deprecated and removed per requirements:
 * "Remove “Demo as Student”, “Student Demo Login”, and “Student Register” buttons, pages, and navigation."
 * Visitors now access the complaint form directly from the public homepage without login.
 */
export function LoginPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/submit', { replace: true });
  }, [navigate]);
  return null;
}

export default LoginPage;
