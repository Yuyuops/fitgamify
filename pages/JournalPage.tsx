import React, { useEffect, useMemo, useState } from "react";

type Entry = {
  id: string;
  dateISO: string;            // "2025-10-22"
  category: "entrainement" | "philosophie";
  title: string;
  text: string;
  tags: string[];             // ["motivation","respiration"]
  mood?: number;              // 1..5 optionnel
};

const STORAGE_KEY = "fitgamify_journal_v1";

function loadAll(): Entry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveAll(list: Entry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>(loadAll());
  const [dateISO, setDateISO] = useState(todayISO());
  const [category, setCategory] = useState<Entry["category"]>("entrainement");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string>("");
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [query, setQuery] = useState("");

  useEffect(() => { saveAll(entries); }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.slice().sort((a,b)=>b.dateISO.localeCompare(a.dateISO));
    return entries
      .filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.text.toLowerCase().includes(q) ||
        e.tags.join(" ").toLowerCase().includes(q)
      )
      .sort((a,b)=>b.dateISO.localeCompare(a.dateISO));
  }, [entries, query]);

  function addEntry() {
    if (!text.trim() && !title.trim()) return;
    const entry: Entry = {
      id: crypto.randomUUID(),
      dateISO, category, title: title.trim(),
      text: text.trim(),
      tags: tags.split(",").map(t=>t.trim()).filter(Boolean),
      mood
    };
    setEntries([entry, ...entries]);
    // reset léger
    setTitle(""); setText(""); setTags(""); setMood(undefined);
  }

  function del(id: string) {
    if (!confirm("Supprimer cette note ?")) return;
    setEntries(entries.filter(e => e.id !== id));
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `journal-fitgamify-${todayISO()}.json`;
    a.click();
  }

  return (
    <div className="container">
      <h1>Journal de bord</h1>
      <p style={{opacity:.7, marginTop:-8}}>Notes quotidiennes : entraînement ou réflexion.</p>

      {/* éditeur */}
      <div className="card">
        <div className="row">
          <label>Date</label>
          <input type="date" value={dateISO} onChange={e=>setDateISO(e.target.value)} />
        </div>

        <div className="row">
          <label>Catégorie</label>
          <select value={category} onChange={e=>setCategory(e.target.value as any)}>
            <option value="entrainement">Entraînement</option>
            <option value="philosophie">Philosophie</option>
          </select>
        </div>

        <div className="row">
          <label>Titre (optionnel)</label>
          <input placeholder="ex: Respiration avant sparring"
                 value={title} onChange={e=>setTitle(e.target.value)} />
        </div>

        <div className="row">
          <label>Texte</label>
          <textarea rows={5}
            placeholder="Ce que j’ai appris aujourd’hui, sensations, principes, erreurs à corriger…"
            value={text} onChange={e=>setText(e.target.value)} />
        </div>

        <div className="row">
          <label>Tags (séparés par des virgules)</label>
          <input placeholder="motivation, posture, boxe"
                 value={tags} onChange={e=>setTags(e.target.value)} />
        </div>

        <div className="row">
          <label>Humeur</label>
          <select value={mood ?? ""} onChange={e=>setMood(e.target.value ? Number(e.target.value) : undefined)}>
            <option value="">—</option>
            <option value="1">😵 1</option>
            <option value="2">😕 2</option>
            <option value="3">😐 3</option>
            <option value="4">🙂 4</option>
            <option value="5">😄 5</option>
          </select>
        </div>

        <button className="btn" onClick={addEntry}>Ajouter la note</button>
        <button className="btn ghost" onClick={exportJSON} style={{marginLeft:8}}>Exporter (JSON)</button>
      </div>

      {/* recherche */}
      <div className="card">
        <input placeholder="Rechercher (titre, texte, tags…)"
               value={query} onChange={e=>setQuery(e.target.value)} />
      </div>

      {/* liste */}
      <div className="list">
        {filtered.map(e => (
          <article key={e.id} className="note">
            <header>
              <div>
                <b>{e.title || (e.category === "philosophie" ? "Réflexion" : "Entraînement")}</b>
                <div className="muted">{e.dateISO} • {e.category}{e.mood ? ` • humeur ${e.mood}/5` : ""}</div>
              </div>
              <button className="danger" onClick={()=>del(e.id)}>Suppr.</button>
            </header>
            <p style={{whiteSpace:"pre-wrap"}}>{e.text}</p>
            {e.tags.length>0 && <div className="tags">
              {e.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>}
          </article>
        ))}
        {filtered.length===0 && <div className="muted">Aucune note pour l’instant.</div>}
      </div>

      {/* styles minimes (même thème que le reste) */}
      <style>{`
        .container{max-width:900px;margin:0 auto;padding:16px;}
        .card{background:#0e1624;border:1px solid #273349;border-radius:12px;padding:14px;margin:12px 0;}
        .row{display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin:8px 0;}
        .btn{background:linear-gradient(90deg,#6a8bff,#b26bff);border:none;color:#fff;border-radius:10px;padding:10px 14px;cursor:pointer}
        .btn.ghost{background:transparent;border:1px solid #3a4a67}
        .list .note{background:#0b1220;border:1px solid #2b3952;border-radius:12px;margin:10px 0;padding:12px}
        .note header{display:flex;justify-content:space-between;gap:10px;align-items:center}
        .danger{background:#e53935;color:white;border:none;border-radius:8px;padding:6px 10px;cursor:pointer}
        .tag{display:inline-block;border:1px solid #3a4a67;border-radius:999px;padding:2px 8px;margin:4px 6px 0 0;font-size:.85rem;color:#cfe3ff}
        .muted{opacity:.7}
        input,textarea,select{background:#0b1220;border:1px solid #33425f;border-radius:10px;color:#e8efff;padding:8px}
      `}</style>
    </div>
  );
}
