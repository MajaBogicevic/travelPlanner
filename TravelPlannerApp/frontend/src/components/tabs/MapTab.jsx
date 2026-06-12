import { useState, useEffect } from 'react';
import travelPlanService from '../../services/travelPlanService';
import clockIcon from '../../assets/clock.webp';
import locationIcon from '../../assets/location.webp';

export default function MapTab({ planId }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mapReady, setMapReady] = useState(false);
    const [mapError, setMapError] = useState(null);
    const LEAFLET_CDN = import.meta.env.VITE_LEAFLET_CDN;
    const OSM_TILE_URL = import.meta.env.VITE_OSM_TILE_URL;
    const OSM_ATTRIBUTION_URL = import.meta.env.VITE_OSM_ATTRIBUTION_URL;

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
            link.href = `${LEAFLET_CDN}/leaflet.css`;
            document.head.appendChild(link);
        }
        if (!window.L) {
            const script = document.createElement('script');
            script.src = `${LEAFLET_CDN}/leaflet.js`;
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
            iconRetinaUrl: `${LEAFLET_CDN}/images/marker-icon-2x.png`,
            iconUrl: `${LEAFLET_CDN}/images/marker-icon.png`,
            shadowUrl: `${LEAFLET_CDN}/images/marker-shadow.png`,
        });

        const positions = activities.map(a => [a.latitude, a.longitude]);
        const map = L.map('travel-map').setView(positions[0], 12);
        L.tileLayer(OSM_TILE_URL, {
            attribution: `© <a href="${OSM_ATTRIBUTION_URL}">OpenStreetMap</a>`,
        }).addTo(map);

        const numberedIcon = (n) => L.divIcon({
            className: '',
            html: `<div style="background:#40916c;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.4);border:2px solid white;">${n}</div>`,
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
            <div style={styles.emptyIcon}></div>
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
                                {act.location && <span> 
                                     <img src={locationIcon} alt="Lokacija" style={{ width: '12px', height: '12px', objectFit: 'contain', marginRight: '8px', marginTop: '10px' }} />
                                     {act.location}  
                                 </span>}
                                <span>  
                                    <img src={clockIcon} alt="Izmeni" style={{ width: '12px', height: '12px', objectFit: 'contain', marginRight: '8px', marginLeft: '15px' }} />
                                    {new Date(act.date).toLocaleDateString('bs-BA')}
                                </span>
                                {act.time && <span> • {act.time}</span>}
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
    sectionTitle: { margin: 0, color: 'var(--text-h)', fontSize: '18px', fontFamily: 'var(--serif)' },
    empty: { textAlign: 'center', padding: '60px 20px', color: 'var(--text)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' },
    emptyIcon: { fontSize: '48px', marginBottom: '16px' },
    locationList: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' },
    locItem: { display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '8px', minWidth: '200px' },
    locNum: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 },
    locName: { fontSize: '14px', fontWeight: '600', color: 'var(--text-h)' },
    locMeta: { fontSize: '12px', color: 'var(--text)', marginTop: '2px' },
    mapContainer: { width: '100%', height: '480px', borderRadius: 'var(--radius-md)', overflow: 'hidden' },
    mapLoading: { width: '100%', height: '480px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' },
    mapError: { padding: '16px', background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' },
};