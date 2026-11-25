import React, { useMemo, useState } from 'react';
import {
  Plus,
  Download,
  Trash2,
  ArrowRight,
  Store,
  Sprout,
  IndianRupee,
  Scale,
  Bell,
  PanelRightOpen,
  Maximize2,
  RefreshCw,
  Inbox
} from 'lucide-react';
import {
  PageHeader,
  StatCard,
  Button,
  Input,
  Select,
  Toggle,
  SearchBar,
  DataTable,
  StatusBadge,
  Alert,
  Modal,
  SlideOver,
  EmptyState,
  QrCode,
  OtpPinInput
} from '../../../shared/components/index.js';
import { formatINR, formatWeight, formatDateTime } from '../../../shared/utils/formatters.js';
import { useUiStore } from '../../../core/ui/ui.store.js';
import { STAFF_ROLE_OPTIONS } from '../../../core/constants/index.js';

const HUB_OPTIONS = [
  { value: 'hub-indore', label: 'Indore Central Hub', subtitle: 'Madhya Pradesh • 12 Weighbridges' },
  { value: 'hub-kota', label: 'Kota Grain Terminal', subtitle: 'Rajasthan • 8 Weighbridges' },
  { value: 'hub-ujjain', label: 'Ujjain Agro Yard', subtitle: 'Madhya Pradesh • 6 Weighbridges' },
  { value: 'hub-neemuch', label: 'Neemuch Mustard Depot', subtitle: 'Maintenance Window', disabled: true }
];

const SAMPLE_LOTS = [
  { id: 'LOT-901', crop: 'Sharbati Wheat', hub: 'Indore Central', qtyKg: 4250, ratePerKg: 28.5, status: 'success', statusLabel: 'Settled', updatedAt: '2026-11-24T10:15:00Z' },
  { id: 'LOT-902', crop: 'Yellow Soybean', hub: 'Ujjain Agro Yard', qtyKg: 3100, ratePerKg: 46.2, status: 'warning', statusLabel: 'QC Pending', updatedAt: '2026-11-24T11:30:00Z' },
  { id: 'LOT-903', crop: 'Mustard Seed', hub: 'Kota Terminal', qtyKg: 1850, ratePerKg: 58.0, status: 'info', statusLabel: 'In Transit', updatedAt: '2026-11-24T12:45:00Z' },
  { id: 'LOT-904', crop: 'Kabuli Chana', hub: 'Indore Central', qtyKg: 2400, ratePerKg: 92.0, status: 'danger', statusLabel: 'Disputed', updatedAt: '2026-11-24T13:10:00Z' },
  { id: 'LOT-905', crop: 'Basmati 1121', hub: 'Kota Terminal', qtyKg: 5600, ratePerKg: 64.5, status: 'success', statusLabel: 'Settled', updatedAt: '2026-11-24T14:20:00Z' },
  { id: 'LOT-906', crop: 'Moong Dal', hub: 'Ujjain Agro Yard', qtyKg: 1400, ratePerKg: 78.0, status: 'gold', statusLabel: 'Priority', updatedAt: '2026-11-24T15:05:00Z' },
  { id: 'LOT-907', crop: 'Maize Grade A', hub: 'Neemuch Depot', qtyKg: 6200, ratePerKg: 22.4, status: 'neutral', statusLabel: 'Archived', updatedAt: '2026-11-24T16:00:00Z' }
];

function ShowcaseSection({ title, description, children }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function UiKitShowcasePage() {
  const addToast = useUiStore((state) => state.addToast);

  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [cropName, setCropName] = useState('Sharbati Wheat');
  const [spotRate, setSpotRate] = useState('2850');
  const [weightInput, setWeightInput] = useState('45');
  const [pinInput, setPinInput] = useState('123456');

  const [selectedRole, setSelectedRole] = useState(STAFF_ROLE_OPTIONS[0].value);
  const [selectedHub, setSelectedHub] = useState('hub-indore');
  const [errorSelectValue, setErrorSelectValue] = useState('');

  const [autoDispatch, setAutoDispatch] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const [otpCode, setOtpCode] = useState('482910');
  const [maskedPin, setMaskedPin] = useState('941820');
  const [errorPin, setErrorPin] = useState('12');
  const [qrPayload, setQrPayload] = useState('https://ktc.ag/hubs/INDORE-CENTRAL-01?upi=ktc@icici');

  const [dismissedAlerts, setDismissedAlerts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewEmpty, setPreviewEmpty] = useState(false);

  const filteredAndSortedLots = useMemo(() => {
    if (previewEmpty) return [];

    const q = searchQuery.trim().toLowerCase();
    const filtered = SAMPLE_LOTS.filter((lot) => {
      if (!q) return true;
      return (
        lot.id.toLowerCase().includes(q) ||
        lot.crop.toLowerCase().includes(q) ||
        lot.hub.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [searchQuery, sortBy, sortOrder, previewEmpty]);

  const paginatedLots = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSortedLots.slice(start, start + pageSize);
  }, [filteredAndSortedLots, page, pageSize]);

  const columns = [
    { key: 'id', header: 'Lot ID', sortable: true },
    { key: 'crop', header: 'Commodity', sortable: true },
    { key: 'hub', header: 'Mandi Hub', sortable: true },
    {
      key: 'qtyKg',
      header: 'Net Weight',
      align: 'right',
      sortable: true,
      render: (val) => formatWeight(val, 'kg')
    },
    {
      key: 'ratePerKg',
      header: 'Spot Rate',
      align: 'right',
      sortable: true,
      render: (val) => `${formatINR(val)} / kg`
    },
    {
      key: 'status',
      header: 'Status',
      render: (val, row) => (
        <StatusBadge status={val} size="sm">
          {row.statusLabel}
        </StatusBadge>
      )
    },
    {
      key: 'updatedAt',
      header: 'Timestamp',
      render: (val) => <span className="text-xs text-gray-500">{formatDateTime(val)}</span>
    }
  ];

  const triggerLoadingDemo = () => {
    setIsButtonLoading(true);
    setTimeout(() => setIsButtonLoading(false), 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Design System Reference"
        title="KTC Reusable UI Kit Showcase"
        subtitle="Interactive verification sandbox for stateless design primitives, KTC brand tokens, custom dropdowns, and overlays."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={Maximize2}
              onClick={() => setIsModalOpen(true)}
            >
              Open Modal
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={PanelRightOpen}
              onClick={() => setIsSlideOverOpen(true)}
            >
              Open SlideOver
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Escrow Pool Liquidity"
          value={formatINR(86400000, { compact: true })}
          subtitle="Settled across 18 hubs"
          trend={{ value: '+14.2%', direction: 'up', label: 'this month' }}
          icon={IndianRupee}
        />
        <StatCard
          title="Weighbridge Intake"
          value={formatWeight(18450, 'kg')}
          subtitle="Verified electronic slips"
          trend={{ value: '+6.1%', direction: 'up', label: 'vs yesterday' }}
          icon={Scale}
        />
        <StatCard
          title="Active Commodities"
          value="38"
          subtitle="MSP & spot market tracked"
          trend={{ value: '0%', direction: 'neutral', label: 'stable catalog' }}
          icon={Sprout}
        />
        <StatCard
          title="KTC Regional Hubs"
          value="24"
          subtitle="4 clusters operational"
          trend={{ value: '-1', direction: 'down', label: 'scheduled maintenance' }}
          icon={Store}
        />
      </div>

      <ShowcaseSection
        title="Buttons & Interactive Actions"
        description="All 5 semantic variants, 3 size scales, icon slots, and async loading states."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" leftIcon={Plus}>Primary Action</Button>
            <Button variant="secondary" leftIcon={Download}>Secondary Gold</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Action</Button>
            <Button variant="danger" leftIcon={Trash2}>Danger Action</Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
            <Button size="sm" variant="primary">Small (sm)</Button>
            <Button size="md" variant="primary">Medium (md)</Button>
            <Button size="lg" variant="primary" rightIcon={ArrowRight}>Large (lg)</Button>
            <Button
              variant="outline"
              loading={isButtonLoading}
              leftIcon={RefreshCw}
              onClick={triggerLoadingDemo}
            >
              {isButtonLoading ? 'Processing...' : 'Trigger Loading (1.5s)'}
            </Button>
            <Button variant="primary" disabled>Disabled State</Button>
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Form Controls & Custom Select"
        description="Controlled inputs with prefix/suffix slots, password visibility toggle, accessible custom dropdowns, and switches."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Input
            label="Commodity Title"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            helperText="Standard controlled input field"
          />

          <Input
            label="Mandi Spot Rate"
            prefix="₹"
            suffix="/kg"
            value={spotRate}
            onChange={(e) => setSpotRate(e.target.value)}
            helperText="Prefix and suffix currency slots"
          />

          <Input
            label="Weighment Quantity"
            suffix="quintal"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            error="Exceeds single-axle truck limit (40 quintal)"
          />

          <Input
            label="Staff Security PIN"
            isPassword={true}
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            helperText="Toggle visibility icon on right"
          />

          <Select
            label="Custom Role Select (with subtitles)"
            options={STAFF_ROLE_OPTIONS}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            helperText="Supports ArrowUp/ArrowDown, Enter, Escape"
          />

          <Select
            label="KTC Hub Assignment"
            options={HUB_OPTIONS}
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
            helperText="Includes disabled option state"
          />

          <Select
            label="Select Error State"
            options={HUB_OPTIONS}
            value={errorSelectValue}
            placeholder="Choose a regional hub..."
            onChange={(e) => setErrorSelectValue(e.target.value)}
            error={!errorSelectValue ? 'Regional hub selection is required' : ''}
          />

          <Select
            label="Disabled Select"
            options={HUB_OPTIONS}
            value="hub-kota"
            disabled
            helperText="Read-only locked selection"
          />

          <div className="space-y-4 pt-1">
            <Toggle
              label="Auto-Route Freight"
              description="Assign nearest transport partner automatically"
              checked={autoDispatch}
              onChange={setAutoDispatch}
            />
            <Toggle
              label="Farmer SMS Receipts"
              description="Send instant weighment confirmation via SMS"
              checked={smsAlerts}
              onChange={setSmsAlerts}
            />
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Verification & QR Primitives"
        description="Multi-box numeric OtpPinInput (OTP and masked PIN modes) and dynamic QrCode generator with export support."
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <OtpPinInput
              label="6-Digit Verification OTP (Visible Mode)"
              value={otpCode}
              onChange={setOtpCode}
              onComplete={(code) =>
                addToast({
                  type: 'success',
                  title: 'OTP Complete',
                  message: `Captured 6-digit verification code: ${code}`
                })
              }
              helperText="Supports typing auto-advance, Backspace, ArrowLeft/ArrowRight, and full paste."
            />

            <OtpPinInput
              label="6-Digit Security PIN (Masked + Reveal Toggle)"
              masked={true}
              allowReveal={true}
              value={maskedPin}
              onChange={setMaskedPin}
              helperText={`Current PIN value length: ${maskedPin.length}/6`}
            />

            <OtpPinInput
              label="Error Validation State"
              masked={true}
              value={errorPin}
              onChange={setErrorPin}
              error={errorPin.length < 6 ? 'Enter all 6 digits of the hub authorization PIN.' : ''}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-start gap-4 bg-gray-50/70 rounded-xl border border-gray-100 p-5">
            <div className="w-full">
              <Input
                label="Live QR Payload"
                value={qrPayload}
                onChange={(e) => setQrPayload(e.target.value)}
                placeholder="Enter hub code, URL, or UPI string..."
                helperText="Edit to regenerate QR matrix instantaneously."
              />
            </div>

            <QrCode
              value={qrPayload}
              size={168}
              title="Indore Central Hub Pass"
              subtitle="Scan at Weighbridge Gate #02"
              showDownload={true}
              downloadFileName="ktc-indore-hub-qr.png"
            />
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Feedback, Badges, Toasts & Overlays"
        description="Semantic status pills, dismissible inline alerts, global toast notifications, Modal, and SlideOver drawer."
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status="success">Operational</StatusBadge>
            <StatusBadge status="warning">Pending Review</StatusBadge>
            <StatusBadge status="danger">Suspended</StatusBadge>
            <StatusBadge status="info">In Transit</StatusBadge>
            <StatusBadge status="gold">Harvest Gold</StatusBadge>
            <StatusBadge status="neutral" dot={false}>Archived</StatusBadge>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-gray-100">
            <Button
              size="sm"
              variant="primary"
              leftIcon={Bell}
              onClick={() =>
                addToast({
                  type: 'success',
                  title: 'Settlement Dispatched',
                  message: `${formatINR(124500)} transferred to farmer bank account.`
                })
              }
            >
              Fire Success Toast
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() =>
                addToast({
                  type: 'error',
                  title: 'Weighbridge Timeout',
                  message: 'Serial port COM3 did not respond within 5 seconds.'
                })
              }
            >
              Fire Error Toast
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                addToast({
                  type: 'warning',
                  title: 'Moisture Threshold High',
                  message: 'Lot LOT-902 recorded 14.8% moisture content.'
                })
              }
            >
              Fire Warning Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                addToast({
                  type: 'info',
                  title: 'Mandi Ticker Synced',
                  message: 'Updated 38 commodity spot rates from eNAM feed.'
                })
              }
            >
              Fire Info Toast
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            {!dismissedAlerts.info && (
              <Alert
                type="info"
                title="Scheduled Maintenance"
                onClose={() => setDismissedAlerts((prev) => ({ ...prev, info: true }))}
              >
                Banking NEFT settlement rail will undergo routine maintenance at 02:00 IST.
              </Alert>
            )}
            {!dismissedAlerts.success && (
              <Alert
                type="success"
                title="Audit Verified"
                onClose={() => setDismissedAlerts((prev) => ({ ...prev, success: true }))}
              >
                All 24 KTC hubs reconciled zero cash variance for today.
              </Alert>
            )}
            {!dismissedAlerts.warning && (
              <Alert
                type="warning"
                title="Price Band Alert"
                onClose={() => setDismissedAlerts((prev) => ({ ...prev, warning: true }))}
              >
                Soybean spot rates moved +6.2% above 7-day rolling average.
              </Alert>
            )}
            {!dismissedAlerts.error && (
              <Alert
                type="error"
                title="KYC Sync Blocked"
                onClose={() => setDismissedAlerts((prev) => ({ ...prev, error: true }))}
              >
                Two Aadhaar verification payloads require manual inspection.
              </Alert>
            )}
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Data Display, Search & Table States"
        description="SearchBar filtering, sortable columns, integrated PaginationBar, loading skeleton preview, and EmptyState fallback."
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:max-w-sm">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setPage(1);
              }}
              placeholder="Filter by Lot ID, crop, or hub..."
              shortcutHint=""
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Toggle
              label="Loading Skeleton"
              checked={previewLoading}
              onChange={(checked) => {
                setPreviewLoading(checked);
                if (checked) setPreviewEmpty(false);
              }}
            />
            <Toggle
              label="Empty State"
              checked={previewEmpty}
              onChange={(checked) => {
                setPreviewEmpty(checked);
                if (checked) setPreviewLoading(false);
              }}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={paginatedLots}
          loading={previewLoading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(key, order) => {
            setSortBy(key);
            setSortOrder(order);
          }}
          onRowClick={(row) =>
            addToast({
              type: 'info',
              title: `${row.id} Selected`,
              message: `${row.crop} at ${row.hub} (${formatWeight(row.qtyKg, 'kg')})`
            })
          }
          emptyTitle="No matching intake lots"
          emptyDescription="Adjust your search query or toggle off the empty preview state to restore sample rows."
          emptyAction={
            <Button
              size="sm"
              variant="outline"
              leftIcon={Inbox}
              onClick={() => {
                setPreviewEmpty(false);
                setSearchQuery('');
              }}
            >
              Restore Sample Lots
            </Button>
          }
          pagination={{
            page,
            pageSize,
            totalItems: filteredAndSortedLots.length,
            pageSizeOptions: [3, 5, 10],
            onPageChange: setPage,
            onPageSizeChange: (nextSize) => {
              setPageSize(nextSize);
              setPage(1);
            }
          }}
        />

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Standalone EmptyState Primitive
          </p>
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50">
            <EmptyState
              title="No Pending Disputes"
              description="All farmer weighbridge and quality grading tickets have been cleared."
              action={
                <Button size="sm" variant="primary" onClick={() => setIsSlideOverOpen(true)}>
                  Inspect Audit Log
                </Button>
              }
            />
          </div>
        </div>
      </ShowcaseSection>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Mandi Rate Override"
        description="Verify regional spot pricing update before publishing to all hub weighbridges."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                addToast({
                  type: 'success',
                  title: 'Modal Confirmed',
                  message: 'Sample modal action executed successfully.'
                });
              }}
            >
              Publish Rate
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            Updating spot price for <strong>{cropName}</strong> at{' '}
            <strong>{HUB_OPTIONS.find((h) => h.value === selectedHub)?.label}</strong>.
          </p>
          <Input
            label="Override Price"
            prefix="₹"
            suffix="/quintal"
            value={spotRate}
            onChange={(e) => setSpotRate(e.target.value)}
          />
        </div>
      </Modal>

      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title="Lot Inspector Drawer"
        description="Side panel overlay for creating records or inspecting entity metadata."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSlideOverOpen(false)}>
              Close
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsSlideOverOpen(false);
                addToast({
                  type: 'info',
                  title: 'Drawer Saved',
                  message: 'SlideOver configuration applied.'
                });
              }}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert type="info" title="Overlay Stack">
            SlideOver supports Escape-to-close, backdrop click dismissal, and scrollable body content.
          </Alert>
          <Select
            label="Target Staff Role"
            options={STAFF_ROLE_OPTIONS}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          />
          <Input
            label="Inspector Notes"
            placeholder="Enter quality grading remarks..."
          />
          <Toggle
            label="Mark Lot Priority"
            description="Expedite settlement through primary banking rail"
            checked={autoDispatch}
            onChange={setAutoDispatch}
          />
        </div>
      </SlideOver>
    </div>
  );
}

export default UiKitShowcasePage;
