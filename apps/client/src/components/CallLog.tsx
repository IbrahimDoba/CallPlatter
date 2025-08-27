'use client';

import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type CallLogProps = {
  logs: {
    id: string;
    message: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    audioChunk?: string;
  }[];
};

export function CallLog({ logs }: CallLogProps) {
  if (!logs?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No call logs available
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Call Transcript</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`flex gap-3 ${
              log.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <Avatar>
              <AvatarImage
                src={log.sender === 'ai' ? '/ai-avatar.png' : undefined}
                alt={log.sender}
              />
              <AvatarFallback>{log.sender === 'ai' ? 'AI' : 'U'}</AvatarFallback>
            </Avatar>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                log.sender === 'ai'
                  ? 'bg-muted'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              <p className="whitespace-pre-wrap">{log.message}</p>
              <p className="text-xs opacity-70 mt-1">
                {format(new Date(log.timestamp), 'h:mm a')}
              </p>
              {log.audioChunk && (
                <audio
                  src={log.audioChunk}
                  controls
                  className="w-full mt-2 h-8"
                >
                  <track
                    kind="captions"
                    src=""
                    srcLang="en"
                    label="English"
                    default
                  />
                </audio>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
