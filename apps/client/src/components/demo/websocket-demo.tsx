'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSocketContext } from '@/components/providers/socket-provider';

export function WebSocketDemo() {
  const { 
    isConnected, 
    connect, 
    disconnect, 
    joinBusiness, 
    leaveBusiness, 
    emitNewCall, 
    emitCallStatusUpdate 
  } = useSocketContext();
  
  const [businessId, setBusinessId] = useState('demo-business-123');
  const [customerName, setCustomerName] = useState('John Doe');
  const [customerPhone, setCustomerPhone] = useState('+1234567890');
  const [callIntent, setCallIntent] = useState('Appointment Booking');

  const handleTestNewCall = () => {
    const testCall = {
      id: `call-${Date.now()}`,
      businessId,
      customerName,
      customerPhone,
      intent: callIntent,
      transcript: 'Hello, I would like to book an appointment.',
      createdAt: new Date().toISOString(),
      status: 'in-progress'
    };
    
    emitNewCall(testCall);
  };

  const handleTestCallUpdate = () => {
    const testUpdate = {
      callId: `call-${Date.now() - 1000}`,
      businessId,
      status: 'completed',
      transcript: 'Appointment booked for next Tuesday at 2 PM.',
      updatedAt: new Date().toISOString()
    };
    
    emitCallStatusUpdate(testUpdate);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>WebSocket Demo</span>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Test WebSocket functionality and real-time communication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Controls */}
        <div className="space-y-2">
          <h4 className="font-medium">Connection</h4>
          <div className="flex space-x-2">
            <Button onClick={connect} disabled={isConnected}>
              Connect
            </Button>
            <Button onClick={disconnect} disabled={!isConnected} variant="outline">
              Disconnect
            </Button>
          </div>
        </div>

        {/* Business Room Controls */}
        <div className="space-y-2">
          <h4 className="font-medium">Business Room</h4>
          <div className="flex space-x-2">
            <Input
              placeholder="Business ID"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => joinBusiness(businessId)} disabled={!isConnected}>
              Join
            </Button>
            <Button onClick={() => leaveBusiness(businessId)} disabled={!isConnected} variant="outline">
              Leave
            </Button>
          </div>
        </div>

        {/* Test New Call */}
        <div className="space-y-2">
          <h4 className="font-medium">Test New Call</h4>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              placeholder="Customer Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
          <Input
            placeholder="Call Intent"
            value={callIntent}
            onChange={(e) => setCallIntent(e.target.value)}
          />
          <Button onClick={handleTestNewCall} disabled={!isConnected} className="w-full">
            Emit New Call Event
          </Button>
        </div>

        {/* Test Call Update */}
        <div className="space-y-2">
          <h4 className="font-medium">Test Call Update</h4>
          <Button onClick={handleTestCallUpdate} disabled={!isConnected} className="w-full" variant="outline">
            Emit Call Status Update Event
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <h5 className="font-medium mb-2">How to test:</h5>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Connect" to establish WebSocket connection</li>
            <li>Enter a Business ID and click "Join" to join the business room</li>
            <li>Fill in call details and click "Emit New Call Event"</li>
            <li>Check the Calls page to see real-time updates</li>
            <li>Use "Emit Call Status Update Event" to test status changes</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
