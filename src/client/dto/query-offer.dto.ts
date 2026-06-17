export interface QueryOfferDto {
  locationId?: string;
  categoryId?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  minDiscount?: string;
  activeOnly?: string;
  globalOnly?: string;
  page?: string;
  limit?: string;
}

export interface ParsedQueryOfferDto {
  locationId?: number;
  categoryId?: number;
  name?: string;
  startDate?: string;
  endDate?: string;
  minDiscount?: number;
  activeOnly?: boolean;
  globalOnly?: boolean;
  page?: number;
  limit?: number;
}
