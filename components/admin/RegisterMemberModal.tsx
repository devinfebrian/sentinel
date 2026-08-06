'use client';

import React, { useState } from 'react';
import { ExclamationCircleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/common/Modal';
import InputField from '@/components/common/InputField';
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

  // The reveal step owns the whole panel (centred icon, no header), so the
  // chrome around it differs from the form step.
  if (result) {
    return (
      <Modal open={open} onClose={handleClose} size="sm" bare>
        <TempPasswordPanel
          email={result.user.email}
          tempPassword={result.tempPassword}
          notice={result.notice}
          onDone={handleClose}
        />
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Register New Member"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="h-10 rounded-lg px-4 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="register-member-form"
            disabled={submitting}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary-container px-5 font-label-sm text-label-sm text-on-primary-container transition-colors hover:bg-primary-fixed disabled:opacity-50"
          >
            <UserPlusIcon aria-hidden="true" className="h-[18px] w-[18px]" />
            {submitting ? 'Generating...' : 'Generate Credentials'}
          </button>
        </>
      }
    >
      <form id="register-member-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && (
          <AlertNotice variant="error" icon={ExclamationCircleIcon} message={serverError} />
        )}

        <InputField
          id="register-fullname"
          label="Full Name"
          placeholder="e.g. Alex Chen"
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
          label="Email Address"
          type="email"
          placeholder="alex.c@sentinel.ai"
          value={form.email}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, email: e.target.value }));
            if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
          }}
          error={errors.email}
          disabled={submitting}
        />
      </form>
    </Modal>
  );
}
