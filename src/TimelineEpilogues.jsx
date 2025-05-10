import React from "react";
import { ScrollArea } from "./components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Timeline = ({ entries }) => {
  return (
    <Card className="rounded-2xl shadow-md bg-white" style={{
      
    }}>
      <CardHeader>
        <CardTitle>
          <h2 className="text-lg font-bold text-gray-800">Timeline</h2>
        </CardTitle>
      </CardHeader>

      <div className="border-b border-gray-200 mx-4" />

      <CardContent>
        <ScrollArea className="h-64 pr-2">
          <ul className="space-y-3" style={{
                textAlign: "left", 
                overflowY: "auto",
                scrollbarWidth:"none",
                height: "70vh",
                padding: "10px",
                }}>
            {entries.map((entry, idx) => (
              <div className="text-sm text-gray-600"  key={idx}>
                <span className="font-medium text-gray-800">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className="ml-2 text-gray-500">{entry.message}</span>
              </div>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Timeline;
