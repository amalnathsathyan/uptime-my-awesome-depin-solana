'use client'
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Globe, Plus, Moon, Sun } from 'lucide-react';
import { useWebsites } from '../../hooks/useWebsites';
import { formatDistanceToNow, parseISO, subMinutes } from 'date-fns';
import axios from 'axios';
import { API_BACKEND_URL } from '@/config';
import { useAuth } from '@clerk/nextjs';

function StatusCircle({ status }: { status: string }) {
  return (
    <div className={`w-3 h-3 rounded-full ${status === 'up' ? 'bg-green-500' : 'bg-red-500'}`} />
  );
}

function aggregateTicksIntoWindows(ticks: Array<{ createdAt: string; status: string }>) {
  const now = new Date();
  const thirtyMinutesAgo = subMinutes(now, 30);
  
  // Create 10 three-minute windows
  const windows = Array.from({ length: 10 }, (_, i) => {
    const windowStart = subMinutes(now, (i + 1) * 3);
    const windowEnd = subMinutes(now, i * 3);
    return {
      start: windowStart,
      end: windowEnd,
      ticks: [] as typeof ticks,
      isFuture: windowStart > now // Check if this window is in the future
    };
  }).reverse();

  // Filter ticks to last 30 minutes and distribute into windows
  const recentTicks = ticks.filter(tick => {
    const tickDate = parseISO(tick.createdAt);
    return tickDate >= thirtyMinutesAgo;
  });

  // Find the oldest and newest tick timestamps
  let oldestTickTime = now;
  let newestTickTime = thirtyMinutesAgo;
  
  if (recentTicks.length > 0) {
    // Find the actual time range of available data
    const tickDates = recentTicks.map(tick => parseISO(tick.createdAt));
    oldestTickTime = new Date(Math.min(...tickDates.map(d => d.getTime())));
    newestTickTime = new Date(Math.max(...tickDates.map(d => d.getTime())));
  }

  recentTicks.forEach(tick => {
    const tickDate = parseISO(tick.createdAt);
    const window = windows.find(w => tickDate >= w.start && tickDate < w.end);
    if (window) {
      window.ticks.push(tick);
    }
  });

  // Determine status for each window
  return windows.map(window => {
    // If the window's end time is after the newest tick, it's a future window with no data yet
    const isFutureData = window.end > newestTickTime;
    
    // If the window's start time is before the oldest tick, we don't have data for it yet
    const isPastDataNotYetCollected = window.start < oldestTickTime;
    
    // No data (future or not yet collected) means unknown status
    if (window.ticks.length === 0 || isFutureData || isPastDataNotYetCollected) {
      return 'unknown';
    }
    
    const upTicks = window.ticks.filter(t => t.status === 'up').length;
    return upTicks / window.ticks.length >= 0.5 ? 'up' : 'down';
  });
}

function UptimeTicks({ ticks }: { ticks: Array<{ createdAt: string; status: string }> }) {
  const aggregatedTicks = aggregateTicksIntoWindows(ticks);

  return (
    <div className="flex gap-1 mt-2">
      {aggregatedTicks.map((status, index) => {
        let bgColor = '';
        
        switch (status) {
          case 'up':
            bgColor = 'bg-green-500';
            break;
          case 'down':
            bgColor = 'bg-red-500';
            break;
          default:
            bgColor = 'bg-gray-400'; // Unknown status
        }
        
        return (
          <div
            key={index}
            className={`w-8 h-2 rounded ${bgColor}`}
          />
        );
      })}
    </div>
  );
}

function calculateUptimePercentage(ticks: Array<{ status: string }>) {
  if (ticks.length === 0) return 0;
  const upTicks = ticks.filter(tick => tick.status === 'up').length;
  return Number(((upTicks / ticks.length) * 100).toFixed(1));
}

function WebsiteCard({ website }: { website: Website }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const uptimePercentage = calculateUptimePercentage(website.ticks);
  const lastTick = website.ticks.length > 0 ? website.ticks[website.ticks.length - 1] : null;
  const status = lastTick?.status || 'down';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <StatusCircle status={status} />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{website.url}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{website.url}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {uptimePercentage}% uptime
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
          <div className="mt-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Last 30 minutes status:</p>
            <UptimeTicks ticks={website.ticks} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Last checked: {lastTick ? formatDistanceToNow(parseISO(lastTick.createdAt), { addSuffix: true }) : 'Never'}
          </p>
        </div>
      )}
    </div>
  );
}

function CreateWebsiteModal({ isOpen, onClose }: { isOpen: boolean; onClose: (url: string | null) => void }) {
  if (!isOpen) return null;
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onClose(url);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Website</h2>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => onClose(null)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : "Add Website"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {getToken} = useAuth();
  const {websites, refreshWebsites} = useWebsites();
  
  // Toggle dark mode
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleAddWebsite = async (url: string | null) => {
    if (url === null) {
      setIsModalOpen(false);
      return;
    }
    
    try {
      const token = await getToken();
      await axios.post(`${API_BACKEND_URL}/api/v1/website`, {
        url
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // If we get here, the request succeeded
      await refreshWebsites();
      setIsModalOpen(false); // Close the modal after successful submission
    } catch (error) {
      console.error('Failed to add website:', error);
      alert('Failed to add website. Please try again.');
      // We don't close the modal here to let the user try again
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Uptime Monitor</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Website</span>
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {websites.map((website) => (
            <WebsiteCard key={website.id} website={website} />
          ))}
        </div>
      </div>

      <CreateWebsiteModal 
        isOpen={isModalOpen} 
        onClose={handleAddWebsite}
      />
    </div>
  );
}

export default App;