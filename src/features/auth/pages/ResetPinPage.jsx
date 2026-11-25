import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { Button, Input, Alert } from '../../../shared/components/index.js';
import { useSendOtp, useResetPin } from '../hooks/useAuth.js';
import { ROUTES, useCopy } from '../../../core/constants/index.js';

export function ResetPinPage() {
  const navigate = useNavigate();
  const copy = useCopy();
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const sendOtpMutation = useSendOtp({
    onSuccess: () => {
      setStep(2);
      setErrorMessage('');
    },
    onError: (err) => {
      setErrorMessage(err.message || copy.errors.resetSendFailed);
    }
  });

  const resetPinMutation = useResetPin({
    onSuccess: () => {
      setIsSuccess(true);
      setErrorMessage('');
    },
    onError: (err) => {
      setErrorMessage(err.message || copy.errors.resetFailed);
    }
  });

  const handleSendOtp = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim()) {
      setErrorMessage(copy.errors.requiredGenericIdentifier);
      return;
    }
    sendOtpMutation.mutate({
      identifier: identifier.trim(),
      channel: identifier.includes('@') ? 'EMAIL' : 'SMS',
      purpose: 'RESET_PIN'
    });
  };

  const handleResetPin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (otp.length !== 6) {
      setErrorMessage(copy.errors.resetOtpLength);
      return;
    }
    if (newPin.length !== 6) {
      setErrorMessage(copy.errors.newPinLength);
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMessage(copy.errors.pinMismatch);
      return;
    }

    resetPinMutation.mutate({
      identifier: identifier.trim(),
      otp: otp.trim(),
      newPin: newPin.trim()
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200/80 p-8 sm:p-10">
        <div className="mb-6">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {copy.auth.backToLogin}
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#0E4B2E] text-[#FACC15] flex items-center justify-center font-black text-xl shadow-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {copy.auth.resetPinTitle}
              </h1>
              <span className="text-xs text-gray-500">
                {copy.auth.resetPinSubtitle}
              </span>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {copy.auth.resetSuccessTitle}
            </h2>
            <p className="text-sm text-gray-600">
              {copy.auth.resetSuccessMessage}
            </p>
            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
              >
                {copy.auth.proceedToLogin}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 text-xs">
              <div className={`flex items-center gap-2 ${step === 1 ? 'font-bold text-[#0E4B2E]' : 'text-gray-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-[#0E4B2E] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  1
                </span>
                <span>{copy.auth.stepSendCode}</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-200" />
              <div className={`flex items-center gap-2 ${step === 2 ? 'font-bold text-[#0E4B2E]' : 'text-gray-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-[#0E4B2E] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  2
                </span>
                <span>{copy.auth.stepSetPin}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4">
                <Alert type="error" onClose={() => setErrorMessage('')}>
                  {errorMessage}
                </Alert>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Input
                  label={copy.auth.resetIdentifierLabel}
                  placeholder={copy.auth.resetIdentifierPlaceholder}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  helperText={copy.auth.resetIdentifierHelper}
                  required
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={sendOtpMutation.isPending}
                  >
                    {copy.auth.sendVerificationCode}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPin} className="space-y-4">
                <Input
                  label={copy.auth.verificationOtpLabel}
                  placeholder={copy.auth.verificationOtpPlaceholder}
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  helperText={`${copy.auth.verificationOtpHelperPrefix} ${identifier}`}
                  required
                />

                <Input
                  label={copy.auth.newPinLabel}
                  isPassword={true}
                  maxLength={6}
                  placeholder={copy.auth.pinPlaceholder}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  required
                />

                <Input
                  label={copy.auth.confirmPinLabel}
                  isPassword={true}
                  maxLength={6}
                  placeholder={copy.auth.pinPlaceholder}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  required
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-500 hover:text-gray-900 hover:underline"
                  >
                    {copy.auth.changeIdentifier}
                  </button>
                  <button
                    type="button"
                    disabled={sendOtpMutation.isPending}
                    onClick={() => {
                      sendOtpMutation.mutate({
                        identifier: identifier.trim(),
                        channel: identifier.includes('@') ? 'EMAIL' : 'SMS',
                        purpose: 'RESET_PIN'
                      });
                    }}
                    className="text-[#0E4B2E] font-medium hover:underline"
                  >
                    {copy.auth.resendCode}
                  </button>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={resetPinMutation.isPending}
                  >
                    {copy.auth.updateSecurityPin}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPinPage;
