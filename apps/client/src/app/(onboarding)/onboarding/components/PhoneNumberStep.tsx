"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Phone, Loader2, MapPin, ArrowLeft, ArrowRight } from "lucide-react";
import type { OnboardingData } from "../page";

interface PhoneNumberStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onFinish: (phoneNumber?: string, phoneNumberId?: string) => void;
  onBack: () => void;
  isCompleting?: boolean;
}

interface TwilioPhoneNumber {
  phoneNumber: string;
  friendlyName: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
    fax: boolean;
  };
  locality: string;
  region: string;
}

interface PaginationInfo {
  currentPage: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalCount: number;
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
  const [availableNumbers, setAvailableNumbers] = useState<TwilioPhoneNumber[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);


  // Fetch available phone numbers from Twilio
  const fetchAvailableNumbers = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        countryCode: 'US',
        page: page.toString(),
        limit: '20', // Increased from 10 to 20
      });

      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      const url = `${cleanBaseUrl}/api/twilio/available-numbers?${params}`;
      console.log("Fetching from URL:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response not OK:", response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();

      if (result.ok) {
        setAvailableNumbers(result.data);
        setPagination(result.pagination);
        setCurrentPage(page);
        console.log("📊 Pagination info:", result.pagination);
      } else {
        toast.error("Failed to load available phone numbers");
      }
    } catch (error) {
      console.error("Error fetching available numbers:", error);
      toast.error("Failed to load available phone numbers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableNumbers();
  }, [fetchAvailableNumbers]);

  // Format phone number for display
  const formatPhoneNumber = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");
    
    if (cleanNumber.startsWith("+1")) {
      return cleanNumber.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");
    }
    if (cleanNumber.startsWith("+234")) {
      return cleanNumber.replace(/(\+234)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
    }
    return cleanNumber.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{3,4})/, "$1 $2 $3 $4");
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      fetchAvailableNumbers(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination?.hasPrevPage) {
      fetchAvailableNumbers(currentPage - 1);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      fetchAvailableNumbers(page);
    }
  };

  const handleFinish = async () => {
    if (!selectedPhoneNumber) {
      toast.error("Please select a phone number");
      return;
    }

    // Check if phone number is already purchased (has selectedPhoneNumberId)
    if (data.selectedPhoneNumberId) {
      console.log("Phone number already purchased, skipping purchase and completing onboarding");
      toast.success("Phone number already configured!");
      onFinish(data.selectedPhoneNumber, data.selectedPhoneNumberId);
      return;
    }

    setIsPurchasing(true);

    try {
      // Purchase the selected number via backend
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      const response = await fetch(
        `${cleanBaseUrl}/api/twilio/purchase-number`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: selectedPhoneNumber,
            friendlyName: `${data.businessName} - Business Number`
          })
        }
      );

      const result = await response.json();

      if (result.ok) {
        // Update the data with purchased number details
        const phoneData = {
          selectedPhoneNumber: result.data.phoneNumber,
          selectedPhoneNumberId: result.data.sid,
        };
        
        console.log("Updating phone data:", phoneData);
        onUpdate(phoneData);

        toast.success("Phone number purchased successfully!");
        
        // Pass the complete phone data to onFinish
        onFinish(result.data.phoneNumber, result.data.sid);
      } else {
        throw new Error(result.error || "Failed to purchase phone number");
      }
    } catch (error) {
      console.error("Error purchasing number:", error);
      
      // Provide specific error messages based on the error
      if (error instanceof Error) {
        if (error.message.includes("NGROK_URL")) {
          toast.error(
            "Server configuration issue. Please contact support or check server logs."
          );
        } else if (error.message.includes("no longer available")) {
          toast.error("This phone number is no longer available. Refreshing available numbers...");
          // Refresh available numbers
          fetchAvailableNumbers(1);
        } else {
          toast.error(`Failed to purchase phone number: ${error.message}`);
        }
      } else {
        toast.error("Failed to purchase phone number. Please try again.");
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const isFormValid = selectedPhoneNumber !== "";

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
            Loading available phone numbers from Twilio...
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
          Choose a phone number for your business from Twilio
        </p>
      </motion.div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Available Numbers */}
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Available Numbers *
          </Label>
          <div className="mt-2 grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto">
            {availableNumbers.map((number, index) => (
              <button
                key={number.phoneNumber}
                type="button"
                className={`w-full text-left border-2 rounded-lg p-3 cursor-pointer transition-colors duration-200 ${
                  selectedPhoneNumber === number.phoneNumber
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
                onClick={() => {
                  console.log('Selected phone number:', number.phoneNumber);
                  setSelectedPhoneNumber(number.phoneNumber);
                  // Also update the parent component
                  onUpdate({ selectedPhoneNumber: number.phoneNumber });
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatPhoneNumber(number.phoneNumber)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {number.locality}, {number.region}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {number.capabilities.voice && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Voice
                      </span>
                    )}
                    {number.capabilities.sms && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        SMS
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                {pagination.totalCount} numbers
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={!pagination.hasPrevPage}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                  className="flex items-center gap-1"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        className="flex justify-between pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button
          onClick={handleFinish}
          disabled={!isFormValid || isCompleting || isPurchasing}
          className="px-8"
        >
          {isPurchasing ? "Purchasing..." : isCompleting ? "Completing Setup..." : data.selectedPhoneNumberId ? "Complete Setup" : "Finish Setup"}
        </Button>
      </motion.div>
    </motion.div>
  );
}