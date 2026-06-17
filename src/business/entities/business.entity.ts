// Define flexible interfaces for related entities that match Prisma select queries
interface BusinessOwner {
  id: string;
  name: string;
  email: string;
}

// Base location fields that are commonly selected
interface BaseBusinessLocation {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
}

// Extended location with optional fields for more detailed queries
type BusinessLocation = BaseBusinessLocation & {
  address?: string;
  businessId?: string;
  capacity?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  experience?: string | null;
  amenities?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  openingHours?: string | null;
  ownerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Allow for any additional fields that might come from complex Prisma queries
  [key: string]: any;
};

interface BusinessUserRole {
  userId: string;
  roleId: string;
  businessId?: string | null;
  locationId?: number | null;
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  // Nested relations that might be included
  user?: {
    id: string;
    name: string;
    email: string;
  };
  role?: {
    id: string;
    name: string;
  };
  // Allow for any additional fields from Prisma relations
  [key: string]: any;
}

interface BusinessCount {
  locations?: number;
  userRoles?: number;
}

export class BusinessEntity {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: BusinessOwner;
  locations?: BusinessLocation[];
  userRoles?: BusinessUserRole[];
  _count?: BusinessCount;

  // Accept any data structure from Prisma and map it to the entity
  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.ownerId = data.ownerId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.owner = data.owner;
    this.locations = data.locations;
    this.userRoles = data.userRoles;
    this._count = data._count;
  }
}
