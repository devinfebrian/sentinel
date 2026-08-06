'use client';

import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import InputField from '@/components/common/InputField';
import PrimaryButton from '@/components/common/PrimaryButton';
import AlertNotice from '@/components/common/AlertNotice';
import TempPasswordPanel from '@/components/admin/TempPasswordPanel';
import { registerMemberSchema } from '@/lib/validations/user.schema';
import { validateForm } from '@/lib/validations/auth.schema';
import { createUserApi, ApiError, type AdminUser } from '@/lib/services/api';
import { getAccessToken } from '@/lib/stores/auth.store';

export interface RegisterMemberModalProps {
  open: boolean;
  onClose: () => void;
  onRegistered: (user: AdminUser) => void;
}

interface RevealResult {
  user: AdminUser;
  tempPassword: string;
  notice: string;
}

const emptyForm = { fullname: '', email: '' };

export default function RegisterMemberModal({
  open,
  onClose,
  onRegistered,
}: RegisterMemberModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RevealResult | null>(null);

  const reset = () => {
    setForm(emptyForm);
    setErrors({});
    setServerError(null);
    setSubmitting(false);
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateForm(registerMemberSchema, form);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) return;

    setErrors({});
    setSubmitting(true);

    try {
      const res = await createUserApi(validation.data, accessToken);
      onRegistered(res.data.user);
      setResult(res.data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrors({ email: 'A member with this email already exists' });
        } else {
          setServerError(err.message);
        }
        if (err.fieldErrors.length) {
          setErrors(Object.fromEntries(err.fieldErrors.map((f) => [f.field, f.message])));
        }
      } else {
        setServerError('Unable to register this member. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={result ? 'Member Registered' : 'Register New Member'}
      size="sm"
    >
      {result ? (
        <TempPasswordPanel
          email={result.user.email}
          tempPassword={result.tempPassword}
          notice={result.notice}
          onDone={handleClose}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {serverError && <AlertNotice variant="error" icon="error" message={serverError} />}

          <InputField
            id="register-fullname"
            label="Full Name"
            value={form.fullname}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, fullname: e.target.value }));
              if (errors.fullname) setErrors((prev) => ({ ...prev, fullname: null }));
            }}
            error={errors.fullname}
            disabled={submitting}
          />

          <InputField
            id="register-email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, email: e.target.value }));
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
            }}
            error={errors.email}
            disabled={submitting}
          />

          <div className="pt-2 space-y-3">
            <PrimaryButton
              type="submit"
              loading={submitting}
              loadingText="Registering"
              icon="person_add"
            >
              Register
            </PrimaryButton>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="w-full text-center py-2 font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
