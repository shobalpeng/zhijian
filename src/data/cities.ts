export interface CityData {
  name: string;
  lat: number;
  lng: number;
  country: string; // 'china' | 'world'
}

export const presetCities: CityData[] = [
  // China
  { name: "北京", lat: 39.9042, lng: 116.4074, country: "china" },
  { name: "上海", lat: 31.2304, lng: 121.4737, country: "china" },
  { name: "广州", lat: 23.1291, lng: 113.2644, country: "china" },
  { name: "深圳", lat: 22.5431, lng: 114.0579, country: "china" },
  { name: "成都", lat: 30.5728, lng: 104.0668, country: "china" },
  { name: "重庆", lat: 29.4316, lng: 106.9123, country: "china" },
  { name: "杭州", lat: 30.2741, lng: 120.1551, country: "china" },
  { name: "南京", lat: 32.0603, lng: 118.7969, country: "china" },
  { name: "西安", lat: 34.3416, lng: 108.9398, country: "china" },
  { name: "武汉", lat: 30.5928, lng: 114.3055, country: "china" },
  { name: "长沙", lat: 28.2282, lng: 112.9388, country: "china" },
  { name: "厦门", lat: 24.4798, lng: 118.0894, country: "china" },
  { name: "青岛", lat: 36.0671, lng: 120.3826, country: "china" },
  { name: "大连", lat: 38.9140, lng: 121.6147, country: "china" },
  { name: "三亚", lat: 18.2528, lng: 109.5120, country: "china" },
  { name: "昆明", lat: 25.0389, lng: 102.7183, country: "china" },
  { name: "大理", lat: 25.5895, lng: 100.2254, country: "china" },
  { name: "丽江", lat: 26.8721, lng: 100.2299, country: "china" },
  { name: "拉萨", lat: 29.6500, lng: 91.1000, country: "china" },
  { name: "哈尔滨", lat: 45.8038, lng: 126.5350, country: "china" },
  { name: "桂林", lat: 25.2736, lng: 110.2900, country: "china" },
  { name: "张家界", lat: 29.1170, lng: 110.4780, country: "china" },
  { name: "黄山", lat: 29.7147, lng: 118.3375, country: "china" },
  // World
  { name: "东京", lat: 35.6762, lng: 139.6503, country: "world" },
  { name: "首尔", lat: 37.5665, lng: 126.9780, country: "world" },
  { name: "曼谷", lat: 13.7563, lng: 100.5018, country: "world" },
  { name: "新加坡", lat: 1.3521, lng: 103.8198, country: "world" },
  { name: "巴厘岛", lat: -8.3405, lng: 115.0920, country: "world" },
  { name: "马尔代夫", lat: 4.1755, lng: 73.5093, country: "world" },
  { name: "巴黎", lat: 48.8566, lng: 2.3522, country: "world" },
  { name: "伦敦", lat: 51.5074, lng: -0.1278, country: "world" },
  { name: "罗马", lat: 41.9028, lng: 12.4964, country: "world" },
  { name: "纽约", lat: 40.7128, lng: -74.0060, country: "world" },
  { name: "悉尼", lat: -33.8688, lng: 151.2093, country: "world" },
];

export function getCityByName(name: string): CityData | undefined {
  return presetCities.find((c) => c.name === name);
}

export function latLngToXY(lat: number, lng: number, mapType: "china" | "world", w: number, h: number): { x: number; y: number } {
  if (mapType === "china") {
    // China: lat ~18-54, lng ~73-135
    const x = ((lng - 73) / (135 - 73)) * w;
    const y = ((54 - lat) / (54 - 18)) * h;
    return { x, y };
  } else {
    // World: lat ~-60-80, lng ~-180-180 (Mercator-like)
    const x = ((lng + 180) / 360) * w;
    const y = ((80 - lat) / 140) * h;
    return { x, y };
  }
}
