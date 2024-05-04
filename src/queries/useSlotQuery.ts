import { Connection } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useSlotQuery(connection: Connection) {
  return useQuery({
    queryKey: ["slot"],
    queryFn: async () => await connection.getSlot(),
  });
}