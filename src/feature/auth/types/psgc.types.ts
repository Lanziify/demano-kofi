export interface Region {
  code: string;
  name: string;
}

export interface Province {
  code: string;
  name: string;
  region: string;
}

export interface CityMunicipality {
  code: string;
  name: string;
  // TODO: add missing types from doc
}

export interface Barangay {
  code: string;
  name: string;
  // TODO: add missing types from doc
}

export type RegionResponse = { data: Region[] };
export type ProvinceResponse = { data: Province[] };
export type CityMunicipalityResponse = { data: CityMunicipality[] };
export type BarangayResponse = { data: Barangay[] };
