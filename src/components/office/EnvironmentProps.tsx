"use client";

import type { EnvironmentId } from "@/lib/environments";
import { IslandEnvironment } from "./environments/island";
import { SpaceEnvironment } from "./environments/space";
import { ZooEnvironment } from "./environments/zoo";
import { ForestEnvironment } from "./environments/forest";
import { SnowEnvironment } from "./environments/snow";
import { DesertEnvironment } from "./environments/desert";
import { OceanEnvironment } from "./environments/ocean";

/**
 * Ngoại cảnh Dashboard — chọn 1 trong 7 cảnh theo `environmentId`
 * (xoay tự động mỗi ngày, xem `useEnvironmentId`).
 * Văn phòng công ty không đổi theo cảnh.
 */
export function EnvironmentProps({
  environmentId,
}: {
  environmentId: EnvironmentId;
}) {
  switch (environmentId) {
    case "space":
      return <SpaceEnvironment />;
    case "zoo":
      return <ZooEnvironment />;
    case "forest":
      return <ForestEnvironment />;
    case "snow":
      return <SnowEnvironment />;
    case "desert":
      return <DesertEnvironment />;
    case "ocean":
      return <OceanEnvironment />;
    case "island":
    default:
      return <IslandEnvironment />;
  }
}
