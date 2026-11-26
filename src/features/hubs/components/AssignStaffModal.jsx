import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Modal,
  SearchBar,
  Select
} from '../../../shared/components/index.js';
import {
  HUB_STAFF_ROLE_OPTIONS,
  ROLES,
  useCopy
} from '../../../core/constants/index.js';
import { useAssignStaff, useStaffCandidates } from '../hooks/useHubs.js';

export function AssignStaffModal({ isOpen, onClose, hubId, hubName }) {
  const copy = useCopy();
  const assignCopy = copy.hubs.assignStaff;

  const [prevOpen, setPrevOpen] = useState(isOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.STORE_OPERATOR);
  const [formError, setFormError] = useState('');

  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setSearchTerm('');
      setSelectedUserId('');
      setSelectedRole(ROLES.STORE_OPERATOR);
      setFormError('');
    }
  }

  const { data: candidates = [], isFetching } = useStaffCandidates(
    searchTerm,
    isOpen
  );

  const candidateOptions = useMemo(
    () =>
      (Array.isArray(candidates) ? candidates : []).map((candidate) => ({
        value: candidate.id,
        label: candidate.name || candidate.email || candidate.phone || candidate.id,
        subtitle: [candidate.phone, candidate.email].filter(Boolean).join(' • ')
      })),
    [candidates]
  );

  const assignMutation = useAssignStaff({
    onSuccess: () => onClose?.()
  });

  const handleSubmit = () => {
    setFormError('');
    if (!selectedUserId) {
      setFormError(assignCopy.validationSelectUser);
      return;
    }

    assignMutation.mutate({
      hubId,
      payload: {
        userId: selectedUserId,
        role: selectedRole
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={assignCopy.title}
      description={hubName ? `${assignCopy.description} (${hubName})` : assignCopy.description}
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={assignMutation.isPending}
          >
            {assignCopy.cancel}
          </Button>
          <Button
            variant="primary"
            loading={assignMutation.isPending}
            onClick={handleSubmit}
          >
            {assignCopy.submit}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {formError && <Alert type="error">{formError}</Alert>}

        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">
            {assignCopy.searchLabel}
          </p>
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setSelectedUserId('');
            }}
            placeholder={assignCopy.searchPlaceholder}
            shortcutHint=""
          />
          <p className="mt-1 text-xs text-gray-500">
            {searchTerm.trim().length < 2
              ? assignCopy.typeToSearch
              : !isFetching && candidateOptions.length === 0
                ? assignCopy.noCandidates
                : null}
          </p>
        </div>

        <Select
          label={assignCopy.candidateLabel}
          placeholder={assignCopy.candidatePlaceholder}
          options={candidateOptions}
          value={selectedUserId}
          disabled={candidateOptions.length === 0}
          onChange={(event) => setSelectedUserId(event.target.value)}
          required
        />

        <Select
          label={assignCopy.roleLabel}
          placeholder={assignCopy.rolePlaceholder}
          options={HUB_STAFF_ROLE_OPTIONS}
          value={selectedRole}
          onChange={(event) => setSelectedRole(event.target.value)}
          required
        />

        {selectedRole === ROLES.STORE_OPERATOR && (
          <Alert type="info">{assignCopy.operatorHint}</Alert>
        )}
      </div>
    </Modal>
  );
}

export default AssignStaffModal;
