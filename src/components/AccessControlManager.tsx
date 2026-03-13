"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalError,
  ModalSpinner,
} from "@/components/Modal";

interface Domain {
  id: number;
  apex_domain: string;
  created_datetime_utc: string;
}

interface AccessControlManagerProps {
  domains: Domain[];
}

export function AccessControlManager({
  domains: initialDomains,
}: AccessControlManagerProps) {
  const router = useRouter();
  const [domains, setDomains] = useState(initialDomains);

  // Domain modals
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [showEditDomainModal, setShowEditDomainModal] = useState(false);
  const [showDeleteDomainModal, setShowDeleteDomainModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  // Form state
  const [domainInput, setDomainInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Domain handlers
  const handleAddDomain = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/allowed-signup-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apex_domain: domainInput }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDomains([...domains, data.domain].sort((a, b) => a.apex_domain.localeCompare(b.apex_domain)));
      setShowAddDomainModal(false);
      setDomainInput("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add domain");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDomain = async () => {
    if (!selectedDomain) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/allowed-signup-domains/${selectedDomain.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apex_domain: domainInput }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDomains(
        domains
          .map((d) => (d.id === selectedDomain.id ? data.domain : d))
          .sort((a, b) => a.apex_domain.localeCompare(b.apex_domain))
      );
      setShowEditDomainModal(false);
      setSelectedDomain(null);
      setDomainInput("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update domain");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDomain = async () => {
    if (!selectedDomain) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/allowed-signup-domains/${selectedDomain.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      setDomains(domains.filter((d) => d.id !== selectedDomain.id));
      setShowDeleteDomainModal(false);
      setSelectedDomain(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete domain");
    } finally {
      setLoading(false);
    }
  };

  const openEditDomain = (domain: Domain) => {
    setSelectedDomain(domain);
    setDomainInput(domain.apex_domain);
    setError(null);
    setShowEditDomainModal(true);
  };

  const openDeleteDomain = (domain: Domain) => {
    setSelectedDomain(domain);
    setError(null);
    setShowDeleteDomainModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Domain Gatekeeper Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="h-2 w-2 bg-red-500 rounded-full"></span>
          Allowed Signup Domains
        </h2>
        <button
          onClick={() => {
            setDomainInput("");
            setError(null);
            setShowAddDomainModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Domain
        </button>
      </div>
      <div className="glass-card p-6 space-y-4">
        <p className="text-xs text-muted leading-relaxed">
          Only users with email addresses from these apex domains are permitted to join the experiment.
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {domains.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">No domains configured</p>
          ) : (
            domains.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5 group hover:border-indigo-500/30 transition-colors"
              >
                <span className="text-sm font-mono text-indigo-300">@{domain.apex_domain}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditDomain(domain)}
                    className="p-1.5 rounded-md hover:bg-white/10 text-muted hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openDeleteDomain(domain)}
                    className="p-1.5 rounded-md hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Domain Modal */}
      <Modal
        isOpen={showAddDomainModal}
        onClose={() => setShowAddDomainModal(false)}
        maxWidth="max-w-md"
        borderColor="border-indigo-500/50"
      >
        <ModalHeader showCloseButton onClose={() => setShowAddDomainModal(false)}>
          <h3 className="text-lg font-semibold">Add Allowed Domain</h3>
          <p className="text-sm text-muted mt-1">Enter an apex domain (e.g., university.edu)</p>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Apex Domain
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-black/40 border border-r-0 border-white/10 rounded-l-lg text-muted">@</span>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="example.edu"
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-r-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>
            </div>
            <ModalError message={error} />
          </div>
        </ModalContent>
        <ModalFooter className="flex justify-end gap-3">
          <button
            onClick={() => setShowAddDomainModal(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddDomain}
            disabled={loading || !domainInput.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <ModalSpinner />}
            Add Domain
          </button>
        </ModalFooter>
      </Modal>

      {/* Edit Domain Modal */}
      <Modal
        isOpen={showEditDomainModal}
        onClose={() => setShowEditDomainModal(false)}
        maxWidth="max-w-md"
        borderColor="border-indigo-500/50"
      >
        <ModalHeader showCloseButton onClose={() => setShowEditDomainModal(false)}>
          <h3 className="text-lg font-semibold">Edit Domain</h3>
          <p className="text-sm text-muted mt-1">Update the apex domain</p>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Apex Domain
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-black/40 border border-r-0 border-white/10 rounded-l-lg text-muted">@</span>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="example.edu"
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-r-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>
            </div>
            <ModalError message={error} />
          </div>
        </ModalContent>
        <ModalFooter className="flex justify-end gap-3">
          <button
            onClick={() => setShowEditDomainModal(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleEditDomain}
            disabled={loading || !domainInput.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <ModalSpinner />}
            Save Changes
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Domain Modal */}
      <Modal
        isOpen={showDeleteDomainModal}
        onClose={() => setShowDeleteDomainModal(false)}
        maxWidth="max-w-md"
        borderColor="border-red-500/50"
      >
        <ModalHeader showCloseButton onClose={() => setShowDeleteDomainModal(false)}>
          <h3 className="text-lg font-semibold text-red-400">Delete Domain</h3>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <p className="text-muted">
              Are you sure you want to delete the domain{" "}
              <span className="font-mono text-red-400">@{selectedDomain?.apex_domain}</span>?
            </p>
            <p className="text-sm text-muted">
              Users with email addresses from this domain will no longer be able to sign up.
            </p>
            <ModalError message={error} />
          </div>
        </ModalContent>
        <ModalFooter className="flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteDomainModal(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteDomain}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <ModalSpinner />}
            Delete Domain
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
