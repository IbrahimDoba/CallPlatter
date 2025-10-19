"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PhoneNumber {
  id: string;
  number: string;
  countryCode: string;
  isActive: boolean;
  isAssigned: boolean;
  assignedTo: string | null;
  createdAt: string;
  business?: {
    id: string;
    name: string;
  };
}

interface AddPhoneNumberData {
  number: string;
}

export default function PhoneNumbersPage() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState<AddPhoneNumberData>({
    number: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

  // Format phone number for display
  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove any existing formatting
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Format based on length and country code
    if (cleanNumber.startsWith('+234')) {
      // Nigerian format: +234 801 234 5678
      return cleanNumber.replace(/(\+234)(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
    } else if (cleanNumber.startsWith('+1')) {
      // US format: +1 (234) 567-8900
      return cleanNumber.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
    } else if (cleanNumber.startsWith('+44')) {
      // UK format: +44 20 1234 5678
      return cleanNumber.replace(/(\+44)(\d{2})(\d{4})(\d{4})/, '$1 $2 $3 $4');
    } else {
      // Generic format: +123 456 789 0123
      return cleanNumber.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3 $4');
    }
  };

  const fetchPhoneNumbers = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/admin/phone-numbers?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch phone numbers');
      }
      
      const data = await response.json();
      setPhoneNumbers(data.data);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch phone numbers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoneNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoneNumber.number) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/admin/phone-numbers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPhoneNumber)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add phone number');
      }

      const data = await response.json();
      setPhoneNumbers(prev => [data.data, ...prev]);
      setNewPhoneNumber({ number: "" });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add phone number');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/admin/phone-numbers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to update phone number');
      }

      setPhoneNumbers(prev => 
        prev.map(phone => 
          phone.id === id ? { ...phone, isActive: !isActive } : phone
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update phone number');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this phone number?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/admin/phone-numbers/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete phone number');
      }

      setPhoneNumbers(prev => prev.filter(phone => phone.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete phone number');
    }
  };

  useEffect(() => {
    fetchPhoneNumbers(1);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading phone numbers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Phone Numbers Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage available phone numbers for business assignments
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive">{error}</p>
            <Button 
              onClick={() => setError(null)} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Phone Numbers ({phoneNumbers.length})
            </h2>
            <p className="text-sm text-muted-foreground">
              {phoneNumbers.filter(p => !p.isAssigned).length} available, {phoneNumbers.filter(p => p.isAssigned).length} assigned
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            Add Phone Number
          </Button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Add New Phone Number</h3>
            <form onSubmit={handleAddPhoneNumber} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Phone Number
                </label>
                <input
                  type="text"
                  value={newPhoneNumber.number}
                  onChange={(e) => setNewPhoneNumber(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="+2348012345678"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Include country code (e.g., +2348012345678)
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Phone Number'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {phoneNumbers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium text-foreground">Phone Number</th>
                    <th className="text-left p-4 font-medium text-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-foreground">Assigned To</th>
                    <th className="text-left p-4 font-medium text-foreground">Created</th>
                    <th className="text-left p-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {phoneNumbers.map((phone) => (
                    <tr key={phone.id} className="border-t border-border">
                      <td className="p-4 text-foreground font-medium">
                        {formatPhoneNumber(phone.number)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            phone.isAssigned 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {phone.isAssigned ? 'Assigned' : 'Available'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            phone.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {phone.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {phone.business ? (
                          <div>
                            <div className="font-medium text-foreground">{phone.business.name}</div>
                            <div className="text-sm text-muted-foreground">ID: {phone.business.id}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(phone.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(phone.id, phone.isActive)}
                          >
                            {phone.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          {!phone.isAssigned && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(phone.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No phone numbers found.</p>
              <Button onClick={() => setShowAddForm(true)}>
                Add First Phone Number
              </Button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPhoneNumbers(currentPage - 1)}
                disabled={!pagination.hasPrev || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPhoneNumbers(currentPage + 1)}
                disabled={!pagination.hasNext || loading}
              >
                Next
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {pagination.total} total numbers
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
