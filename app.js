const mapboxAccessToken = 'pk.eyJ1IjoicGljdGVycmF1c2VyIiwiYSI6ImNqdHNlZ2dsNjB6cjIzeWxiYjR0b3Zra2UifQ.auZHCHIxzNscxGy_inunhg'

var app = new Vue({
  el: '#app',
  data: {
    sources: [],
    sourceLayer: null,
  },
  methods: {
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
      this.sourceLayer = L.tileLayer.wms(source.properties.url, options)
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
      const filenames = ['wms/lyon.geojson', 'wms/zurich.geojson']
      this.sources = []
      for (const filename of filenames) {
        const resp = await axios.get(filename)
        this.sources.push(resp.data)
      }
    }
  },
  mounted () {
    this.loadSources()

    this.map = L.map('map').setView([45.505, 5], 5)

    // List of mapbox styles
    // https://gis.stackexchange.com/questions/244788/map-ids-to-add-mapbox-basemaps-to-leaflet-or-openlayers/244797
    L.tileLayer('http://a.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
        attribution: '&copy; <a href="https://www.mapbox.com">Mapbox</a>'
    }).addTo(this.map)

  }
})
