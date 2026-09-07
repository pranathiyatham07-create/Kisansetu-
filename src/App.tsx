import React, { useState } from 'react';
import {
  SectorType,
  LanguageCode,
  FarmerProduceListing,
  Order,
  Driver,
  TransportJob,
  BulkRequirement,
  Complaint,
  VoiceIntent,
  NotificationItem,
} from './types';
import {
  INITIAL_LISTINGS,
  INITIAL_ORDERS,
  INITIAL_DRIVERS,
  INITIAL_TRANSPORT_JOBS,
  INITIAL_BULK_REQUIREMENTS,
  INITIAL_COMPLAINTS,
  INITIAL_NOTIFICATIONS,
  PRODUCT_CATALOG,
} from './data/mockData';
import { t } from './data/translations';
import { speakText } from './utils/speech';

// Components
import { SectorSelector } from './components/auth/SectorSelector';
import { Navbar } from './components/common/Navbar';
import { PricingTableModal } from './components/common/PricingTableModal';
import { DemandSupplyCharts } from './components/common/DemandSupplyCharts';
import { VoiceModal } from './components/common/VoiceModal';
import { CropAdvisoryModal } from './components/common/CropAdvisoryModal';

// Sector Dashboards
import { FarmerSector } from './components/farmer/FarmerSector';
import { ConsumerSector } from './components/consumer/ConsumerSector';
import { BulkBuyerSector } from './components/bulk/BulkBuyerSector';
import { DriverSector } from './components/driver/DriverSector';
import { AdminSector } from './components/admin/AdminSector';

export default function App() {
  // Global App State
  const [activeSector, setActiveSector] = useState<SectorType | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('en');

  // Domain Entities State
  const [listings, setListings] = useState<FarmerProduceListing[]>(INITIAL_LISTINGS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [transportJobs, setTransportJobs] = useState<TransportJob[]>(INITIAL_TRANSPORT_JOBS);
  const [bulkRequirements, setBulkRequirements] = useState<BulkRequirement[]>(INITIAL_BULK_REQUIREMENTS);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // User Profile
  const [userProfile, setUserProfile] = useState({
    name: 'Ravi Kumar',
    phone: '+91 98480 23451',
    location: 'Vijayawada Central Mandi, AP',
    language: 'en' as LanguageCode,
  });

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [isChartsModalOpen, setIsChartsModalOpen] = useState<boolean>(false);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState<boolean>(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Farmer Actions
  const handleAddListing = (listing: FarmerProduceListing) => {
    setListings(prev => [listing, ...prev]);
    showToast(`Added ${listing.variety} ${listing.product} to active listings.`);
  };

  const handleUpdateListingPrice = (listingId: string, newPrice: number) => {
    setListings(prev =>
      prev.map(item => (item.id === listingId ? { ...item, farmerPrice: newPrice } : item))
    );
    showToast(`Price updated to ₹${newPrice}/kg.`);
  };

  const handleUpdateExternalSale = (listingId: string, soldQty: number, channel: string) => {
    setListings(prev =>
      prev.map(item =>
        item.id === listingId
          ? {
              ...item,
              availableQty: Math.max(0, item.availableQty - soldQty),
            }
          : item
      )
    );
    showToast(`Recorded external sale of ${soldQty} kg (${channel}). Remaining inventory updated.`);
  };

  const handleAcceptOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'farmer_confirmed' } : o))
    );
    showToast(`Order ${orderId} confirmed for packing.`);
  };

  // AI Automatic Rematching: If Farmer A rejects, AI reallocates to Farmer B without consumer having to reorder!
  const handleRejectOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const updatedItems = o.items.map(item => ({
            ...item,
            farmerId: 'farmer-2',
            farmerName: 'Venkat Rao',
            farmerVillage: 'Tadepalli',
          }));
          return {
            ...o,
            items: updatedItems,
            status: 'ai_matching',
          };
        }
        return o;
      })
    );
    showToast(`Order ${orderId} rejected by farmer. AI automatically rematched to nearby Farmer Venkat Rao (Tadepalli).`);
  };

  // Consumer Actions
  const handlePlaceOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    // Decrement available stock from listings
    order.items.forEach(orderItem => {
      setListings(prev =>
        prev.map(l =>
          l.id === orderItem.listingId
            ? { ...l, availableQty: Math.max(0, l.availableQty - orderItem.quantity) }
            : l
        )
      );
    });

    // Automatically assign nearby available independent driver using AI Smart Dispatch
    const totalOrderQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
    const orderTotal = (order.totalProduceCost || 0) + (order.finalDeliveryCharge || 0);

    // AI chooses best available independent driver matching capacity
    const matchedDriver = drivers.find(d => d.isOnline) || drivers[0];
    const farmerName = order.items[0]?.farmerName || 'Ravi Kumar';
    const farmerVillage = order.items[0]?.farmerVillage || 'Gollapudi Village, Krishna Basin';
    const farmerPhone = '+91 98480 23451';
    const farmerGatePickup = `North Farm Gate, Survey #14, ${farmerVillage}`;

    const newTransportJob: TransportJob = {
      id: `JOB-KS-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceType: 'consumer_order',
      referenceId: order.id,
      farmerId: order.items[0]?.farmerId || 'farmer-1',
      farmerName: farmerName,
      farmerPhone: farmerPhone,
      farmerVillage: farmerVillage,
      farmerPickupLocation: farmerGatePickup,
      farmerPickupInstructions: 'Graded produce crates ready at farm gate. Verify lot tag with farmer before departure.',
      destination: order.deliveryAddress || 'Consumer Address, Vijayawada',
      destinationContact: order.consumerName || 'Consumer',
      product: order.items.map(i => i.product).join(', '),
      variety: order.items[0]?.variety || 'Fresh Standard',
      quantityKg: totalOrderQty,
      requiredCapacityKg: totalOrderQty,
      distanceKm: Math.floor(6 + Math.random() * 12),
      deliveryWindow: 'Within 2 Hours (Fresh Express)',
      status: 'assigned',
      assignedDriverId: matchedDriver?.id,
      assignedDriverName: matchedDriver?.name,
      assignedDriverPhone: matchedDriver?.mobile || '+91 94401 88920',
      assignedDriverVehicle: matchedDriver ? `${matchedDriver.vehicleName} (${matchedDriver.registrationNumber})` : 'Tata Ace (AP 16 TX 4921)',
      assignedDriverRating: matchedDriver?.rating || 4.8,
      driverStage: 'assigned',
      pickupEtaMinutes: 15,
      stageUpdatedAt: 'Just now',
      transportEarnings: order.finalDeliveryCharge || 40,
      createdAt: 'Just now',
      paymentMethod: order.paymentMethod,
      paymentAmountToCollect: orderTotal,
    };
    setTransportJobs(prev => [newTransportJob, ...prev]);

    // Update order with driver details so Farmer sees immediately that their order is going!
    setOrders(prev =>
      prev.map(o =>
        o.id === order.id
          ? {
              ...o,
              status: 'transport_confirmed',
              driverId: matchedDriver?.id,
              driverName: matchedDriver?.name,
              driverVehicle: matchedDriver ? `${matchedDriver.vehicleName} (${matchedDriver.registrationNumber})` : 'Tata Ace',
            }
          : o
      )
    );

    // Alert notification for Farmer
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'farmer',
      recipientId: order.items[0]?.farmerId || 'farmer-1',
      title: '🚚 AI Driver Assigned to Collect Order',
      rawMessage: `Driver ${matchedDriver?.name} (${matchedDriver?.vehicleName}) assigned to collect order ${order.id} from your farm gate in ${farmerVillage}. Driver Phone: ${matchedDriver?.mobile || '+91 94401 88920'}.`,
      type: 'dispatch',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast(
      `Order ${order.id} confirmed! AI assigned driver ${matchedDriver?.name}. Collection details sent to driver & farmer.`
    );
  };

  const handleSubmitComplaint = (complaint: Omit<Complaint, 'id' | 'submittedAt'>) => {
    const newComp: Complaint = {
      ...complaint,
      id: `CMP-${Date.now()}`,
      submittedAt: 'Just now',
    };
    setComplaints(prev => [newComp, ...prev]);
    showToast('Complaint registered and assigned to Farmer dashboard complaint box.');
  };

  // Farmer Complaint Resolution Handler
  const handleResolveComplaint = (complaintId: string, responseNote: string, resolutionAction: string) => {
    setComplaints(prev =>
      prev.map(c =>
        c.id === complaintId
          ? {
              ...c,
              status: 'resolved' as const,
              farmerResponse: `${responseNote} (${resolutionAction.toUpperCase()})`,
              resolvedAt: 'Just now',
            }
          : c
      )
    );
    showToast(`Complaint ${complaintId} marked resolved. Farmer rating penalty removed.`);
  };

  // Transport & Driver Actions
  const handleAssignDriverToJob = (jobId: string, driverId: string) => {
    const targetDriver = drivers.find(d => d.id === driverId);
    let refOrderId = '';
    setTransportJobs(prev =>
      prev.map(j => {
        if (j.id === jobId) {
          refOrderId = j.referenceId;
          return {
            ...j,
            assignedDriverId: driverId,
            assignedDriverName: targetDriver?.name,
            assignedDriverPhone: targetDriver?.mobile,
            assignedDriverVehicle: targetDriver ? `${targetDriver.vehicleName} (${targetDriver.registrationNumber})` : 'Tata Ace',
            assignedDriverRating: targetDriver?.rating,
            status: 'assigned',
            driverStage: 'assigned',
            pickupEtaMinutes: 15,
            stageUpdatedAt: 'Just now',
          };
        }
        return j;
      })
    );

    // Keep Farmer's Order view synchronized
    if (refOrderId) {
      setOrders(prev =>
        prev.map(o =>
          o.id === refOrderId
            ? {
                ...o,
                driverId: targetDriver?.id,
                driverName: targetDriver?.name,
                driverVehicle: targetDriver ? `${targetDriver.vehicleName} (${targetDriver.registrationNumber})` : 'Tata Ace',
                status: 'transport_confirmed',
              }
            : o
        )
      );
    }

    // Notify the Farmer
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientRole: 'farmer',
      recipientId: 'farmer-1',
      title: 'Driver Assignment Updated',
      rawMessage: `Driver assignment updated: ${targetDriver?.name} will collect your produce. Contact: ${targetDriver?.mobile}.`,
      type: 'dispatch',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast(`Assigned job ${jobId} to driver ${targetDriver?.name}. Farmer notified.`);
  };

  const handleDriverUpdateStage = (
    jobId: string,
    stage: 'going_to_pickup' | 'produce_collected' | 'in_transit' | 'delivered'
  ) => {
    let targetJob: TransportJob | undefined;
    setTransportJobs(prev =>
      prev.map(j => {
        if (j.id === jobId) {
          const updatedStatus: TransportJobStatus =
            stage === 'delivered' ? 'completed' :
            stage === 'produce_collected' || stage === 'in_transit' ? 'in_transit' : 'accepted';
          const updatedJob = {
            ...j,
            driverStage: stage,
            status: updatedStatus,
            stageUpdatedAt: 'Just now',
            pickupEtaMinutes: stage === 'produce_collected' || stage === 'delivered' ? 0 : 8,
          };
          targetJob = updatedJob;
          return updatedJob;
        }
        return j;
      })
    );

    // Synchronize corresponding order
    const job = transportJobs.find(j => j.id === jobId) || targetJob;
    if (job && job.referenceId) {
      setOrders(prev =>
        prev.map(o => {
          if (o.id === job.referenceId) {
            let orderStatus = o.status;
            if (stage === 'going_to_pickup') orderStatus = 'transport_confirmed';
            else if (stage === 'produce_collected' || stage === 'in_transit') orderStatus = 'in_transit';
            else if (stage === 'delivered') orderStatus = 'delivered';
            return { ...o, status: orderStatus };
          }
          return o;
        })
      );
    }

    if (stage === 'going_to_pickup') {
      showToast(`Driver is en route to Farmer's village (${job?.farmerVillage || 'Gollapudi'}) to collect produce.`);
    } else if (stage === 'produce_collected') {
      showToast(`Produce collected from farmer gate! Order is now in transit to buyer.`);
    } else if (stage === 'delivered') {
      showToast(`Trip complete! ₹${job?.transportEarnings || 40} earnings credited to driver wallet.`);
    }
  };

  const handleRequestTransportation = (job: Omit<TransportJob, 'id' | 'createdAt' | 'status'>) => {
    const newJob: TransportJob = {
      ...job,
      id: `JOB-KS-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'open',
      createdAt: 'Just now',
    };
    setTransportJobs(prev => [newJob, ...prev]);
    showToast('Transportation request generated. Nearby drivers alerted.');
  };

  const handleDriverAcceptJob = (jobId: string) => {
    handleDriverUpdateStage(jobId, 'going_to_pickup');
  };

  const handleDriverCompleteJob = (jobId: string) => {
    handleDriverUpdateStage(jobId, 'delivered');
  };

  // Bulk Buyer Actions
  const handleAddBulkRequirement = (req: BulkRequirement) => {
    setBulkRequirements(prev => [req, ...prev]);
    showToast(`Bulk requirement ${req.id} published. AI multi-farmer plan ready.`);
  };

  const handleCancelBulkOrder = (bulkId: string) => {
    setBulkRequirements(prev =>
      prev.map(b => (b.id === bulkId ? { ...b, isCancelled: true, status: 'cancelled' } : b))
    );
    showToast(`Bulk order cancelled. Failed Bulk Order Recovery Engine activated!`);
  };

  const handleAcceptBulkAllocation = (bulkId: string, farmerId: string) => {
    setBulkRequirements(prev =>
      prev.map(b => {
        if (b.id === bulkId) {
          const updatedPlan = b.fulfillmentPlan.map(p =>
            p.farmerId === farmerId ? { ...p, status: 'accepted' as const } : p
          );
          const newConfirmed = updatedPlan
            .filter(p => p.status === 'accepted')
            .reduce((sum, p) => sum + p.allocatedQty, 0);
          return {
            ...b,
            fulfillmentPlan: updatedPlan,
            confirmedQty: newConfirmed,
          };
        }
        return b;
      })
    );
    showToast(`Bulk allocation accepted.`);
  };

  const handleRejectBulkAllocation = (bulkId: string, farmerId: string) => {
    setBulkRequirements(prev =>
      prev.map(b => {
        if (b.id === bulkId) {
          const updatedPlan = b.fulfillmentPlan.map(p =>
            p.farmerId === farmerId
              ? {
                  ...p,
                  farmerId: 'farmer-4',
                  farmerName: 'Koteswara Rao',
                  village: 'Tenali',
                  status: 'accepted' as const,
                }
              : p
          );
          return {
            ...b,
            fulfillmentPlan: updatedPlan,
          };
        }
        return b;
      })
    );
    showToast(`Bulk allocation declined. AI rematched portion to alternative farmer in Tenali.`);
  };

  // Voice Intent Handler
  const handleVoiceIntent = (intent: VoiceIntent) => {
    switch (intent.action) {
      case 'view_prices':
        setIsPricingModalOpen(true);
        speakText('Opening Mandi rates and price guardrails.', language);
        break;
      case 'view_charts':
        setIsChartsModalOpen(true);
        speakText('Opening regional demand and supply charts.', language);
        break;
      case 'crop_advisory':
        setIsAdvisoryModalOpen(true);
        speakText('Opening AI crop recommendation advisory.', language);
        break;
      case 'check_orders':
        if (activeSector === 'farmer' || activeSector === 'consumer') {
          showToast('Navigating to orders view.');
        }
        break;
      default:
        showToast(`Voice command received: ${intent.transcript}`);
        break;
    }
  };

  // If no sector selected, show the Landing Screen (SectorSelector)
  if (!activeSector) {
    return (
      <SectorSelector
        language={language}
        onChangeLanguage={setLanguage}
        onSelectLanguage={setLanguage}
        onSelectSector={setActiveSector}
        onOpenPricingTable={() => setIsPricingModalOpen(true)}
        onOpenCharts={() => setIsChartsModalOpen(true)}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        initialUserName={userProfile.name}
        initialLocation={userProfile.location}
        onUpdateUserProfile={setUserProfile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900">
      {/* Universal Navigation Header */}
      <Navbar
        language={language}
        activeSector={activeSector}
        onChangeSector={setActiveSector}
        onSelectSector={setActiveSector}
        onChangeLanguage={setLanguage}
        onSelectLanguage={setLanguage}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        onOpenPricingTable={() => setIsPricingModalOpen(true)}
        onOpenCharts={() => setIsChartsModalOpen(true)}
        onOpenCropAdvisory={() => setIsAdvisoryModalOpen(true)}
        onReturnToStart={() => setActiveSector(null)}
        onExitSector={() => setActiveSector(null)}
        notifications={notifications}
        userName={
          activeSector === 'farmer'
            ? `${userProfile.name} (Farmer)`
            : activeSector === 'consumer'
            ? 'Ananya Sharma (Consumer)'
            : activeSector === 'bulk_buyer'
            ? 'Procurement Mgr (Hotel)'
            : activeSector === 'driver'
            ? 'Ravi Teja (Independent Driver)'
            : 'Admin Officer'
        }
        userLocation={userProfile.location || 'Vijayawada / Krishna Basin'}
      />

      {/* Main Sector Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeSector === 'farmer' && (
          <FarmerSector
            language={language}
            listings={listings}
            onAddListing={handleAddListing}
            onUpdateListingPrice={handleUpdateListingPrice}
            onUpdateExternalSale={handleUpdateExternalSale}
            orders={orders}
            onAcceptOrder={handleAcceptOrder}
            onRejectOrder={handleRejectOrder}
            drivers={drivers}
            transportJobs={transportJobs}
            onAssignDriverToJob={handleAssignDriverToJob}
            onRequestTransportation={handleRequestTransportation}
            bulkRequirements={bulkRequirements}
            onAcceptBulkAllocation={handleAcceptBulkAllocation}
            onRejectBulkAllocation={handleRejectBulkAllocation}
            onOpenVoice={() => setIsVoiceModalOpen(true)}
            onOpenPricingTable={() => setIsPricingModalOpen(true)}
            onOpenCharts={() => setIsChartsModalOpen(true)}
            complaints={complaints}
            onResolveComplaint={handleResolveComplaint}
          />
        )}

        {activeSector === 'consumer' && (
          <ConsumerSector
            language={language}
            listings={listings}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            onSubmitComplaint={handleSubmitComplaint}
            onOpenVoice={() => setIsVoiceModalOpen(true)}
            onOpenPricingTable={() => setIsPricingModalOpen(true)}
            onOpenCharts={() => setIsChartsModalOpen(true)}
          />
        )}

        {activeSector === 'bulk_buyer' && (
          <BulkBuyerSector
            language={language}
            bulkRequirements={bulkRequirements}
            onAddBulkRequirement={handleAddBulkRequirement}
            onCancelBulkOrder={handleCancelBulkOrder}
            onTriggerRecovery={handleCancelBulkOrder}
            listings={listings}
            onOpenVoice={() => setIsVoiceModalOpen(true)}
            onOpenPricingTable={() => setIsPricingModalOpen(true)}
            onOpenCharts={() => setIsChartsModalOpen(true)}
          />
        )}

        {activeSector === 'driver' && (
          <DriverSector
            language={language}
            driver={drivers[0]}
            transportJobs={transportJobs}
            onAcceptJob={handleDriverAcceptJob}
            onUpdateJobStage={handleDriverUpdateStage}
            onCompleteJob={handleDriverCompleteJob}
            onOpenVoice={() => setIsVoiceModalOpen(true)}
          />
        )}

        {activeSector === 'admin' && (
          <AdminSector
            language={language}
            listings={listings}
            orders={orders}
            drivers={drivers}
            transportJobs={transportJobs}
            bulkRequirements={bulkRequirements}
            complaints={complaints}
            onOpenPricingTable={() => setIsPricingModalOpen(true)}
            onOpenCharts={() => setIsChartsModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-2 fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Universal Floating Modals */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        language={language}
        onIntentParsed={handleVoiceIntent}
      />

      <PricingTableModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        language={language}
      />

      <DemandSupplyCharts
        isOpen={isChartsModalOpen}
        onClose={() => setIsChartsModalOpen(false)}
        language={language}
      />

      <CropAdvisoryModal
        isOpen={isAdvisoryModalOpen}
        onClose={() => setIsAdvisoryModalOpen(false)}
        language={language}
      />
    </div>
  );
}
