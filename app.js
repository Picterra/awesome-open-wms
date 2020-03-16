const mapboxAccessToken = 'pk.eyJ1IjoicGljdGVycmF1c2VyIiwiYSI6ImNqdHNlZ2dsNjB6cjIzeWxiYjR0b3Zra2UifQ.auZHCHIxzNscxGy_inunhg'

const SOURCE_FILES = [
  'sources/lyon.geojson',
  'sources/zurich.geojson',
  'sources/gsi_cyber_japan.geojson',
  'sources/solothurn_2017.geojson',
  'sources/solothurn_2015.geojson',
  'sources/luxembourg.geojson'
]

const PICTERRA_BASE_URL = 'https://app.picterra.ch'

var app = new Vue({
  el: '#app',
  data: {
    sources: [],
    sourceLayer: null,
  },
  methods: {
    picterraImportURL(source) {
      let url = null
      if (source.properties.type === 'wms') {
        url = encodeURIComponent(source.properties.url + '?' +
          'layers=' + source.properties.params.layers + '&' +
          'version=' + source.properties.params.version + '&' +
          'format=' + source.properties.params.format
        )
      } else if (source.properties.type == 'xyz') {
        url = encodeURIComponent(source.properties.url)
      } else {
        throw new Error('Unknown source type: ' + source.properties.type)
      }
      return PICTERRA_BASE_URL + '/import_remote?url=' + url + '&' +
        'res_m=' + source.properties.res_m + '&' +
        'type=' + source.properties.type + '&' +
        'name=' + source.properties.name + '&' +
        'init_lat=' + source.properties.lat + '&' +
        'init_lng=' + source.properties.lon + '&' +
        'init_zoom=' + source.properties.zoom + '&' +
        'tile_size=' + source.properties.tile_size + '&' +
        'attribution=' + source.properties.copyright
    },
    onCardClicked (source) {
      this.display(source)
    },
    display (source) {
      if (this.sourceLayer !== null) {
        this.sourceLayer.remove()
      }
      const bounds = L.geoJSON(source).getBounds()
      const options = Object.assign(
        {
          attribution: source.properties.copyright,
          bounds: bounds,
        },
        source.properties.params
      )

      if (source.properties.type === 'wms') {
        this.sourceLayer = L.tileLayer.wms(source.properties.url, options)
      } else {
        this.sourceLayer = L.tileLayer(source.properties.url, options)
      }
      this.sourceLayer.addTo(this.map)
      L.geoJSON(source, {
        style: {
          "color": "#7800cc",
          "fillOpacity": 0
        }
      }).addTo(this.map)
      this.map.fitBounds(bounds)
    },
    async loadSources () {
      this.sources = []
      for (const filename of SOURCE_FILES) {
        const resp = await axios.get(filename)
        this.sources.push(resp.data)
      }
    }
  },
  mounted () {
    this.loadSources()

    this.map = L.map('map').setView([45.505, 5], 5)
    this.map.zoomControl.setPosition('bottomright')

    // List of mapbox styles
    // https://gis.stackexchange.com/questions/244788/map-ids-to-add-mapbox-basemaps-to-leaflet-or-openlayers/244797
    L.tileLayer('http://a.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
        attribution: '&copy; <a href="https://www.mapbox.com">Mapbox</a>'
    }).addTo(this.map)

  }
})
