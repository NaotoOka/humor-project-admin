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

interface WhitelistEmail {
  id: number;
  email_address: string;
  created_datetime_utc: string;
  modified_datetime_utc: string;
}

interface WhitelistEmailsManagerProps {
  emails: WhitelistEmail[];
}

export function WhitelistEmailsManager({
  emails: initialEmails,
}: WhitelistEmailsManagerProps) {
  const router = useRouter();
  const [emails, setEmails] = useState(initialEmails);

  // Email modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<WhitelistEmail | null>(null);

  // Form state
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email handlers
  const handleAddEmail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/whitelist-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_address: emailInput }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setEmails([...emails, data.email].sort((a, b) => a.email_address.localeCompare(b.email_address)));
      setShowAddModal(false);
      setEmailInput("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add email");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = async () => {
    if (!selectedEmail) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/whitelist-emails/${selectedEmail.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_address: emailInput }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setEmails(
        emails
          .map((e) => (e.id === selectedEmail.id ? data.email : e))
          .sort((a, b) => a.email_address.localeCompare(b.email_address))
      );
      setShowEditModal(false);
      setSelectedEmail(null);
      setEmailInput("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmail = async () => {
    if (!selectedEmail) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/whitelist-emails/${selectedEmail.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      setEmails(emails.filter((e) => e.id !== selectedEmail.id));
      setShowDeleteModal(false);
      setSelectedEmail(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete email");
    } finally {
      setLoading(false);
    }
  };

  const openEditEmail = (email: WhitelistEmail) => {
    setSelectedEmail(email);
    setEmailInput(email.email_address);
    setError(null);
    setShowEditModal(true);
  };

  const openDeleteEmail = (email: WhitelistEmail) => {
    setSelectedEmail(email);
    setError(null);
    setShowDeleteModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Whitelist Email Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="h-2 w-2 bg-green-500 rounded-full"></span>
          Whitelisted Email Addresses
        </h2>
        <button
          onClick={() => {
            setEmailInput("");
            setError(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Email
        </button>
      </div>
      <div className="glass-card p-6 space-y-4">
        <p className="text-xs text-muted leading-relaxed">
          These specific email addresses are allowed to sign up regardless of domain restrictions.
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {emails.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">No whitelisted emails configured</p>
          ) : (
            emails.map((email) => (
              <div
                key={email.id}
                className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5 group hover:border-green-500/30 transition-colors"
              >
                <span className="text-sm font-mono text-green-300">{email.email_address}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditEmail(email)}
                    className="p-1.5 rounded-md hover:bg-white/10 text-muted hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openDeleteEmail(email)}
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

      {/* Add Email Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        maxWidth="max-w-md"
        borderColor="border-green-500/50"
      >
        <ModalHeader showCloseButton onClose={() => setShowAddModal(false)}>
          <h3 className="text-lg font-semibold">Add Whitelisted Email</h3>
          <p className="text-sm text-muted mt-1">Enter an email address to whitelist</p>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="user@example.edu"
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
              />
            </div>
            <ModalError message={error} />
          </div>
        </ModalContent>
        <ModalFooter className="flex justify-end gap-3">
          <button
            onClick={() => setShowAddModal(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddEmail}
            disabled={loading || !emailInput.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <ModalSpinner />}
            Add Email
          </button>
        </ModalFooter>
      </Modal>

      {/* Edit Email Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="max-w-md"
        borderColor="border-green-500/50"
      >
        <ModalHeader showCloseButton onClose={() => setShowEditModal(false)}>
          <h3 className="text-lg font-semibold">Edit Whitelisted Email</h3>
          <p className="text-sm text-muted mt-1">Update the email address</p>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="user@example.edu"
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
              />
            </div>
            <ModalError message={error} />
          </div>
        </ModalContent>
        <ModalFooter className="flex justify-end gap-3">
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleEditEmail}
            disabled={loading || !emailInput.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <ModalSpinner />}
            Save Changes
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Email Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="max-w-md"
        borderColor="border-red-500/50"
      >
        <ModalHeader showCloseButton onClose={() => setShowDeleteModal(false)}>
          <h3 className="text-lg font-semibold text-red-400">Delete Whitelisted Email</h3>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <p className="text-muted">
              Are you sure you want to remove{" "}
              <span className="font-mono text-red-400">{selectedEmail?.email_address}</span>{" "}
              from the whitelist?
            </p>
            <p className="text-sm text-muted">
              This user will no longer have special sign-up privileges.
            </p>
            <ModalError message={error} />
          </div>
        </ModalContent>
        <ModalFooter className="flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteEmail}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <ModalSpinner />}
            Delete Email
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
