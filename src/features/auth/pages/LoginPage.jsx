import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, Mail, CheckCircle2 } from 'lucide-react';
import { Button, Input, Select, Alert } from '../../../shared/components/index.js';
import { usePinLogin, useOtpLogin, useSendOtp } from '../hooks/useAuth.js';
import { useAuthStore } from '../../../core/auth/auth.store.js';
import { ROUTES, ROLES, STAFF_ROLE_OPTIONS, useCopy } from '../../../core/constants/index.js';

export function LoginPage() {
  const navigate = useNavigate();
  const copy = useCopy();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [activeTab, setActiveTab] = useState('pin');
  const [targetRole, setTargetRole] = useState(ROLES.SUPER_ADMIN);

  const [pinIdentifier, setPinIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');

  const pinLoginMutation = usePinLogin({
    onSuccess: () => {
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
    onError: (err) => {
      setPinError(err.message || copy.errors.authFailed);
    }
  });

  const sendOtpMutation = useSendOtp({
    onSuccess: () => {
      setOtpSent(true);
      setOtpError('');
    },
    onError: (err) => {
      setOtpError(err.message || copy.errors.otpSendFailed);
    }
  });

  const otpLoginMutation = useOtpLogin({
    onSuccess: () => {
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
    onError: (err) => {
      setOtpError(err.message || copy.errors.otpInvalid);
    }
  });

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const handlePinSubmit = (e) => {
    e.preventDefault();
    setPinError('');

    if (!pinIdentifier.trim()) {
      setPinError(copy.errors.requiredIdentifier);
      return;
    }
    if (pin.length !== 6) {
      setPinError(copy.errors.pinLength);
      return;
    }

    pinLoginMutation.mutate({
      identifier: pinIdentifier.trim(),
      pin: pin.trim(),
      targetRole
    });
  };

  const handleSendOtp = () => {
    if (!otpIdentifier.trim()) {
      setOtpError(copy.errors.requiredOtpIdentifier);
      return;
    }
    setOtpError('');
    sendOtpMutation.mutate({
      identifier: otpIdentifier.trim(),
      channel: otpIdentifier.includes('@') ? 'EMAIL' : 'SMS',
      purpose: 'LOGIN'
    });
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setOtpError('');

    if (!otpIdentifier.trim()) {
      setOtpError(copy.errors.requiredIdentifierOnly);
      return;
    }
    if (otp.length !== 6) {
      setOtpError(copy.errors.otpLength);
      return;
    }

    otpLoginMutation.mutate({
      identifier: otpIdentifier.trim(),
      otp: otp.trim(),
      targetRole
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        <div className="lg:col-span-5 bg-[#0E4B2E] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-[#FACC15]/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-[#0A3A23] blur-xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#FACC15] flex items-center justify-center text-[#0E4B2E] font-black text-xl shadow-md">
                {copy.common.brandInitial}
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight block leading-tight text-white">
                  {copy.common.brandName}
                </span>
                <span className="text-[11px] text-[#FACC15] font-semibold tracking-wider uppercase">
                  {copy.common.portalTagline}
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-3">
              {copy.auth.brandHeadline}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              {copy.auth.brandSubtext}
            </p>

            <div className="space-y-3.5 pt-4 border-t border-white/10 text-xs text-white/80">
              {copy.auth.securityHighlights.map((highlight) => (
                <div key={highlight} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FACC15] shrink-0" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-8 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
            <span>{copy.common.organizationName}</span>
            <span>{copy.common.versionTag}</span>
          </div>
        </div>

        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {copy.auth.staffAuthTitle}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {copy.auth.staffAuthSubtitle}
              </p>
            </div>

            <div className="mb-5">
              <Select
                label={copy.auth.operationalRoleLabel}
                options={STAFF_ROLE_OPTIONS}
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            <div className="flex rounded-lg bg-gray-100 p-1 mb-6 text-sm font-medium">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('pin');
                  setPinError('');
                }}
                className={`flex-1 py-2 text-center rounded-md transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'pin'
                    ? 'bg-white text-gray-900 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                {copy.auth.pinTabLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('otp');
                  setOtpError('');
                }}
                className={`flex-1 py-2 text-center rounded-md transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'otp'
                    ? 'bg-white text-gray-900 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Mail className="w-4 h-4" />
                {copy.auth.otpTabLabel}
              </button>
            </div>

            {activeTab === 'pin' ? (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                {pinError && (
                  <Alert type="error" onClose={() => setPinError('')}>
                    {pinError}
                  </Alert>
                )}

                <Input
                  label={copy.auth.identifierLabel}
                  placeholder={copy.auth.identifierPlaceholder}
                  value={pinIdentifier}
                  onChange={(e) => setPinIdentifier(e.target.value)}
                  required
                />

                <div>
                  <Input
                    label={copy.auth.pinLabel}
                    isPassword={true}
                    maxLength={6}
                    placeholder={copy.auth.pinPlaceholder}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <div className="flex justify-end mt-1.5">
                    <Link
                      to={ROUTES.RESET_PIN}
                      className="text-xs font-semibold text-[#0E4B2E] hover:underline"
                    >
                      {copy.auth.forgotPin}
                    </Link>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={pinLoginMutation.isPending}
                  >
                    {copy.auth.authenticateWithPin}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                {otpError && (
                  <Alert type="error" onClose={() => setOtpError('')}>
                    {otpError}
                  </Alert>
                )}

                <div className="space-y-2">
                  <Input
                    label={copy.auth.otpIdentifierLabel}
                    placeholder={copy.auth.otpIdentifierPlaceholder}
                    value={otpIdentifier}
                    onChange={(e) => setOtpIdentifier(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    loading={sendOtpMutation.isPending}
                    onClick={handleSendOtp}
                  >
                    {otpSent ? copy.auth.resendOtp : copy.auth.sendOtp}
                  </Button>
                </div>

                {otpSent && (
                  <div className="pt-2">
                    <Input
                      label={copy.auth.otpCodeLabel}
                      placeholder={copy.auth.otpCodePlaceholder}
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      helperText={copy.auth.otpCodeHelper}
                      required
                    />
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={!otpSent}
                    loading={otpLoginMutation.isPending}
                  >
                    {copy.auth.verifyAndEnter}
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-[#0E4B2E]" />
              <span>{copy.auth.rbacFooter}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
