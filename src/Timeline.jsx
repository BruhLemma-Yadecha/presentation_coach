import React from "react";
import { ScrollArea } from "./components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Timeline = ({ entries }) => {
  return (
    <Card style={{ borderRadius: "20px" }}>
      <CardHeader>
        <CardTitle>
          {" "}
          <h2 className="text-lg font-bold mb-2">Timeline</h2>
        </CardTitle>
      </CardHeader>
      <div className="border-b border-gray-300 my-2" />
      <CardContent>
        <ScrollArea className="h-64">
          <ul
            className="space-y-2 list-none pl-0 ml-0 text-left"
            style={{ textAlign: "left" }}
          >
            {entries.map((entry, idx) => (
              <p key={idx} className="">
                <span className="text-xs text-gray-400 mb-1">
                  {new Date(entry.timestamp).toLocaleTimeString()} |{" "}
                  {entry.message}
                </span>
              </p>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Timeline;
