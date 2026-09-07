export type Sector = 'farmer' | 'consumer' | 'bulk_buyer' | 'driver' | 'admin';
export type SectorType = Sector;

export interface VoiceIntent {
  action: string;
  transcript: string;
  entities?: Record<string, any>;
}

export interface DayData {
  day: string;
  date: string;
  demandKg: number;
  supplyKg: number;
  marketRate: number;
}

export type LanguageCode =
  | 'en'
  | 'te'
  | 'hi'
  | 'ta'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'bn'
  | 'gu'
  | 'pa'
  | 'or'
  | 'as'
  | 'ur';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag?: string;
}

export type ProductCategory =
  | 'Cereals'
  | 'Pulses'
  | 'Vegetables'
  | 'Fruits'
  | 'Oilseeds'
  | 'Other';

export interface ProductCatalogItem {
  id: string;
  name: string;
  category: ProductCategory;
  unit: string;
  defaultVarieties: string[];
  image: string;
  mspBenchmark: number; // ₹ per unit
  dailyRate: number; // Today's market rate
  historicalAvg7Days: number;
  aiMaxGuardrail: number; // Configurable AI marketplace price limit
  demandStatus: 'High' | 'Moderate' | 'Low';
  supplyStatus: 'High' | 'Moderate' | 'Low';
  transportEstPerKg: number;
}

export interface DayData {
  day: string;
  date: string;
  demandKg: number;
  supplyKg: number;
  marketRate: number;
}

export interface ProductDemandSupplyHistory {
  productId: string;
  productName: string;
  days: DayData[];
}

export type AgingStatus = 'normal' | 'aging' | 'urgent' | 'critical';

export interface FarmerProduceListing {
  id: string;
  batchId: string;
  farmerId: string;
  farmerName: string;
  village: string;
  region: string;
  distanceKm: number;
  category: ProductCategory;
  product: string;
  variety: string;
  availableQty: number;
  originalQty: number;
  quality: 'Good' | 'Fair' | 'Premium';
  farmerPrice: number;
  location: string;
  imageUrl: string;
  videoUrl?: string;
  agingStatus: AgingStatus;
  daysInStock: number;
  aiPriceStatus: 'within_guardrail' | 'above_guardrail';
  hasQualityCheck?: boolean;
  qualityCheckResult?: 'acceptable' | 'manual_review' | 'potential_defect';
  qualityCheckNotes?: string;
}

export interface ExternalSaleRecord {
  id: string;
  farmerId: string;
  listingId: string;
  product: string;
  variety: string;
  soldQty: number;
  pricePerKg: number;
  channel: string;
  timestamp: string;
}

export type OrderStatus =
  | 'placed'
  | 'ai_matching'
  | 'farmer_confirmed'
  | 'packed'
  | 'transport_confirmed'
  | 'in_transit'
  | 'delivered'
  | 'ready_for_pickup'
  | 'collected'
  | 'rejected_rematched';

export interface OrderItem {
  listingId: string;
  product: string;
  variety: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  imageUrl: string;
  quality: string;
}

export type PaymentMethod = 'cod' | 'online';

export interface Order {
  id: string;
  batchId: string;
  consumerId: string;
  consumerName: string;
  consumerLocation: string;
  items: OrderItem[];
  fulfillmentType: 'pickup' | 'transport';
  deliveryAddress?: string;
  pickupPoint?: string;
  pickupCode?: string;
  status: OrderStatus;
  totalProduceCost: number;
  originalDeliveryCharge: number;
  finalDeliveryCharge: number;
  isPooled: boolean;
  poolSavings: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: 'paid' | 'pending_cod' | 'collected_cod' | 'settled';
  produceAmount?: number; // Transferred to farmer
  deliveryAmount?: number; // Transferred to driver
  driverId?: string;
  driverName?: string;
  driverVehicle?: string;
  driverPhone?: string;
  driverStage?: 'assigned' | 'going_to_pickup' | 'produce_collected' | 'in_transit' | 'delivered';
  driverPickupEta?: string;
  createdAt: string;
  deliveredAt?: string;
  rejectedByFarmerIds?: string[];
  consumerRating?: number;
  driverRating?: number;
}

export interface BulkFarmerAllocation {
  farmerId: string;
  farmerName: string;
  village: string;
  allocatedQty: number;
  pricePerKg: number;
  status: 'pending' | 'accepted' | 'rejected' | 'packed';
}

export interface BulkRequirement {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerOrg: string;
  buyerType: 'Hotel' | 'Restaurant' | 'Supermarket' | 'Hostel' | 'Processor' | 'Retailer' | 'Institution';
  product: string;
  variety: string;
  quantity: number;
  quality: string;
  destination: string;
  deliveryDeadline: string;
  maxAcceptablePrice: number;
  status: 'pending_ai' | 'matched' | 'transport_coordinating' | 'in_transit' | 'fulfilled' | 'cancelled';
  fulfillmentPlan: BulkFarmerAllocation[];
  confirmedQty: number;
  totalEstimatedAmount: number;
  isCancelled?: boolean;
  recoveryPlan?: {
    redirectedTo: string[];
    recoveredQty: number;
    status: 'recovering' | 'recovered';
  };
}

export type DriverWorkType = 'full_time' | 'part_time';

export interface Driver {
  id: string;
  name: string;
  mobile: string;
  preferredLanguage: LanguageCode;
  workType: DriverWorkType;
  vehicleType: '3-Wheeler' | 'Pickup' | 'Mini Truck' | 'Truck';
  vehicleName: string; // e.g. "Tata Ace", "Mahindra Bolero Pickup"
  vehicleModel: string;
  capacityKg: number;
  registrationNumber: string;
  serviceArea: string; // e.g. "Vijayawada (25 km radius)"
  location: string;
  availabilityHours: string; // e.g. "6 AM – 2 PM"
  isOnline?: boolean;
  status: 'available' | 'busy' | 'offline';
  todayEarnings: number;
  weekEarnings: number;
  completedJobsCount: number;
  rating: number;
  codCashInHand?: number; // Total Cash collected by driver from COD orders
  codSettledAmount?: number;
  walletBalance?: number; // Earned delivery charges
  associatedFarmerIds?: string[]; // Optional/legacy
}

export type TransportJobStatus =
  | 'open'
  | 'available'
  | 'assigned'
  | 'accepted'
  | 'going_to_pickup'
  | 'produce_collected'
  | 'in_transit'
  | 'delivered'
  | 'completed';

export interface TransportJob {
  id: string;
  sourceType: 'consumer_order' | 'bulk_order' | 'farmer_request';
  referenceId: string; // Order ID or Bulk ID
  farmerId: string;
  farmerName: string;
  farmerPhone?: string; // Farmer direct mobile for driver collection
  farmerVillage?: string; // Farmer village / locality
  farmerPickupLocation: string; // Specific farm gate or yard location
  farmerPickupInstructions?: string; // Guidance for loading crates / quality tags
  destination: string;
  destinationContact?: string;
  destinationPhone?: string;
  distanceKm: number;
  product: string;
  variety: string;
  quantityKg: number;
  requiredCapacityKg: number;
  deliveryWindow: string;
  transportEarnings: number; // Driver's transparent earnings for this job
  paymentMethod?: PaymentMethod;
  paymentAmountToCollect?: number; // For COD orders
  status: TransportJobStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  assignedDriverVehicle?: string;
  assignedDriverRating?: number;
  driverStage?: 'assigned' | 'going_to_pickup' | 'produce_collected' | 'in_transit' | 'delivered';
  pickupEtaMinutes?: number;
  stageUpdatedAt?: string;
  isSharedRoute?: boolean;
  sharedWithJobIds?: string[];
  createdAt: string;
}

export interface Complaint {
  id: string;
  orderId: string;
  batchId?: string;
  complainantRole: 'consumer' | 'bulk_buyer' | 'farmer';
  complainantName: string;
  subjectType: 'poor_quality' | 'missing_quantity' | 'wrong_product' | 'damaged_product' | 'driver_issue' | 'late_delivery' | 'suspected_fraud';
  description: string;
  mediaUrl?: string;
  status: 'under_review' | 'investigating' | 'resolved';
  targetType: 'driver' | 'farmer' | 'platform';
  driverId?: string;
  farmerId?: string;
  farmerName?: string;
  aiAttributionAnalysis: string;
  farmerResponse?: string;
  resolvedAt?: string;
  submittedAt: string;
}

export interface NotificationItem {
  id: string;
  recipientRole: Sector;
  recipientId: string;
  title: string;
  messageKey: string;
  interpolations?: Record<string, string | number>;
  rawMessage: string;
  type: 'order' | 'transport' | 'bulk' | 'alert' | 'complaint' | 'system';
  timestamp: string;
  read: boolean;
  actionable?: boolean;
  actionId?: string;
}

export interface CropRecommendation {
  crop: string;
  region: string;
  projectedDemand: 'High' | 'Very High' | 'Moderate' | 'Surplus Risk';
  estimatedPriceRange: { min: number; max: number };
  suggestedSeason: string;
  waterRequirement: 'Low' | 'Medium' | 'High';
  rationale: string;
}
