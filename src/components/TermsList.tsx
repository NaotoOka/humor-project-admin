"use client";

import { useState, useEffect, useCallback } from "react";
import { DeleteTermModal } from "./DeleteTermModal";
import { EditTermModal } from "./EditTermModal";
import { CreateTermModal } from "./CreateTermModal";

interface TermType {
  id: number;
  name: string;
}

interface Term {
  id: number;
  created_datetime_utc: string;
  modified_datetime_utc: string | null;
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
  term_types: TermType | null;
}

const ITEMS_PER_PAGE = 50;

export function TermsList() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [termTypes, setTermTypes] = useState<TermType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [termToDelete, setTermToDelete] = useState<Term | null>(null);
  const [termToEdit, setTermToEdit] = useState<Term | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTypeId, setFilterTypeId] = useState<number | null>(null);

  const fetchTermTypes = useCallback(async () => {
    try {
      // Fetch unique term types from existing terms
      const response = await fetch("/api/terms?limit=500");
      if (response.ok) {
        const { terms: allTerms } = await response.json();
        const types: TermType[] = [];
        const seen = new Set<number>();
        for (const t of allTerms) {
          if (t.term_types && !seen.has(t.term_types.id)) {
            seen.add(t.term_types.id);
            types.push(t.term_types);
          }
        }
        setTermTypes(types);
      }
    } catch (err) {
      console.error("Failed to fetch term types:", err);
    }
  }, []);

  const fetchTerms = useCallback(async (offset: number = 0, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let url = `/api/terms?offset=${offset}&limit=${ITEMS_PER_PAGE}`;
      if (filterTypeId) {
        url += `&term_type_id=${filterTypeId}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch terms");
      }

      const { terms: termsData, hasMore: moreAvailable } = await response.json();

      setHasMore(moreAvailable);

      if (append) {
        setTerms(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const newTerms = termsData.filter((t: Term) => !existingIds.has(t.id));
          return [...prev, ...newTerms];
        });
      } else {
        setTerms(termsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load terms");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filterTypeId]);

  useEffect(() => {
    fetchTerms();
    fetchTermTypes();
  }, [fetchTerms, fetchTermTypes]);

  useEffect(() => {
    fetchTerms();
  }, [filterTypeId, fetchTerms]);

  const handleLoadMore = () => {
    fetchTerms(terms.length, true);
  };

  const handleDeleted = () => {
    setTermToDelete(null);
    if (termToDelete) {
      setTerms(prev => prev.filter(t => t.id !== termToDelete.id));
    }
  };

  const handleUpdated = (updatedTerm: Term) => {
    setTermToEdit(null);
    setTerms(prev =>
      prev.map(t => (t.id === updatedTerm.id ? updatedTerm : t))
    );
  };

  const handleCreated = (newTerm: Term) => {
    setShowCreateModal(false);
    setTerms(prev => [newTerm, ...prev]);
    // Refresh term types if a new type was added
    if (newTerm.term_types && !termTypes.find(tt => tt.id === newTerm.term_types!.id)) {
      setTermTypes(prev => [...prev, newTerm.term_types!]);
    }
  };

  // Filter terms by search query
  const filteredTerms = terms.filter(term => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      term.term.toLowerCase().includes(query) ||
      term.definition.toLowerCase().includes(query) ||
      term.example.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Header with Search, Filter, and Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terms..."
              className="pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors w-full sm:w-64"
            />
          </div>

          {/* Filter by Type */}
          {termTypes.length > 0 && (
            <select
              value={filterTypeId ?? ""}
              onChange={(e) => setFilterTypeId(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="px-4 py-2 text-sm rounded-lg border border-border bg-card-bg text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
            >
              <option value="">All Types</option>
              {termTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Term
        </button>
      </div>

      <div className="glass-card overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-purple-500/5">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Term</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Definition</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Example</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted">Priority</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTerms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted">
                    {searchQuery ? "No terms match your search." : "No terms found."}
                  </td>
                </tr>
              ) : (
                filteredTerms.map((term) => (
                  <tr key={term.id} className="transition-colors hover:bg-purple-500/5">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-foreground">
                        {term.term}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground line-clamp-2 max-w-xs">
                        {term.definition}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted italic line-clamp-2 max-w-xs">
                        {term.example}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {term.term_types ? (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          {term.term_types.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {term.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setTermToEdit(term)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => setTermToDelete(term)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Load More */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted">
            Showing {filteredTerms.length} of {terms.length} terms
          </p>
          {hasMore && !searchQuery && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loadingMore && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500" />
              )}
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {termToDelete && (
        <DeleteTermModal
          term={termToDelete}
          onClose={() => setTermToDelete(null)}
          onDeleted={handleDeleted}
        />
      )}

      {/* Edit Modal */}
      {termToEdit && (
        <EditTermModal
          term={termToEdit}
          termTypes={termTypes}
          onClose={() => setTermToEdit(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTermModal
          termTypes={termTypes}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
