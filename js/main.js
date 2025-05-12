mapboxgl.accessToken = 'pk.eyJ1Ijoia2ltcHlrMzY1IiwiYSI6ImNtMHZ0YjJreTFqMWkyanBsdG1rYzNna2EifQ.uO2Mr3dd8pnztKfGtZLFCw';

const beforeMap = new mapboxgl.Map({
    container: 'before',
    style: 'mapbox://styles/mapbox/empty-v8',
    center: [127.1, 37.4],
    zoom: 12
});

const afterMap = new mapboxgl.Map({
    container: 'after',
    style: 'mapbox://styles/mapbox/empty-v8',
    center: [127.1, 37.4],
    zoom: 12
});

const compare = new mapboxgl.Compare(beforeMap, afterMap, '#comparison-container', {
    mousemove: true
});

function addLayers(map, isBefore) {
    map.addSource('satellite', {
        type: 'raster',
        tiles: [
            isBefore
                ? 'https://api.mapbox.com/v4/kimpyk365.alzitnva/{z}/{x}/{y}.png?access_token=' + mapboxgl.accessToken
                : 'https://api.mapbox.com/v4/kimpyk365.5shmruxo/{z}/{x}/{y}.png?access_token=' + mapboxgl.accessToken
        ],
        tileSize: 256
    });
    map.addLayer({
        id: 'satellite-layer',
        type: 'raster',
        source: 'satellite',
        paint: { 'raster-opacity': 1 }
    });

    map.addSource('change-polygons', {
        type: 'geojson',
        data: 'data/change_polygons_wgs84.geojson'
    });

    map.addLayer({
        id: 'increase-polygons',
        type: 'fill',
        source: 'change-polygons',
        filter: ['==', ['get', 'change_type'], 'increase'],
        paint: {
            'fill-color': '#00ff00',
            'fill-opacity': 0.5
        }
    });

    map.addLayer({
        id: 'decrease-polygons',
        type: 'fill',
        source: 'change-polygons',
        filter: ['==', ['get', 'change_type'], 'decrease'],
        paint: {
            'fill-color': '#ff0000',
            'fill-opacity': 0.5
        }
    });

    map.addLayer({
        id: 'all-polygons',
        type: 'fill',
        source: 'change-polygons',
        paint: {
            'fill-color': '#0000ff',
            'fill-opacity': 0.5
        },
        layout: {
            'visibility': 'none' // 기본적으로 숨김
        }
    });

    map.on('click', ['increase-polygons', 'decrease-polygons', 'all-polygons'], (e) => {
        const props = e.features[0].properties;
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<h3>${props.change_type}</h3><p>Area: ${props.area.toFixed(2)} m²</p>`)
            .addTo(map);
    });

    map.on('mouseenter', ['increase-polygons', 'decrease-polygons', 'all-polygons'], () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', ['increase-polygons', 'decrease-polygons', 'all-polygons'], () => {
        map.getCanvas().style.cursor = '';
    });

    map.on('sourcedata', (e) => {
        if (e.sourceId === 'change-polygons' && e.isSourceLoaded) {
            console.log('GeoJSON source loaded:', map.getSource('change-polygons'));
        }
    });

    map.on('error', (e) => {
        if (e.error.message.includes('Not Found')) {
            console.error('GeoJSON load error:', e);
            return;
        }
        console.error('Map error:', e);
    });
}

beforeMap.on('load', () => {
    addLayers(beforeMap, true);
    console.log('beforeMap layers:', beforeMap.getLayer('increase-polygons'), beforeMap.getLayer('decrease-polygons'));
});
afterMap.on('load', () => {
    addLayers(afterMap, false);
    console.log('afterMap layers:', afterMap.getLayer('increase-polygons'), afterMap.getLayer('decrease-polygons'));
});

// 체크박스 이벤트 핸들러
const increaseCheckbox = document.getElementById('increase');
const decreaseCheckbox = document.getElementById('decrease');

if (increaseCheckbox) {
    console.log('Increase checkbox found');
    increaseCheckbox.addEventListener('change', (e) => {
        const visibility = e.target.checked ? 'visible' : 'none';
        beforeMap.setLayoutProperty('increase-polygons', 'visibility', visibility);
        afterMap.setLayoutProperty('increase-polygons', 'visibility', visibility);
        console.log('Increase visibility set to:', visibility);
    });
} else {
    console.error('Increase checkbox not found');
}

if (decreaseCheckbox) {
    console.log('Decrease checkbox found');
    decreaseCheckbox.addEventListener('change', (e) => {
        const visibility = e.target.checked ? 'visible' : 'none';
        beforeMap.setLayoutProperty('decrease-polygons', 'visibility', visibility);
        afterMap.setLayoutProperty('decrease-polygons', 'visibility', visibility);
        console.log('Decrease visibility set to:', visibility);
    });
} else {
    console.error('Decrease checkbox not found');
}