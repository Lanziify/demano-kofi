import { queryOptions } from '@tanstack/react-query';
import { getBarangays, getCitiesMunicipalities, getProvinces, getRegions } from '../api/psgc.api';

export const psgcQueries = {
  regions: () => {
    return queryOptions({
      queryKey: ['regions'],
      queryFn: () => getRegions(),
    });
  },

  provinces: (region: string) => {
    return queryOptions({
      queryKey: ['provinces', region],
      queryFn: () => getProvinces(region),
      enabled: !!region
    });
  },

  citiesMunicipalities: (province: string) => {
    return queryOptions({
      queryKey: ['citiesMunicipalities', province],
      queryFn: () => getCitiesMunicipalities(province),
      enabled: !!province
    });
  },

  barangays: (citiesMunicipalities: string) => {
    return queryOptions({
      queryKey: ['branagays', citiesMunicipalities],
      queryFn: () => getBarangays(citiesMunicipalities),
      enabled: !!citiesMunicipalities
    });
  },
};
