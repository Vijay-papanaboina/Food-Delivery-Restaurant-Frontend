import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restaurantApi } from "@/services/restaurantApi";
import { toast } from "sonner";

export const useMyRestaurant = () => {
  return useQuery({
    queryKey: ["my-restaurant"],
    queryFn: () => restaurantApi.getMyRestaurant(),
  });
};

export const useMenuItems = () => {
  const { data: restaurantData } = useMyRestaurant();
  const restaurantId = restaurantData?.restaurant?.restaurant_id;

  return useQuery({
    queryKey: ["menu-items", restaurantId],
    queryFn: () => restaurantApi.getMenuItems(restaurantId!),
    enabled: !!restaurantId,
  });
};

export const useToggleAvailability = () => {
  const { data: restaurantData } = useMyRestaurant();
  const restaurantId = restaurantData?.restaurant?.restaurant_id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      isAvailable,
    }: {
      itemId: string;
      isAvailable: boolean;
    }) =>
      restaurantApi.updateMenuItemAvailability(
        restaurantId!,
        itemId,
        isAvailable
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success(
        variables.isAvailable
          ? "Menu item is now available"
          : "Menu item is now unavailable"
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to update availability: ${error.message}`);
    },
  });
};
