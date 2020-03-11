#!/bin/bash
for file in *.geojson; do
  jq . $file > /tmp/tmp.geojson && cp /tmp/tmp.geojson $file
done
