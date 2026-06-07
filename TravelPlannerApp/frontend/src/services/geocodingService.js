const geocodingService = {
    search: async (query) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
        const res = await fetch(url, {
            headers: {
                'Accept-Language': 'bs,hr,sr,en',
                'User-Agent': 'TravelPlannerApp/1.0',
            }
        });
        if (!res.ok) throw new Error('Geocoding greška');
        const data = await res.json();
        return data.map(r => ({
            displayName: r.display_name,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
        }));
    }
};

export default geocodingService;