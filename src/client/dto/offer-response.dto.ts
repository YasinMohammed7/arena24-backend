export interface OfferResponseDto {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  startDate: Date;
  endDate: Date;
  discount: number | null;
  location: {
    id: number;
    name: string;
    type: string;
    address: string;
  } | null;
  category: {
    id: number;
    name: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
