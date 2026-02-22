import { RefreshCw, Lock, Copy, Unlock, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/palettes";
const App = () => {
  const [palette, setPalette] = useState([]);
  const [savedPalettes, setSavedPalettes] = useState([]);
  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }


  const generateNew = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const baseSaturation = 40 + Math.random() * 40;
    const currentPalette = palette.length > 0 ? palette : Array.from({ length: 5 }, () => ({ hex: "", locked: false }));
    const newPalette = currentPalette.map((c, i) => {
      if (c.locked) return c;
      const h = (baseHue + i * 10) % 360;
      const l = 20 + i * 16;
      return { ...c, hex: hslToHex(h, baseSaturation, l) };
    });
    setPalette(newPalette);

  };

  useEffect(() => {
    generateNew();
    axios.get(API_URL).then((res) => {
      setSavedPalettes(res.data);
    });
  }, []);

  const toggleLock = (index) => {
    const newPalette = [...palette];
    newPalette[index].locked = !newPalette[index].locked;
    setPalette(newPalette);
  };

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    toast.success(`Copied ${color} to clipboard!`, { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
  };
  const savePalette = async () => {
    const title = prompt("Enter a title for your palette:");
    if (!title) return;
    try {
      const colors = palette.map(c => c.hex);
      const res = await axios.post(API_URL, { title, colors });
      setSavedPalettes([res.data, ...savedPalettes]);
      toast.success("saved to collections!");
    } catch (error) {
      toast.error("Failed to save ");
    }
  };

  const deletePalette = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSavedPalettes(savedPalettes.filter((p) => p._id !== id));
      toast.success("Palette deleted!", { icon: '🗑️' });
    } catch (error) {
      toast.error("Failed to delete palette.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Color Palette Pro
            </h1>
            <p className="text-slate-500 text-sm">
              Professional harmonic color generator
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generateNew}
              className="bg-indigo-600 text-white px-5 py-5 rounded-md flex items-center gap-2
            hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95"
            >
              <RefreshCw /> Generate
            </button>
            <button
              onClick={savePalette}
              className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 
            rounded-md hover:bg-slate-50 transition shadow-sm active:scale-95 "
            >
              Save Palette
            </button>
          </div>
        </header>
        {/* Main Generator Display */}
        <div className="flex h-[450px] rounded-md overflow-hidden shadow-sm mb-16">
          {palette.map((color, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end pb-10
             transition-all duration-500 relative group"
              style={{ backgroundColor: color.hex }}
            >
              <div className="flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => toggleLock(i)}
                  className="p-3 bg-white/20 backdrop-blur-lg rounded-full hover:bg-white/40
                text-white border border-white/30 shadow-xl"
                >
                  {color.locked ? <Lock size={22} /> : <Unlock size={22} />}
                </button>
                <button
                  className="p-3 bg-white/20 backdrop-blur-lg rounded-full hover:bg-white/40
                text-white border border-white/30 shadow-xl" onClick={() => copyToClipboard(color.hex)}
                >
                  <Copy size={22} />
                </button>
              </div>
              <span
                className="mt-6 text-white font-mono font-bold text-lg bg-black/20
                px-4 py-1.5 rounded-full backdrop-blur-md border border/white/10 uppercase tracking-widest"
              >{color.hex}</span>
            </div>
          ))}
        </div>

        {/* Saved Palettes Section */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Your Collections</h2>
          <span className="bg-slate-200 text-slate-600 px-3 py-1 
          rounded-md text-xs font-bold uppercase tracking-tighter"> {savedPalettes.length} Palettes</span>

        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 cursor-pointer">
          {savedPalettes.map((p) => (
            <div key={p._id}
              className="bg-white p-5 rounded-md shadow-sm border
              border-slate-100 transition-all hover:shadow-xl hover:translate-y-1">
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="font-semibold text-slate-700">{p.title}</span>
                <button onClick={() => deletePalette(p._id)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1">
                  <Trash2 size={18} /></button>
              </div>
              <div className="flex h-16 rounded-md overflow-hidden shadow-inner border border-slate-50">
                {p.colors.map((c, idx) => (
                  <div key={idx} className="flex-1 group/color relative flex justify-center items-center
                    transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: c }} onClick={() => copyToClipboard(c)}
                    title={`copy ${c}`}
                  >
                    <div className="opacity-0 group-hover/color:opacity-100 transition-opacity duration-200
                      pointer-events-none" title={c}>
                      <Copy size={18} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />

                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
