import React from "react";
import { map } from "../test-env";
export default function Map() {
  const width = map.splice[(0, 1)];
  const height = map.splice[(0, 1)];
  return (
    <div>
      {map.map((i, index) => {
        return <div>{i}</div>;
      })}
    </div>
  );
}
