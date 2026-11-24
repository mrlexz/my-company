"use client";

import type { DepartmentId } from "@/types/office";
import { ContentRoomFurniture } from "./furniture/contentFurniture";
import { ExecutiveRoomFurniture } from "./furniture/executiveFurniture";
import { ITRoomFurniture } from "./furniture/itFurniture";
import { MarketingRoomFurniture } from "./furniture/marketingFurniture";

interface RoomFurnitureProps {
  departmentId: DepartmentId;
  accentColor: string;
}

export function RoomFurniture({ departmentId, accentColor }: RoomFurnitureProps) {
  switch (departmentId) {
    case "content":
      return <ContentRoomFurniture accentColor={accentColor} />;
    case "marketing":
      return <MarketingRoomFurniture accentColor={accentColor} />;
    case "it":
      return <ITRoomFurniture accentColor={accentColor} />;
    case "executive":
      return <ExecutiveRoomFurniture accentColor={accentColor} />;
  }
}
