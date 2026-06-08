import { useState, useEffect } from 'react';
import travelPlanService from '../../services/travelPlanService';

export default function MapTab({ planId }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mapReady, setMapReady] = useState(false);
    const [mapError, setMapError] = useState(null);

    useEffect(() => {
        travelPlanService.getActivities(planId)
            .then(data => {
                const sorted = [...data]
                    .filter(a => a.latitude && a.longitude)
                    .sort((a, b) => new Date(a.date + 'T' + (a.time || '00:00')) - new Date(b.date + 'T' + (b.time || '00:00')));
                setActivities(sorted);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [planId]);

    useEffect(() => {
        if (loading || activities.length === 0) return;
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
        if (!window.L) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => setTimeout(() => setMapReady(true), 100);
            script.onerror = () => setMapError('Nije moguće učitati mapu. Provjerite internet konekciju.');
            document.head.appendChild(script);
        } else {
            setMapReady(true);
        }
    }, [loading, activities]);

    useEffect(() => {
        if (!mapReady || activities.length === 0 || !window.L) return;
        const L = window.L;
        const mapEl = document.getElementById('travel-map');
        if (!mapEl || mapEl._leaflet_id) return;

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const positions = activities.map(a => [a.latitude, a.longitude]);
        const map = L.map('travel-map').setView(positions[0], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const numberedIcon = (n) => L.divIcon({
            className: '',
            html: `<div style="background:#1565C0;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.4);border:2px solid white;">${n}</div>`,
            iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -20],
        });

        if (positions.length > 1) {
            L.polyline(positions, { color: '#1565C0', weight: 3, opacity: 0.7, dashArray: '8 4' }).addTo(map);
        }

        activities.forEach((act, i) => {
            L.marker([act.latitude, act.longitude], { icon: numberedIcon(i + 1) })
                .bindPopup(`<div style="min-width:180px"><strong style="font-size:14px">${i + 1}. ${act.name}</strong><br/>${act.location ? `<span style="color:#666">📍 ${act.location}</span><br/>` : ''}<span style="color:#555">📅 ${new Date(act.date).toLocaleDateString('bs-BA')}</span>${act.time ? ` • 🕐 ${act.time}` : ''}<br/>${act.estimatedCost != null ? `<span style="color:#388e3c">💰 ${act.estimatedCost} €</span>` : ''}${act.description ? `<br/><span style="color:#777;font-size:12px">${act.description}</span>` : ''}</div>`)
                .addTo(map);
        });

        if (positions.length > 1) map.fitBounds(positions, { padding: [40, 40] });
        return () => { if (map) map.remove(); };
    }, [mapReady, activities]);

    if (loading) return <p>Učitavanje aktivnosti...</p>;

    if (activities.length === 0) return (
        <div style={styles.empty}>
            <div style={styles.emptyIcon}>🗺️</div>
            <h3>Nema aktivnosti na mapi</h3>
            <p>Da biste vidjeli rutu putovanja, dodajte aktivnosti sa lokacijom (koristite pretragu lokacije u tabu "Aktivnosti").</p>
        </div>
    );

    return (
        <div>
            <div style={styles.topBar}>
                <h3 style={styles.sectionTitle}>Ruta putovanja ({activities.length} lokacija)</h3>
            </div>
            <div style={styles.locationList}>
                {activities.map((act, i) => (
                    <div key={act.id} style={styles.locItem}>
                        <div style={styles.locNum}>{i + 1}</div>
                        <div>
                            <div style={styles.locName}>{act.name}</div>
                            <div style={styles.locMeta}>
                                {act.location && <span>📍 {act.location} • </span>}
                                <span>📅 {new Date(act.date).toLocaleDateString('bs-BA')}</span>
                                {act.time && <span> • 🕐 {act.time}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {mapError && <div style={styles.mapError}>{mapError}</div>}
            <div id='travel-map' style={{ ...styles.mapContainer, display: mapError ? 'none' : 'block' }} />
            {!mapReady && !mapError && <div style={styles.mapLoading}>Učitavanje mape...</div>}
        </div>
    );
}

const styles = {
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    sectionTitle: { margin: 0, color: '#333', fontSize: '18px' },
    empty: { textAlign: 'center', padding: '60px 20px', color: '#888', backgroundColor: 'white', borderRadius: '8px' },
    emptyIcon: { fontSize: '48px', marginBottom: '16px' },
    locationList: { backgroundColor: 'white', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: '8px', flexWrap: 'wrap' },
    locItem: { display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '8px', minWidth: '200px' },
    locNum: { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1565C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 },
    locName: { fontSize: '14px', fontWeight: '600' },
    locMeta: { fontSize: '12px', color: '#888', marginTop: '2px' },
    mapContainer: { width: '100%', height: '480px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
    mapLoading: { width: '100%', height: '480px', backgroundColor: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' },
    mapError: { padding: '16px', backgroundColor: '#ffebee', color: '#d32f2f', borderRadius: '8px', marginBottom: '16px' },
};