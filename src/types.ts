export interface CalculatedMetrics {
  net_area_m2: number;
  selected_soil_depth_cm: number;
  calculated_soil_volume_m3: number;
  selected_grass_density_per_m2: number;
  total_grass_plugs_needed: number;
}

export interface FencingDimensions {
  north_fence_net_meters: number;
  south_fence_net_meters: number;
  east_fence_net_meters: number;
  west_fence_net_meters: number;
}

export interface InitialWalls {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GardenTemplate {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string;
  netAreaM2: number;
  initialWalls: InitialWalls;
  polygonPoints: [number, number][]; // Relative coordinates (0-100)
}
