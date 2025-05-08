import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import { Tabs } from '../../components/ui/tabs';
import { Select } from '../../components/ui/select';

// --- Drag-and-drop helpers ---
function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

// Skeleton loader for cards
function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow p-4 flex flex-col items-center">
      <div className="bg-gray-200 h-32 w-full rounded mb-4" />
      <div className="bg-gray-200 h-4 w-3/4 rounded mb-2" />
      <div className="bg-gray-100 h-3 w-1/2 rounded mb-1" />
      <div className="bg-gray-100 h-3 w-1/3 rounded" />
    </div>
  );
}

function clampLines(text: string, lines = 2) {
  // Simple clamp for demo; use CSS line-clamp in real app
  const words = text.split(' ');
  return words.slice(0, lines * 8).join(' ') + (words.length > lines * 8 ? '…' : '');
}

const LOCAL_STORAGE_KEY = 'pdfbooker_selected_pages';
const LOCAL_STORAGE_ORDER_KEY = 'pdfbooker_selected_order';

export default function PageChooser({
  pages = [],
  loading = false,
  onSelect,
  selected: selectedProp = [],
}: {
  pages: Array<any>;
  loading?: boolean;
  onSelect?: (url: string) => void;
  selected?: string[];
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('relevance');
  const [showSelected, setShowSelected] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(selectedProp);
  const [order, setOrder] = useState<string[]>([]); // Order of selected URLs
  const [undoStack, setUndoStack] = useState<string[][]>([]);
  const [redoStack, setRedoStack] = useState<string[][]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Restore selection and order from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setSelected(JSON.parse(stored));
      } catch {}
    }
    const storedOrder = localStorage.getItem(LOCAL_STORAGE_ORDER_KEY);
    if (storedOrder) {
      try {
        setOrder(JSON.parse(storedOrder));
      } catch {}
    }
  }, []);
  // Persist selection and order to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selected));
  }, [selected]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ORDER_KEY, JSON.stringify(order));
  }, [order]);
  // Sync with prop
  useEffect(() => {
    setSelected(selectedProp);
  }, [selectedProp]);

  // Filtering and sorting
  const filteredPages = useMemo(() => {
    let filtered = pages;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(s) ||
          p.url?.toLowerCase().includes(s)
      );
    }
    if (showSelected) {
      filtered = filtered.filter((p) => selected.includes(p.url));
    }
    if (sort === 'date') {
      filtered = [...filtered].sort((a, b) => (b.lastModified || '').localeCompare(a.lastModified || ''));
    } else if (sort === 'size') {
      filtered = [...filtered].sort((a, b) => (b.wordCount || 0) - (a.wordCount || 0));
    } // else relevance = original order
    return filtered;
  }, [pages, search, sort, showSelected, selected]);

  // Maintain order of selected pages
  const selectedPages = useMemo(() => {
    const sel = pages.filter(p => selected.includes(p.url));
    // Use order if available, else default to selection order
    if (order.length) {
      return order
        .filter(url => selected.includes(url))
        .map(url => sel.find(p => p.url === url))
        .filter(Boolean) as typeof sel;
    }
    return sel;
  }, [pages, selected, order]);

  // Batch selection
  const allVisibleSelected = filteredPages.length > 0 && filteredPages.every(p => selected.includes(p.url));
  const anyVisibleSelected = filteredPages.some(p => selected.includes(p.url));
  const handleSelectAll = () => {
    setSelected(prev => {
      const urls = filteredPages.map(p => p.url);
      return Array.from(new Set([...prev, ...urls]));
    });
  };
  const handleSelectNone = () => {
    setSelected(prev => prev.filter(url => !filteredPages.some(p => p.url === url)));
  };

  // Real-time counts
  const selectedCount = selectedPages.length;
  const selectedWordCount = selectedPages.reduce((sum, p) => sum + (p.wordCount || 0), 0);

  // Keyboard navigation and reordering
  const handleCardKeyDown = (e: React.KeyboardEvent, idx: number, url: string) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleSelect(url);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusCard(idx + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusCard(idx - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusCard(idx + 3);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusCard(idx - 3);
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      moveCard(idx, Math.max(0, idx - 1));
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
      e.preventDefault();
      moveCard(idx, Math.min(selectedPages.length - 1, idx + 1));
    }
  };
  const focusCard = (idx: number) => {
    if (idx >= 0 && idx < selectedPages.length) {
      setFocusedIndex(idx);
      cardRefs.current[idx]?.focus();
    }
  };
  useEffect(() => {
    if (focusedIndex !== null && cardRefs.current[focusedIndex]) {
      cardRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Selection logic
  const toggleSelect = (url: string) => {
    setSelected(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
    // If selecting, add to order at end
    setOrder(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
    onSelect?.(url);
  };

  // Drag-and-drop logic
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };
  const handleDragOver = (idx: number) => {
    setDragOverIdx(idx);
  };
  const handleDrop = (idx: number) => {
    if (draggedIdx !== null && draggedIdx !== idx) {
      pushUndo(order);
      setOrder(prev => arrayMove(prev, draggedIdx, idx));
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };
  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };
  // Touch support (mobile)
  // (For brevity, not a full polyfill, but basic touch drag)
  const touchStartIdx = useRef<number | null>(null);
  const handleTouchStart = (idx: number) => {
    touchStartIdx.current = idx;
  };
  const handleTouchEnd = (idx: number) => {
    if (touchStartIdx.current !== null && touchStartIdx.current !== idx) {
      pushUndo(order);
      setOrder(prev => arrayMove(prev, touchStartIdx.current!, idx));
    }
    touchStartIdx.current = null;
  };

  // Undo/redo logic
  const pushUndo = (current: string[]) => {
    setUndoStack(prev => [...prev, current]);
    setRedoStack([]);
  };
  const handleUndo = () => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      setRedoStack(r => [order, ...r]);
      setOrder(prev[prev.length - 1]);
      return prev.slice(0, -1);
    });
  };
  const handleRedo = () => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      setUndoStack(u => [...u, order]);
      setOrder(prev[0]);
      return prev.slice(1);
    });
  };

  // Warning for large selections
  const showLargeWarning = selectedCount > 50;

  return (
    <div className="w-full">
      {/* Filtering controls */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Input
          placeholder="Search by title or URL"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="relevance">Sort: Relevance</option>
          <option value="date">Sort: Date</option>
          <option value="size">Sort: Size</option>
        </Select>
        <Checkbox
          checked={showSelected}
          onCheckedChange={setShowSelected as any}
          id="show-selected"
        />
        <label htmlFor="show-selected" className="text-sm">Show only selected</label>
        {/* Batch selection controls */}
        <Button type="button" variant="outline" size="sm" onClick={handleSelectAll} aria-label="Select all visible">Select All</Button>
        <Button type="button" variant="outline" size="sm" onClick={handleSelectNone} aria-label="Deselect all visible">Select None</Button>
        {/* Undo/redo controls */}
        <Button type="button" variant="ghost" size="sm" onClick={handleUndo} disabled={undoStack.length === 0} aria-label="Undo">Undo</Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleRedo} disabled={redoStack.length === 0} aria-label="Redo">Redo</Button>
        {/* Real-time count */}
        <span className="ml-4 text-sm font-medium">Selected: {selectedCount}</span>
        <span className="ml-2 text-xs text-gray-500">({selectedWordCount} words)</span>
        {showLargeWarning && (
          <span className="ml-4 text-xs text-red-500 font-semibold">Warning: More than 50 pages selected!</span>
        )}
      </div>
      {/* Grid of cards (selected pages, reorderable) */}
      <div className="mb-8">
        <div className="font-semibold mb-2">Selected Pages (Drag to reorder):</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedPages.map((page, idx) => (
            <Card
              key={page.url}
              ref={el => cardRefs.current[idx] = el}
              tabIndex={0}
              aria-label={`Selected page card: ${page.title}`}
              aria-checked={selected.includes(page.url)}
              role="checkbox"
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => { e.preventDefault(); handleDragOver(idx); }}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              onTouchStart={() => handleTouchStart(idx)}
              onTouchEnd={() => handleTouchEnd(idx)}
              className={`relative flex flex-col items-center p-4 cursor-move transition-transform duration-150 border outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${selected.includes(page.url) ? 'ring-2 ring-blue-500 border-blue-400' : ''} ${draggedIdx === idx ? 'opacity-50' : ''} ${dragOverIdx === idx && draggedIdx !== null ? 'ring-2 ring-green-400 border-green-400' : ''}`}
              onKeyDown={e => handleCardKeyDown(e, idx, page.url)}
            >
              <div className="absolute left-2 top-2 bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs" aria-label={`Order: ${idx + 1}`}>{idx + 1}</div>
              <div className="w-full flex justify-center items-center mb-2 h-32 bg-gray-50 rounded overflow-hidden">
                {page.thumbnail ? (
                  <img
                    src={page.thumbnail}
                    alt={page.title}
                    className="object-contain h-32 max-w-full"
                    onClick={e => { e.stopPropagation(); setPreview(page.thumbnail); }}
                  />
                ) : (
                  <div className="bg-gray-200 w-24 h-16 rounded animate-pulse" />
                )}
              </div>
              <div className="font-bold text-center text-base mb-1 line-clamp-2" title={page.title}>{clampLines(page.title || '', 2)}</div>
              <div className="text-xs text-gray-500 text-center mb-1">{page.domain}{page.url && page.url.replace(/^https?:\/\//, '').replace(page.domain, '')}</div>
              <div className="text-xs text-gray-700">{page.wordCount} words</div>
              <Checkbox
                checked={selected.includes(page.url)}
                onCheckedChange={() => toggleSelect(page.url)}
                className="absolute top-2 right-2"
                aria-label={selected.includes(page.url) ? 'Deselect page' : 'Select page'}
                tabIndex={-1}
              />
            </Card>
          ))}
        </div>
      </div>
      {/* Grid of cards (unselected, not draggable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : filteredPages.filter(p => !selected.includes(p.url)).map((page, idx) => (
              <Card
                key={page.url}
                tabIndex={0}
                aria-label={`Page card: ${page.title}`}
                aria-checked={selected.includes(page.url)}
                role="checkbox"
                className={`relative flex flex-col items-center p-4 cursor-pointer transition-transform duration-150 hover:shadow-lg hover:scale-[1.03] border outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                onClick={() => toggleSelect(page.url)}
                onKeyDown={e => handleCardKeyDown(e, idx, page.url)}
              >
                <div className="w-full flex justify-center items-center mb-2 h-32 bg-gray-50 rounded overflow-hidden">
                  {page.thumbnail ? (
                    <img
                      src={page.thumbnail}
                      alt={page.title}
                      className="object-contain h-32 max-w-full"
                      onClick={e => { e.stopPropagation(); setPreview(page.thumbnail); }}
                    />
                  ) : (
                    <div className="bg-gray-200 w-24 h-16 rounded animate-pulse" />
                  )}
                </div>
                <div className="font-bold text-center text-base mb-1 line-clamp-2" title={page.title}>{clampLines(page.title || '', 2)}</div>
                <div className="text-xs text-gray-500 text-center mb-1">{page.domain}{page.url && page.url.replace(/^https?:\/\//, '').replace(page.domain, '')}</div>
                <div className="text-xs text-gray-700">{page.wordCount} words</div>
                <Checkbox
                  checked={selected.includes(page.url)}
                  onCheckedChange={() => toggleSelect(page.url)}
                  className="absolute top-2 right-2"
                  aria-label={selected.includes(page.url) ? 'Deselect page' : 'Select page'}
                  tabIndex={-1}
                />
              </Card>
            ))}
      </div>
      {/* Preview modal */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        {preview && (
          <div className="flex flex-col items-center p-6">
            <img src={preview} alt="Preview" className="max-w-full max-h-[70vh] rounded shadow-lg" />
            <Button className="mt-4" onClick={() => setPreview(null)}>Close</Button>
          </div>
        )}
      </Dialog>
    </div>
  );
} 