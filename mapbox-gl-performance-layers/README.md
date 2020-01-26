# mapbox-gl-performance-layers
Mapbox GL JS plugin with custom layers for rendering massive GeoJSON datasets.

# Features
 - Fast rendering of massive data sets. (Render up to 10 million GeoJSON points.)
 - Support for `Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, `MultiPolygon` geometry types.
 - Data driven `size`, `color`, `opacity`, `outlineSize`, `outlineColor` and `outlineOpacity`.
 - Automatic switching between direct rendering for small data sets and tiled rendering for large data sets.
 - Option to sacrifice quality for performance using the `simpleRendering` option.

# Installation
```
$ npm install mapbox-gl-performance-layers
```
This library already contains TypeScript types.
There is no need to add `@types/mapbox-gl-performance-layers` to your TypeScript project.

# Basic Usage
Point layer (for static `Point` and `MultiPoint` geometry):
```javascript
import {pointLayer} from 'mapbox-gl-performance-layers';

const layer = pointLayer({
    id: 'points',
    // layer options ...
});
layer.setDataAndStyle(pointFeatureCollection, {/*style properties*/});
map.addLayer(layer);
```
Line layer (for static `LineString` and `MultiLineString` geometry):
```javascript
import {lineLayer} from 'mapbox-gl-performance-layers';

const layer = lineLayer({
    id: 'lines',
    // layer options ...
});
layer.setDataAndStyle(lineStringFeatureCollection, {/*style properties*/});
map.addLayer(layer);
```
Polygon layer (for static `Polygon` and `MultiPolygon` geometry):
```javascript
import {polygonLayer} from 'mapbox-gl-performance-layers';

const layer = polygonLayer({
    id: 'polygons',
    // layer options ...
});
layer.setDataAndStyle(polygonFeatureCollection, {/*style properties*/});
map.addLayer(layer);
```
Dynamic point layer (for `Point` and `MultiPoint` geometry streams):
```javascript
import {dynamicPointLayer} from 'mapbox-gl-performance-layers';

const layer = dynamicPointLayer({
    id: 'dynamicPoints',
    // layer options ...
});
layer.setStyle({/*style properties*/});
map.addLayer(layer);
layer.dataOperations.add(pointFeature1);
layer.dataOperations.addAll([pointFeature2, pointFeature3]);
layer.dataOperations.removeFirst();
layer.dataOperations.removeNFirst(2);
```

# API Documentation

## Point Layer
```javascript
const layer = pointLayer({
    id: 'points',
    // layer options ...
});
```

### Point Layer Methods
 - `setData(data: FeatureCollection<Point | MultiPoint, P>): void`
    - Sets the data that is to be rendered to the specified value.
    - Expensive to call for large data sets.
    - Calling will automatically result in map repaint.
 - `setStyle(styleOption: undefined | Partial<PointStyle> | (feature: Feature<Point | MultiPoint, P>) => Partial<PointStyle>): void`
    - Sets the style that's used to display the data to the specified value.
    - By passing undefined as a argument one can set the style to default value.
    - By passing a object as a argument one can override individual properties of the default style.
    - By passing a function as a argument one can set data driven styling.
    - Passed function is evaluated immediately and is reevaluated only if data gets changed with `setData`.
    - Expensive to call for large data sets.
    - Calling will automatically result in map repaint.
  - `setDataAndStyle(data: FeatureCollection<Point | MultiPoint, P>, styleOption: StyleOption<Point | MultiPoint, P, PointStyle>): void`
    - Faster way to call `setData` and `setStyle` as it avoids redundant work.
    - Expensive to call for large data sets.
    - Calling will automatically result in map repaint.
 - `clearData(): void`
    - Clears the displayed data.
    - Calling will automatically result in map repaint.
 - `setVisibility(visibility: boolean | ((map: mapboxgl.Map) => boolean) | undefined | null): void`
    - Sets the layer's visibility to the specified value.
    - By passing a boolean as a argument one can programmatically show/hide the layer.
    - By passing a function as a argument one can show/hide the layer based on the current zoom level or viewport.
 - `isVisible(): boolean`
    - Returns whether or not the layer is currently visible.

### Point Layer Options
 - `id: string` 
    - Mapbox GL JS layer id.
 - `onClick?: (feature: Feature<Point | MultiPoint, P>, e: MapMouseEvent & EventData) => void` 
    - Function that is called when user clicks on a feature.
    - Keeping this value undefined reduces the memory usage.
 - `clickSize?: number`
    - Diameter of the imaginary clickable circle in pixels.
    - Defaults to `16`.
 - `simpleRendering?: boolean`
    - Whether or not to use simpler (faster) rendering method.
    - This simple rendering will disable some of the style properties.
    - Defaults to `false`.
 - `interpolation?: number`
    - Amount of space in pixels used for color interpolation (anti-aliasing).
    - Defaults to `1.8`.
 - `tileThreshold?: number`
    - Number of features required for the layer to switch from direct rendering mode to tiled rendering mode.
    - Defaults to `100000`.
 - `numberOfTiles?: number`
    - Number of tiles cashed while using tiled rendering mode.
    - Defaults to `16`.
 - `tileWidth?: number`
    - Tile texture width in pixels.
    - Defaults to `2048`.
 - `tileHeight?: number`
    - Tile texture height in pixels.
    - Defaults to `2048`.

### Point Style Properties
 - `size: number`
    - Point diameter in pixels.
    - Defaults to `10`.
 - `color: {r: number, g: number, b: number}`
    - Fill color.
    - Value of each channel is in `[0, 1]` interval.
    - Defaults to `{r: 0, g: 0, b: 1}`.
 - `opacity: number`
    - Fill opacity.
    - Value is in `[0, 1]` interval.
    - Defaults to `0.8`.
 - `outlineSize: number`
    - Size of the outline in pixels.
    - Defaults to `0`.
    - Not available on simple rendering mode.
 - `outlineColor: {r: number, g: number, b: number}`
    - Outline color.
    - Defaults to `{r: 0, g: 0, b: 0}`.
    - Not available on simple rendering mode.
 - `outlineOpacity: number`
    - Outline opacity.
    - Defaults to `0.8`.
    - Not available on simple rendering mode.

## Line Layer
```javascript
const layer = lineLayer({
    id: 'lines',
    // layer options ...
});
```

### Line Layer Methods
 - `setData(data: FeatureCollection<LineString | MultiLineString, P>): void`
    - Sets the data that is to be rendered to the specified value.
    - Expensive to call for large data sets.
    - Calling will automatically result in map repaint.
 - `setStyle(styleOption: undefined | Partial<LineStyle> | (feature: Feature<LineString | MultiLineString, P>) => Partial<LineStyle>): void`
    - Sets the style that's used to display the data to the specified value.
    - By passing undefined as a argument one can set the style to default value.
    - By passing a object as a argument one can override individual properties of the default style.
    - By passing a function as a argument one can set data driven styling.
    - Passed function is evaluated immediately and is reevaluated only if data gets changed with `setData`.
    - Expensive to call for large data sets.
    - Calling will automatically result in map repaint.
  - `setDataAndStyle(data: FeatureCollection<LineString | MultiLineString, P>, styleOption: StyleOption<LineString | MultiLineString, P, LineStyle>): void`
    - Faster way to call `setData` and `setStyle` as it avoids redundant work.
    - Expensive to call for large data sets.
    - Calling will automatically result in map repaint.
 - `clearData(): void`
    - Clears the displayed data.
    - Calling will automatically result in map repaint.
 - `setVisibility(visibility: boolean | ((map: mapboxgl.Map) => boolean) | undefined | null): void`
    - Sets the layer's visibility to the specified value.
    - By passing a boolean as a argument one can programmatically show/hide the layer.
    - By passing a function as a argument one can show/hide the layer based on the current zoom level or viewport.
 - `isVisible(): boolean`
    - Returns whether or not the layer is currently visible.
    
### Line Layer Options
 - `id: string` 
    - Mapbox GL JS layer id.
 - `onClick?: (feature: Feature<LineString | MultiLineString, P>, e: MapMouseEvent & EventData, closestPointOnLine: {x: number, y: number}) => void` 
    - Function that is called when user clicks on a feature.
    - Keeping this value undefined reduces the memory usage.
 - `clickSize?: number`
    - Width of the imaginary clickable line in pixels.
    - Defaults to `16`.
 - `simpleRendering?: boolean`
    - Whether or not to use simpler (faster) rendering method.
    - This simple rendering may disable some of the style properties.
    - Defaults to `false`.
 - `interpolation?: number`
    - Amount of space in pixels used for color interpolation (anti-aliasing).
    - Defaults to `1.8`.
 - `tileThreshold?: number`
    - Number of features required for the layer to switch from direct rendering mode to tiled rendering mode.
    - Defaults to `100000`.
 - `numberOfTiles?: number`
    - Number of tiles cashed while using tiled rendering mode.
    - Defaults to `16`.
 - `tileWidth?: number`
    - Tile texture width in pixels.
    - Defaults to `2048`.
 - `tileHeight?: number`
    - Tile texture height in pixels.
    - Defaults to `2048`.
    
### Line Style Properties
 - `size: number`
    - Line width in pixels.
    - Defaults to `5`.
    - Not available on simple rendering mode.
 - `color: {r: number, g: number, b: number}`
    - Fill color.
    - Value of each channel is in `[0, 1]` interval.
    - Defaults to `{r: 0, g: 0, b: 1}`.
 - `opacity: number`
    - Fill opacity.
    - Value is in `[0, 1]` interval.
    - Defaults to `0.8`.
 - `outlineSize: number`
    - Size of the outline in pixels.
    - Defaults to `0`.
    - Not available on simple rendering mode.
 - `outlineColor: {r: number, g: number, b: number}`
    - Outline color.
    - Defaults to `{r: 0, g: 0, b: 0}`.
    - Not available on simple rendering mode.
 - `outlineOpacity: number`
    - Outline opacity.
    - Defaults to `0.8`.
    - Not available on simple rendering mode.

## Polygon Layer
```javascript
const layer = polygonLayer({
    id: 'polygons',
    // layer options ...
});
```

### Polygon Layer Methods
 - `setData(data: FeatureCollection<Polygon | MultiPolygon, P>): void`
    - Sets the data that is to be rendered to the specified value.
    - Expensive to call for large data sets.
    - Calling will automatically result in map repaint.
 - `setStyle(styleOption: undefined | Partial<PolygonStyle> | (feature: Feature<Polygon | MultiPolygon, P>) => Partial<PolygonStyle>): void`
    - Sets the style that's used to display the data to the specified value.
    - By passing undefined as a argument one can set the style to default value.
    - By passing a object as a argument one can override individual properties of the default style.
    - By passing a function as a argument one can set data driven styling.
    - Passed function is evaluated immediately and is reevaluated only if data gets changed with `setData`.
    - Expensive to call for large data sets.
    - Calling will automatically result in map repaint.
  - `setDataAndStyle(data: FeatureCollection<Polygon | MultiPolygon, P>, styleOption: StyleOption<Polygon | MultiPolygon, P, PolygonStyle>): void`
    - Faster way to call `setData` and `setStyle` as it avoids redundant work.
    - Expensive to call for large data sets.
    - Calling will automatically result in map repaint.
 - `clearData(): void`
    - Clears the displayed data.
    - Calling will automatically result in map repaint.
 - `setVisibility(visibility: boolean | ((map: mapboxgl.Map) => boolean) | undefined | null): void`
    - Sets the layer's visibility to the specified value.
    - By passing a boolean as a argument one can programmatically show/hide the layer.
    - By passing a function as a argument one can show/hide the layer based on the current zoom level or viewport.
 - `isVisible(): boolean`
    - Returns whether or not the layer is currently visible.
    
### Polygon Layer Options
 - `id: string` 
    - Mapbox GL JS layer id.
 - `onClick?: (feature: Feature<Polygon | MultiPolygon, P>, e: MapMouseEvent & EventData) => void` 
    - Function that is called when user clicks on a feature.
    - Keeping this value undefined reduces the memory usage.
 - `simpleRendering?: boolean`
    - Whether or not to use simpler (faster) rendering method.
    - This simple rendering may disable some of the style properties.
    - Defaults to `false`.
 - `interpolation?: number`
    - Amount of space in pixels used for color interpolation (anti-aliasing).
    - Defaults to `1.8`.
 - `tileThreshold?: number`
    - Number of features required for the layer to switch from direct rendering mode to tiled rendering mode.
    - Defaults to `100000`.
 - `numberOfTiles?: number`
    - Number of tiles cashed while using tiled rendering mode.
    - Defaults to `16`.
 - `tileWidth?: number`
    - Tile texture width in pixels.
    - Defaults to `2048`.
 - `tileHeight?: number`
    - Tile texture height in pixels.
    - Defaults to `2048`.
    
### Polygon Style Properties
 - `color: {r: number, g: number, b: number}`
    - Fill color.
    - Value of each channel is in `[0, 1]` interval.
    - Defaults to `{r: 0, g: 0, b: 1}`.
 - `opacity: number`
    - Fill opacity.
    - Value is in `[0, 1]` interval.
    - Defaults to `0.8`.
 - `outlineSize: number`
    - Size of the outline in pixels.
    - Defaults to `0`.
    - Not available on simple rendering mode.
 - `outlineColor: {r: number, g: number, b: number}`
    - Outline color.
    - Defaults to `{r: 0, g: 0, b: 0}`.
    - Not available on simple rendering mode.
 - `outlineOpacity: number`
    - Outline opacity.
    - Defaults to `0.8`.
    - Not available on simple rendering mode.
     
## Dynamic Point Layer
```javascript
const layer = dynamicPointLayer({
    id: 'dynamicPoints',
    // layer options ...
});
```

### Dynamic Point Layer Properties And Methods
 - `readonly dataOperations: DataOperations<Feature<Point | MultiPoint>>`
    - Object used to interact with layers internal data.
 - `setStyle(styleOption: undefined | Partial<PointStyle> | (feature: Feature<Point | MultiPoint, P>) => Partial<PointStyle>): void`
    - Sets the style that's used to display the data to the specified value.
    - By passing undefined as a argument one can set the style to default value.
    - By passing a object as a argument one can override individual properties of the default style.
    - By passing a function as a argument one can set data driven styling.
    - Passed function is evaluated immediately and is reevaluated only if data gets changed with `setData`.
    - Expensive to call for large data sets.
    - Calling will automatically result in map repaint.
 - `clearData(): void`
    - Clears the displayed data.
    - Calling will automatically result in map repaint.
 - `setVisibility(visibility: boolean | ((map: mapboxgl.Map) => boolean) | undefined | null): void`
    - Sets the layer's visibility to the specified value.
    - By passing a boolean as a argument one can programmatically show/hide the layer.
    - By passing a function as a argument one can show/hide the layer based on the current zoom level or viewport.
 - `isVisible(): boolean`
    - Returns whether or not the layer is currently visible.

### Dynamic Point Data Operations
 - `add(element: Feature<Point | MultiPoint>): void`
    - Adds the specified feature to the data set.
 - `removeFirst(): Feature<Point | MultiPoint> | null`
    - Removes the earliest added feature from the data set.
 - `removeLast(): Feature<Point | MultiPoint> | null`
    - Removes the latest added feature from the data set.
 - `clear(): void`
    - Removes all features from the data set.
 - `getArray(): ReadonlyArray<Feature<Point | MultiPoint>>`
    - Returns a readonly array of all features in the dataset.
    - This operation is not expensive.
    - Since the array is readonly modifying it is not advised.
 - `addAll(elements: Feature<Point | MultiPoint>[]): void`
    - Adds multiple specified features to the data set.
 - `removeNFirst(n: number): Feature<Point | MultiPoint>[]`
    - Removes n earliest added features from the data set.
 - `removeNLast(n: number): Feature<Point | MultiPoint>[]`
    - Removes n latest added features from the data set.

### Dynamic Point Layer Options
 - Identical to `Point Layer Options`.

### Dynamic Point Style Properties
 - Identical to `Point Style Properties`.
