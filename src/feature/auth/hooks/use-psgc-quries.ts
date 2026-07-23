import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { psgcQueries } from "../queries/psgc.queries";

interface UsePsgcQueriesProps {
  region: string;
  province: string;
  municipality: string;
}

export const usePsgcQueries = ({
  region,
  province,
  municipality,
}: UsePsgcQueriesProps) => {
  const regions = useQuery(psgcQueries.regions());

  const provinces = useQuery(psgcQueries.provinces(region));

  const municipalities = useQuery(psgcQueries.citiesMunicipalities(province));

  const barangays = useQuery(psgcQueries.barangays(municipality));

  return {
    regions,
    provinces,
    municipalities,
    barangays,
  };
};
