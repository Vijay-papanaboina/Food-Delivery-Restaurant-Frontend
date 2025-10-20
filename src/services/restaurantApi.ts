import { config } from "@/config/env";
import { ApiService } from "./baseApi";
import type { Restaurant, MenuItem } from "@/types";

export class RestaurantApi extends ApiService {
  constructor() {
    super(config.restaurantApiUrl);
  }

  getRestaurantProfile = async (restaurantId: string): Promise<Restaurant> => {
    return this.get(`/api/restaurants/${restaurantId}`);
  };

  getMyRestaurant = async (): Promise<{ restaurant: Restaurant }> => {
    return this.get("/api/restaurants/my-restaurant");
  };

  updateRestaurantStatus = async (
    restaurantId: string,
    isOpen: boolean
  ): Promise<{ message: string; restaurantId: string; isOpen: boolean }> => {
    return this.put(`/api/restaurants/${restaurantId}/status`, {
      isOpen: isOpen,
    });
  };

  getMenuItems = async (
    restaurantId: string
  ): Promise<{ menu: MenuItem[] }> => {
    return this.get(`/api/restaurants/${restaurantId}/menu`);
  };

  updateMenuItemAvailability = async (
    restaurantId: string,
    itemId: string,
    isAvailable: boolean
  ): Promise<{ message: string; itemId: string; isAvailable: boolean }> => {
    return this.put(
      `/api/restaurants/${restaurantId}/menu/${itemId}/availability`,
      {
        isAvailable: isAvailable,
      }
    );
  };
}

export const restaurantApi = new RestaurantApi();
