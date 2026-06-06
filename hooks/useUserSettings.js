import { useState, useEffect } from 'react';

export function useUserSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/user/settings', { method: 'GET', credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        } else if (res.status === 401) {
          console.error('Unauthenticated');
          setSettings(null);
        } else {
          console.error('Failed to load settings');
        }
      } catch (err) {
        console.error('Error fetching settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateSettings = async (updates) => {
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else if (res.status === 401) {
        console.error('Unauthenticated');
      } else {
        console.error('Failed to update settings');
      }
    } catch (err) {
      console.error('Error updating settings', err);
    }
  };

  return { settings, loading, updateSettings };
}
