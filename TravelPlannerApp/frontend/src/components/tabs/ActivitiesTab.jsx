import { useState, useEffect } from 'react';
import travelPlanService from '../../services/travelPlanService';
import geocodingService from '../../services/geocodingService';

const STATUS_LABELS = {
    Planned: { label: 'Planirano', color: '#1565C0', bg: '#e3f2fd' },
    Reserved: { label: 'Rezervisano', color: '#6a1b9a', bg: '#f3e5f5' },
    Completed: { label: 'Završeno', color: '#388e3c', bg: '#e8f5e9' },
    Cancelled: { label: 'Otkazano', color: '#d32f2f', bg: '#ffebee' },
};

const emptyForm = {
    name: '', date: '', time: '', location: '',
    latitude: '', longitude: '', description: '',
    estimatedCost: '', status: 'Planned'
};

export default function ActivitiesTab({ planId, onRefresh }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [geoQuery, setGeoQuery] = useState('');
    const [geoResults, setGeoResults] = useState([]);
    const [geoLoading, setGeoLoading] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    const fetchActivities = () => {
        travelPlanService.getActivities(planId)
            .then(data => {
                const sorted = [...data].sort((a, b) =>
                    new Date(a.date + 'T' + (a.time || '00:00')) -
                    new Date(b.date + 'T' + (b.time || '00:00'))
                );
                setActivities(sorted);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchActivities(); }, [planId]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: null }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Naziv je obavezan';
        if (!form.date) errs.date = 'Datum je obavezan';
        return errs;
    };

    const searchGeo = async () => {
        if (!geoQuery.trim()) return;
        setGeoLoading(true);
        try {
            const results = await geocodingService.search(geoQuery);
            setGeoResults(results);
        } finally { setGeoLoading(false); }
    };

    const selectGeo = (r) => {
        setForm(prev => ({
            ...prev,
            location: r.displayName.split(',').slice(0, 2).join(',').trim(),
            latitude: r.lat.toString(),
            longitude: r.lon.toString()
        }));
        setGeoResults([]); setGeoQuery('');
    };

    const openAdd = () => {
        setForm(emptyForm); setErrors({}); setEditingId(null);
        setShowForm(true); setApiError(null); setGeoResults([]); setGeoQuery('');
    };

    const openEdit = (act) => {
        setForm({
            name: act.name, date: act.date?.split('T')[0] || '',
            time: act.time || '', location: act.location || '',
            latitude: act.latitude?.toString() || '', longitude: act.longitude?.toString() || '',
            description: act.description || '', estimatedCost: act.estimatedCost?.toString() || '',
            status: act.status || 'Planned'
        });
        setErrors({}); setEditingId(act.id); setShowForm(true);
        setApiError(null); setGeoResults([]); setGeoQuery('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true); setApiError(null);
        const payload = {
            ...form,
            latitude: form.latitude ? parseFloat(form.latitude) : null,
            longitude: form.longitude ? parseFloat(form.longitude) : null,
            estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : null
        };
        try {
            if (editingId) {
                await travelPlanService.updateActivity(planId, editingId, payload);
            } else {
                await travelPlanService.addActivity(planId, payload);
            }
            setShowForm(false); fetchActivities(); onRefresh();
        } catch (err) {
            setApiError(err.response?.data?.message || 'Greška pri snimanju');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Obrisati aktivnost?')) return;
        try {
            await travelPlanService.deleteActivity(planId, id);
            fetchActivities(); onRefresh();
        } catch { alert('Greška pri brisanju'); }
    };

    const renderCalendar = () => {
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
        const cells = [];
        for (let i = 0; i < adjustedFirst; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);
        const actsByDay = {};
        activities.forEach(a => {
            const d = new Date(a.date);
            if (d.getFullYear() === year && d.getMonth() === month) {
                const day = d.getDate();
                if (!actsByDay[day]) actsByDay[day] = [];
                actsByDay[day].push(a);
            }
        });
        const dayNames = ['Pon', 'Uto', 'Sri', '?et', 'Pet', 'Sub', 'Ned'];
        const monthNames = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];
        return (
            <div style={calStyles.container}>
                <div style={calStyles.header}>
                    <button style={calStyles.navBtn} onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}>?</button>
                    <span style={calStyles.monthLabel}>{monthNames[month]} {year}</span>
                    <button style={calStyles.navBtn} onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}>?</button>
                </div>
                <div style={calStyles.grid}>
                    {dayNames.map(d => <div key={d} style={calStyles.dayName}>{d}</div>)}
                    {cells.map((day, i) => (
                        <div key={i} style={{ ...calStyles.cell, ...(day ? {} : calStyles.emptyCell) }}>
                            {day && (
                                <>
                                    <div style={calStyles.dayNum}>{day}</div>
                                    {(actsByDay[day] || []).map(a => (
                                        <div key={a.id} style={{ ...calStyles.actChip, backgroundColor: STATUS_LABELS[a.status]?.bg || '#e3f2fd', color: STATUS_LABELS[a.status]?.color || '#1565C0' }}>
                                            {a.time && <span>{a.time} </span>}{a.name}
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) return <p>U?itavanje...</p>;

    return (
        <div>
            <div style={styles.topBar}>
                <h3 style={styles.sectionTitle}>Aktivnosti ({activities.length})</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={styles.viewToggle}>
                        <button style={{ ...styles.toggleBtn, ...(viewMode === 'list' ? styles.toggleActive : {}) }} onClick={() => setViewMode('list')}>Lista</button>
                        <button style={{ ...styles.toggleBtn, ...(viewMode === 'calendar' ? styles.toggleActive : {}) }} onClick={() => setViewMode('calendar')}>Kalendar</button>
                    </div>
                    <button style={styles.addBtn} onClick={openAdd}>+ Dodaj aktivnost</button>
                </div>
            </div>

            {showForm && (
                <div style={styles.formCard}>
                    <h4 style={styles.formTitle}>{editingId ? 'Uredi aktivnost' : 'Nova aktivnost'}</h4>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formRow}>
                            <div style={styles.field}>
                                <label style={styles.label}>Naziv *</label>
                                <input style={styles.input} name='name' value={form.name} onChange={handleChange} placeholder='npr. Posjet Akropoli' />
                                {errors.name && <span style={styles.error}>{errors.name}</span>}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Status</label>
                                <select style={styles.input} name='status' value={form.status} onChange={handleChange}>
                                    <option value='Planned'>Planirano</option>
                                    <option value='Reserved'>Rezervisano</option>
                                    <option value='Completed'>Završeno</option>
                                    <option value='Cancelled'>Otkazano</option>
                                </select>
                            </div>
                        </div>
                        <div style={styles.formRow}>
                            <div style={styles.field}>
                                <label style={styles.label}>Datum *</label>
                                <input style={styles.input} type='date' name='date' value={form.date} onChange={handleChange} />
                                {errors.date && <span style={styles.error}>{errors.date}</span>}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Vrijeme</label>
                                <input style={styles.input} type='time' name='time' value={form.time} onChange={handleChange} />
                            </div>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Lokacija (pretraži)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input style={{ ...styles.input, flex: 1 }} value={geoQuery}
                                    onChange={e => setGeoQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchGeo())}
                                    placeholder='Pretraži lokaciju...' />
                                <button type='button' style={styles.geoBtn} onClick={searchGeo} disabled={geoLoading}>
                                    {geoLoading ? '...' : '??'}
                                </button>
                            </div>
                            {geoResults.length > 0 && (
                                <div style={styles.geoDropdown}>
                                    {geoResults.map((r, i) => (
                                        <div key={i} style={styles.geoItem} onClick={() => selectGeo(r)}>?? {r.displayName}</div>
                                    ))}
                                    <div style={styles.geoClose} onClick={() => setGeoResults([])}>? Zatvori</div>
                                </div>
                            )}
                            {form.location && (
                                <div style={styles.selectedLoc}>
                                    ? {form.location}
                                    {form.latitude && <span style={{ color: '#888', fontSize: '11px' }}> ({parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)})</span>}
                                </div>
                            )}
                        </div>
                        <div style={styles.formRow}>
                            <div style={styles.field}>
                                <label style={styles.label}>Procijenjeni trošak (€)</label>
                                <input style={styles.input} type='number' min='0' step='0.01' name='estimatedCost' value={form.estimatedCost} onChange={handleChange} />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Opis</label>
                                <input style={styles.input} name='description' value={form.description} onChange={handleChange} />
                            </div>
                        </div>
                        {apiError && <div style={styles.apiError}>{apiError}</div>}
                        <div style={styles.formBtns}>
                            <button type='button' style={styles.cancelBtn} onClick={() => setShowForm(false)}>Otkaži</button>
                            <button type='submit' style={styles.saveBtn} disabled={saving}>{saving ? 'Snima...' : 'Sa?uvaj'}</button>
                        </div>
                    </form>
                </div>
            )}

            {viewMode === 'calendar' && renderCalendar()}

            {viewMode === 'list' && (
                <>
                    {activities.length === 0 && !showForm && (
                        <div style={styles.empty}><p>Nema aktivnosti. Dodajte prvu aktivnost.</p></div>
                    )}
                    <div style={styles.list}>
                        {activities.map(act => {
                            const s = STATUS_LABELS[act.status] || STATUS_LABELS.Planned;
                            return (
                                <div key={act.id} style={styles.card}>
                                    <div style={styles.cardLeft}>
                                        <div style={{ ...styles.statusDot, backgroundColor: s.color }} />
                                        <div>
                                            <div style={styles.actName}>{act.name}</div>
                                            <div style={styles.actMeta}>
                                                ?? {new Date(act.date).toLocaleDateString('bs-BA')}
                                                {act.time && <span> • ?? {act.time}</span>}
                                                {act.location && <span> • ?? {act.location}</span>}
                                                {act.estimatedCost != null && <span> • ?? {act.estimatedCost} €</span>}
                                            </div>
                                            {act.description && <p style={styles.actDesc}>{act.description}</p>}
                                        </div>
                                    </div>
                                    <div style={styles.cardRight}>
                                        <span style={{ ...styles.statusBadge, backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                                        <div style={styles.cardActions}>
                                            <button style={styles.editBtn} onClick={() => openEdit(act)}>??</button>
                                            <button style={styles.deleteBtn} onClick={() => handleDelete(act.id)}>???</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

const styles = {
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    sectionTitle: { margin: 0, color: '#333', fontSize: '18px' },
    addBtn: { padding: '8px 20px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    viewToggle: { display: 'flex', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' },
    toggleBtn: { padding: '8px 16px', backgroundColor: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#555' },
    toggleActive: { backgroundColor: '#1565C0', color: 'white' },
    formCard: { backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
    formTitle: { margin: '0 0 16px 0', color: '#1565C0' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    field: { marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '13px', color: '#555', fontWeight: '500' },
    input: { padding: '9px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' },
    error: { color: '#d32f2f', fontSize: '12px' },
    apiError: { backgroundColor: '#ffebee', color: '#d32f2f', padding: '10px', borderRadius: '4px', marginBottom: '12px', fontSize: '13px' },
    geoBtn: { padding: '9px 14px', backgroundColor: '#e3f2fd', color: '#1565C0', border: '1px solid #bbdefb', borderRadius: '4px', cursor: 'pointer' },
    geoDropdown: { backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    geoItem: { padding: '10px 12px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f5f5f5' },
    geoClose: { padding: '8px 12px', color: '#888', cursor: 'pointer', fontSize: '12px', textAlign: 'center', borderTop: '1px solid #eee' },
    selectedLoc: { fontSize: '13px', color: '#388e3c', padding: '6px 0' },
    formBtns: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
    cancelBtn: { padding: '8px 20px', backgroundColor: 'white', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
    saveBtn: { padding: '8px 20px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    empty: { textAlign: 'center', padding: '40px', color: '#888', backgroundColor: 'white', borderRadius: '8px' },
    list: { display: 'flex', flexDirection: 'column', gap: '10px' },
    card: { backgroundColor: 'white', borderRadius: '8px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardLeft: { display: 'flex', gap: '14px', alignItems: 'flex-start' },
    cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 },
    statusDot: { width: '10px', height: '10px', borderRadius: '50%', marginTop: '5px', flexShrink: 0 },
    actName: { fontSize: '15px', fontWeight: '600', marginBottom: '4px' },
    actMeta: { fontSize: '13px', color: '#666' },
    actDesc: { fontSize: '13px', color: '#777', margin: '4px 0 0 0' },
    statusBadge: { padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' },
    cardActions: { display: 'flex', gap: '6px' },
    editBtn: { padding: '5px 10px', backgroundColor: '#e3f2fd', color: '#1565C0', border: '1px solid #bbdefb', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    deleteBtn: { padding: '5px 10px', backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
};

const calStyles = {
    container: { backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '16px' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
    navBtn: { padding: '6px 14px', backgroundColor: '#e3f2fd', color: '#1565C0', border: '1px solid #bbdefb', borderRadius: '4px', cursor: 'pointer' },
    monthLabel: { fontSize: '16px', fontWeight: '600', color: '#1565C0' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' },
    dayName: { textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#888', padding: '8px 0' },
    cell: { minHeight: '80px', padding: '6px', backgroundColor: '#fafafa', borderRadius: '4px', border: '1px solid #f0f0f0' },
    emptyCell: { backgroundColor: 'transparent', border: '1px solid transparent' },
    dayNum: { fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '4px' },
    actChip: { fontSize: '11px', padding: '2px 6px', borderRadius: '3px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};