import React, { useState, useEffect } from 'react';
import PageChooser from './PageChooser';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';

const LOCAL_STORAGE_KEY = 'pdfbooker_crawler_step_state';

export default function PdfCrawlerStep({
  pages = [], // All crawled pages (from API)
  loading: loadingProp = false,
  onNext,
}: {
  pages: Array<any>;
  loading?: boolean;
  onNext: (selectedOrder: string[], selectedPages: { [url: string]: any }, preferences: any) => void;
}) {
  // State for selection/order, metadata, preferences, loading, error
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<{ [url: string]: any }>({});
  const [preferences, setPreferences] = useState<{ sort: string; search: string; showSelected: boolean }>({ sort: 'relevance', search: '', showSelected: false });
  const [loading, setLoading] = useState(loadingProp);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Restore state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSelectedOrder(parsed.selectedOrder || []);
        setSelectedPages(parsed.selectedPages || {});
        setPreferences(parsed.preferences || preferences);
      } catch {}
    }
  }, []);
  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ selectedOrder, selectedPages, preferences })
    );
  }, [selectedOrder, selectedPages, preferences]);

  // Update selectedPages metadata when pages prop changes
  useEffect(() => {
    setSelectedPages(prev => {
      const updated = { ...prev };
      pages.forEach(p => {
        if (selectedOrder.includes(p.url)) {
          updated[p.url] = p;
        }
      });
      return updated;
    });
  }, [pages, selectedOrder]);

  // Handler for selection changes from PageChooser
  const handleSelect = (url: string) => {
    setSelectedOrder(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
    // Metadata is updated in useEffect above
  };

  // Handler for preferences changes
  const handlePreferences = (prefs: Partial<typeof preferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  };

  // Validation before next step
  const validate = () => {
    if (selectedOrder.length === 0) {
      setError('Please select at least one page.');
      return false;
    }
    if (new Set(selectedOrder).size !== selectedOrder.length) {
      setError('Duplicate pages detected.');
      return false;
    }
    const broken = selectedOrder.some(url => selectedPages[url]?.error);
    if (broken) {
      setError('Some selected pages could not be loaded.');
      return false;
    }
    setError(null);
    return true;
  };

  // Handle Next button click
  const handleNext = async () => {
    if (!validate()) return;
    setLoading(true);
    setProgress(0);
    // Simulate async processing for large selections
    for (let i = 0; i < selectedOrder.length; i++) {
      await new Promise(res => setTimeout(res, 10));
      setProgress(Math.round(((i + 1) / selectedOrder.length) * 100));
    }
    setLoading(false);
    setProgress(100);
    onNext(selectedOrder, selectedPages, preferences);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Select and Arrange Pages</h2>
      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {loading && (
        <div className="mb-4">
          <Progress value={progress} max={100} />
          <div className="text-xs text-gray-500 mt-1">Processing selection...</div>
        </div>
      )}
      <PageChooser
        pages={pages}
        loading={loadingProp}
        onSelect={handleSelect}
        selected={selectedOrder}
        // Pass preferences and handlers as needed
      />
      <div className="flex justify-end mt-6">
        <Button onClick={handleNext} disabled={loading}>
          Next
        </Button>
      </div>
    </div>
  );
} 