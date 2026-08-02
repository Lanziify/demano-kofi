import axios from 'axios';
import { withClientErrorHandling } from '@/lib/errors/client-error-parser';
import type {
  BarangayResponse,
  CityMunicipalityResponse,
  ProvinceResponse,
  RegionResponse,
} from '@/types/psgc';

export const getRegions = withClientErrorHandling(async () => {
  const { data } = await axios.get<ProvinceResponse>(
    `${process.env.NEXT_PUBLIC_PSGC_API_URL}/regions`
  );

  return data.data;
});

export const getProvinces = withClientErrorHandling(async (region: string) => {
  const { data } = await axios.get<RegionResponse>(
    `${process.env.NEXT_PUBLIC_PSGC_API_URL}/regions/${region}/provinces`
  );

  return data.data;
});

export const getCitiesMunicipalities = withClientErrorHandling(
  async (province: string) => {
    const { data } = await axios.get<CityMunicipalityResponse>(
      `${process.env.NEXT_PUBLIC_PSGC_API_URL}/provinces/${province}/cities-municipalities`
    );

    return data.data;
  }
);

export const getBarangays = withClientErrorHandling(
  async (citiesMunicipalities: string) => {
    const { data } = await axios.get<BarangayResponse>(
      `${process.env.NEXT_PUBLIC_PSGC_API_URL}/cities-municipalities/${citiesMunicipalities}/barangays`
    );

    return data.data;
  }
);
