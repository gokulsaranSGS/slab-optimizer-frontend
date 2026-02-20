import React, { useState } from 'react';
import {
  Plus,
  Play,
  Download,
  Trash2,
  Layout,
  Layers,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  const [inventory, setInventory] = useState([{ id: 'S1', width: null, length: null }]);
  const [pieces, setPieces] = useState([{ id: 'P1', width: null, length: null, qty: null }]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateInputs = () => {
    const validSlabs = inventory.filter((s) => Number(s.width) > 0 && Number(s.length) > 0);
    if (validSlabs.length === 0) {
      setError('Add at least one valid slab (width and length > 0)');
      return false;
    }

    const validPieces = pieces.filter((p) => Number(p.width) > 0 && Number(p.length) > 0 && Number(p.qty) > 0);
    if (validPieces.length === 0) {
      setError('Add at least one valid piece (width, length, quantity > 0)');
      return false;
    }

    setError(null);
    return true;
  };

  const handleOptimize = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Use VITE_BACKEND_URL from .env or fallback (change fallback in production!)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8085/api/slab';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pieces: pieces.map((p) => ({
            id: p.id,
            width: Number(p.width),
            length: Number(p.length),
            qty: Number(p.qty),
          })),
          inventory: inventory.map((s) => ({
            id: s.id,
            width: Number(s.width),
            length: Number(s.length),
          })),
        }),
      });

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg += ` - ${errData.message || errData.error || 'Unknown error'}`;
        } catch {
          errorMsg += ' - ' + (await response.text());
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Optimization request failed:', err);
      setError(err.message || 'Failed to connect to the optimization server.');
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  //  Inventory CRUD
  // ────────────────────────────────────────────────

  const addInventory = () => {
    setInventory((prev) => [
      ...prev,
      { id: `S${prev.length + 1}`, width: null, length: null },
    ]);
  };

  const removeInventory = (index) => {
    if (inventory.length <= 1) return;
    setInventory((prev) => prev.filter((_, i) => i !== index));
  };

  const updateInventory = (index, field, value) => {
    const num = value === '' ? '' : Math.max(0, Number(value));
    setInventory((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: num };
      return next;
    });
  };

  // ────────────────────────────────────────────────
  //  Pieces CRUD
  // ────────────────────────────────────────────────

  const addPiece = () => {
    setPieces((prev) => [
      ...prev,
      { id: `P${prev.length + 1}`, width: null, length: null, qty: 1 },
    ]);
  };

  const removePiece = (index) => {
    if (pieces.length <= 1) return;
    setPieces((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePiece = (index, field, value) => {
    const num = value === '' ? '' : Math.max(0, field === 'qty' ? Number.parseInt(value, 10) : Number(value));
    setPieces((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: num };
      return next;
    });
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  // ────────────────────────────────────────────────
  //  RENDER
  // ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-2">
            Slab Optimizer
          </h1>
          <p className="text-slate-600">
            Efficient piece placement with automatic rotation support
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-1 shrink-0" size={20} />
              <div>
                <p className="font-bold text-red-800">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── Inputs ──────────────────────────────────────── */}
          <div className="xl:col-span-1 space-y-6">
            {/* Slabs */}
            <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
                <h2 className="font-bold text-white flex items-center gap-2 text-lg">
                  <Layers size={22} /> Inventory Slabs
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {inventory.map((slab, i) => (
                    <div key={slab.id} className="flex gap-2 items-center">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="1"
                          step="0.1"
                          value={slab.width}
                          onChange={(e) => updateInventory(i, 'width', e.target.value)}
                          placeholder="Width"
                          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                        />
                        <input
                          type="number"
                          min="1"
                          step="0.1"
                          value={slab.length}
                          onChange={(e) => updateInventory(i, 'length', e.target.value)}
                          placeholder="Length"
                          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                        />
                      </div>
                      <button
                        onClick={() => removeInventory(i)}
                        disabled={inventory.length <= 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                        title={inventory.length <= 1 ? "Can't remove last slab" : "Remove"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addInventory}
                  className="mt-4 w-full py-2.5 border border-blue-200 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={18} /> Add Slab
                </button>
              </div>
            </div>

            {/* Pieces */}
            <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
                <h2 className="font-bold text-white flex items-center gap-2 text-lg">
                  <Layout size={22} /> Pieces to Cut
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {pieces.map((piece, i) => (
                    <div key={piece.id} className="flex gap-2 items-center">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          min="1"
                          step="0.1"
                          value={piece.width}
                          onChange={(e) => updatePiece(i, 'width', e.target.value)}
                          placeholder="Width"
                          className="border border-slate-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                        />
                        <input
                          type="number"
                          min="1"
                          step="0.1"
                          value={piece.length}
                          onChange={(e) => updatePiece(i, 'length', e.target.value)}
                          placeholder="Length"
                          className="border border-slate-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                        />
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={piece.qty}
                          onChange={(e) => updatePiece(i, 'qty', e.target.value)}
                          placeholder="Qty"
                          className="border border-slate-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                        />
                      </div>
                      <button
                        onClick={() => removePiece(i)}
                        disabled={pieces.length <= 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                        title={pieces.length <= 1 ? "Can't remove last piece" : "Remove"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addPiece}
                  className="mt-4 w-full py-2.5 border border-blue-200 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={18} /> Add Piece
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleOptimize}
                disabled={loading}
                className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Play size={18} /> OPTIMIZE
                  </>
                )}
              </button>

              {results && (
                <button
                  onClick={clearResults}
                  className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ── Results ─────────────────────────────────────── */}
          <div className="xl:col-span-2">
            {results ? (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
                    <p className="text-blue-100 text-sm mb-1">Slabs Used</p>
                    <p className="text-4xl font-black">{results.slabUsed ?? 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-xl shadow-lg">
                    <p className="text-amber-100 text-sm mb-1">Unfit Pieces</p>
                    <p className="text-4xl font-black">{results.unfittedPieceId?.length ?? 0}</p>
                  </div>
                </div>

                {/* Unfit warning */}
                {results.unfittedPieceId?.length > 0 && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="text-amber-600 mt-1 shrink-0" size={20} />
                      <div>
                        <p className="font-bold text-amber-800">Some pieces could not be placed</p>
                        <p className="text-amber-700 text-sm mt-1">
                          Unfit piece IDs:{' '}
                          <span className="font-medium">
                            {results.unfittedPieceId.join(', ')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success message */}
                {results.image?.length > 0 &&
                  (!results.unfittedPieceId || results.unfittedPieceId.length === 0) && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-lg">
                      <div className="flex gap-3">
                        <CheckCircle className="text-green-600 mt-1 shrink-0" size={20} />
                        <p className="font-bold text-green-800">
                          All pieces placed successfully!
                        </p>
                      </div>
                    </div>
                  )}

                {/* Layout images */}
                {results.image?.length > 0 ? (
                  <div className="space-y-6">
                    {results.image.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl border border-slate-200 shadow overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-5 py-4 bg-slate-50 border-b">
                          <h3 className="font-bold text-slate-700">
                            Slab Layout {idx + 1}
                          </h3>
                          <a
                            href={imgSrc}
                            download={`slab-layout-${idx + 1}.png`}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
                          >
                            <Download size={16} /> Download PNG
                          </a>
                        </div>
                        <div className="p-4 bg-slate-50">
                          <img
                            src={imgSrc}
                            alt={`Layout of slab ${idx + 1}`}
                            className="w-full h-auto rounded border border-slate-200 bg-white"
                            onError={(e) => {
                              e.target.src = '';
                              e.target.alt = 'Image failed to load';
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center text-slate-400">
                    <Layout size={64} className="mx-auto mb-6 opacity-40" />
                    <p className="text-xl font-semibold">No layouts generated</p>
                    <p className="mt-2">
                      {results.unfittedPieceId?.length > 0
                        ? 'All pieces marked as unfit. Try larger slabs.'
                        : 'Run optimization to see results.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 min-h-[500px] flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <Layout size={72} className="mb-6 opacity-40" />
                <p className="text-2xl font-semibold mb-3">Ready to optimize</p>
                <p className="max-w-md">
                  Add your available slabs and the pieces you want to cut, then click
                  OPTIMIZE
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optional: minimal scrollbar styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}