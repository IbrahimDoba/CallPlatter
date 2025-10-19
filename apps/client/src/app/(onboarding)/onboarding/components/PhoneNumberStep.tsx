"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Phone, Loader2 } from "lucide-react";
import type { OnboardingData } from "../page";

interface PhoneNumberStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onFinish: (phoneNumber?: string) => void;
  onBack: () => void;
  isCompleting?: boolean;
}

interface AvailablePhoneNumber {
  id: string;
  number: string;
  countryCode: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function PhoneNumberStep({
  data,
  onUpdate,
  onFinish,
  onBack,
  isCompleting = false,
}: PhoneNumberStepProps) {
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(
    data.selectedPhoneNumber
  );
  const [selectedPhoneNumberId, setSelectedPhoneNumberId] = useState(
    data.selectedPhoneNumberId || ""
  );
  const [availableNumbers, setAvailableNumbers] = useState<
    AvailablePhoneNumber[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch available phone numbers
  const fetchAvailableNumbers = async (
    page: number = 1,
    search: string = ""
  ) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"}/api/admin/phone-numbers/available?${params}`
      );
      const result = await response.json();

      if (result.ok) {
        setAvailableNumbers(result.data);
        setPagination(result.pagination);
        setCurrentPage(page);
      } else {
        toast.error("Failed to load available phone numbers");
      }
    } catch (error) {
      console.error("Error fetching available numbers:", error);
      toast.error("Failed to load available phone numbers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableNumbers(1, searchTerm);
  }, [searchTerm]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== "") {
        fetchAvailableNumbers(1, searchTerm);
      } else {
        fetchAvailableNumbers(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Format phone number for display
  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove any existing formatting
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");

    // Format based on length and country code
    if (cleanNumber.startsWith("+234")) {
      // Nigerian format: +234 801 234 5678
      return cleanNumber.replace(/(\+234)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
    } else if (cleanNumber.startsWith("+1")) {
      // US format: +1 (234) 567-8900
      return cleanNumber.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");
    } else if (cleanNumber.startsWith("+44")) {
      // UK format: +44 20 1234 5678
      return cleanNumber.replace(/(\+44)(\d{2})(\d{4})(\d{4})/, "$1 $2 $3 $4");
    } else {
      // Generic format: +123 456 789 0123
      return cleanNumber.replace(
        /(\+\d{1,3})(\d{3})(\d{3})(\d{3,4})/,
        "$1 $2 $3 $4"
      );
    }
  };

  const handleFinish = () => {
    // Find the selected phone number
    const selectedPhone = availableNumbers.find(
      (phone) => phone.id === selectedPhoneNumberId
    );

    if (!selectedPhone) {
      toast.error("Please select a phone number");
      return;
    }

    // Update the data with both the phone number and ID
    onUpdate({
      selectedPhoneNumber: selectedPhone.number,
      selectedPhoneNumberId: selectedPhone.id,
    });

    // Pass the phone number directly to the finish handler
    onFinish(selectedPhone.number);
  };

  const isFormValid =
    selectedPhoneNumberId !== "" && selectedPhoneNumberId !== undefined;

  if (isLoading) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Phone Number</h2>
          <p className="mt-2 text-gray-600">
            Loading available phone numbers...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold text-gray-900">Phone Number</h2>
        <p className="mt-2 text-gray-600">
          Choose a phone number for your business
        </p>
      </motion.div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div>
          <Label
            htmlFor="phoneNumber"
            className="text-sm font-medium text-gray-700"
          >
            Pick a Number *
          </Label>
          <motion.div
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Select
              value={selectedPhoneNumberId}
              onValueChange={(value) => {
                setSelectedPhoneNumberId(value);
                // Also update the phone number when ID changes
                const selectedPhone = availableNumbers.find(phone => phone.id === value);
                if (selectedPhone) {
                  setSelectedPhoneNumber(selectedPhone.number);
                }
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a phone number" />
              </SelectTrigger>
              <SelectContent>
                {availableNumbers.map((phone, index) => (
                  <motion.div
                    key={phone.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SelectItem value={phone.id}>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatPhoneNumber(phone.number)}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  </motion.div>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
          <p className="mt-1 text-sm text-gray-500">
            Choose a phone number for your business. You can change this later
            in settings.
          </p>
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.pages > 1 && (
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  fetchAvailableNumbers(currentPage - 1, searchTerm)
                }
                disabled={!pagination.hasPrev || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  fetchAvailableNumbers(currentPage + 1, searchTerm)
                }
                disabled={!pagination.hasNext || isLoading}
              >
                Next
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              {pagination.total} total numbers
            </div>
          </motion.div>
        )}

        {selectedPhoneNumberId && (
          <motion.div
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Phone className="w-5 h-5 text-blue-400" />
                </motion.div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Selected Number
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  {formatPhoneNumber(
                    availableNumbers.find((p) => p.id === selectedPhoneNumberId)
                      ?.number || selectedPhoneNumber
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="flex justify-between pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button variant="outline" onClick={onBack} className="px-8">
            Back
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={handleFinish}
            disabled={!isFormValid || isCompleting}
            className="px-8"
          >
            {isCompleting ? "Completing Setup..." : "Finish Setup"}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
