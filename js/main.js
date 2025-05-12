mapboxgl.accessToken = 'pk.eyJ1Ijoia2ltcHlrMzY1IiwiYSI6ImNtMHZ0YjJreTFqMWkyanBsdG1rYzNna2EifQ.uO2Mr3dd8pnztKfGtZLFCw'; // Mapbox 토큰 입력

// 첫 번째 맵 (Period 1)
const beforeMap = new mapboxgl.Map({
    container: 'before',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [127.4, 37.6],
    zoom: 10
});

// 두 번째 맵 (Period 2)
const afterMap = new mapboxgl.Map({
    container: 'after',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [127.4, 37.6],
    zoom: 10
});

// 비교 플러그인 초기화
const compare = new mapboxgl.Compare(beforeMap, afterMap, '#comparison-container', {
    mousemove: true // 마우스 이동으로 슬라이더 조정
});

// 공통 레이어 추가 함수
function addLayers(map) {
    map.addSource('satellite', {
        type: 'raster',
        tiles: map === beforeMap 
            ? ['mapbox://kimpyk365.alzitnva'] 
            : ['mapbox://kimpyk365.5shmruxo'],
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
        data: 'data/change_polygons.geojson'
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

    map.on('click', ['increase-polygons', 'decrease-polygons'], (e) => {
        const props = e.features[0].properties;
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<h3>${props.change_type}</h3><p>Area: ${props.area.toFixed(2)} m²</p>`)
            .addTo(map);
    });

    map.on('mouseenter', ['increase-polygons', 'decrease-polygons'], () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', ['increase-polygons', 'decrease-polygons'], () => {
        map.getCanvas().style.cursor = '';
    });
}

// 맵 로드 후 레이어 추가
beforeMap.on('load', () => addLayers(beforeMap));
afterMap.on('load', () => addLayers(afterMap));

// 체크박스 이벤트 핸들러
document.getElementById('increase').addEventListener('change', (e) => {
    const visibility = e.target.checked ? 'visible' : 'none';
    beforeMap.setLayoutProperty('increase-polygons', 'visibility', visibility);
    afterMap.setLayoutProperty('increase-polygons', 'visibility', visibility);
});
document.getElementById('decrease').addEventListener('change', (e) => {
    const visibility = e.target.checked ? 'none' : 'visible';
    beforeMap.setLayoutProperty('decrease-polygons', 'visibility', visibility);
    afterMap.setLayoutProperty('decrease-polygons', 'visibility', visibility);
});