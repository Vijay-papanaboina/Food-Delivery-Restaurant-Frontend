import { config } from "@/config/env";
import { apiService } from "./baseApi";
import { logger } from "@/lib/logger";

export interface Order {
  id: string;
  orderNumber: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "picked_up"
    | "delivered"
    | "cancelled";
  items: OrderItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantStatus {
  isOpen: boolean;
  lastChanged: string;
  openHours: {
    start: string;
    end: string;
  };
}

class RestaurantApi {
  async getKitchenOrders(restaurantId: string): Promise<Order[]> {
    try {
      const response = await apiService.get<Order[]>(
        `${config.restaurantApiUrl}/api/kitchen/orders?restaurantId=${restaurantId}`
      );
      return response.data;
    } catch (error: any) {
      logger.error(
        "Failed to fetch kitchen orders",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async markOrderReady(orderId: string): Promise<void> {
    try {
      await apiService.post(
        `${config.restaurantApiUrl}/api/kitchen/orders/${orderId}/ready`
      );
      logger.info("Order marked as ready", { orderId });
    } catch (error: any) {
      logger.error(
        "Failed to mark order as ready",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    try {
      const response = await apiService.get<MenuItem[]>(
        `${config.restaurantApiUrl}/api/restaurants/${restaurantId}/menu`
      );
      return response.data;
    } catch (error: any) {
      logger.error(
        "Failed to fetch menu items",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async createMenuItem(
    restaurantId: string,
    menuItem: Omit<MenuItem, "id" | "createdAt" | "updatedAt">
  ): Promise<MenuItem> {
    try {
      const response = await apiService.post<MenuItem>(
        `${config.restaurantApiUrl}/api/restaurants/${restaurantId}/menu`,
        menuItem
      );
      logger.info("Menu item created", { menuItemId: response.data.id });
      return response.data;
    } catch (error: any) {
      logger.error(
        "Failed to create menu item",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async updateMenuItem(
    restaurantId: string,
    itemId: string,
    menuItem: Partial<MenuItem>
  ): Promise<MenuItem> {
    try {
      const response = await apiService.put<MenuItem>(
        `${config.restaurantApiUrl}/api/restaurants/${restaurantId}/menu/${itemId}`,
        menuItem
      );
      logger.info("Menu item updated", { menuItemId: itemId });
      return response.data;
    } catch (error: any) {
      logger.error(
        "Failed to update menu item",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async deleteMenuItem(restaurantId: string, itemId: string): Promise<void> {
    try {
      await apiService.delete(
        `${config.restaurantApiUrl}/api/restaurants/${restaurantId}/menu/${itemId}`
      );
      logger.info("Menu item deleted", { menuItemId: itemId });
    } catch (error: any) {
      logger.error(
        "Failed to delete menu item",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async toggleMenuItemAvailability(
    restaurantId: string,
    itemId: string,
    isAvailable: boolean
  ): Promise<MenuItem> {
    try {
      const response = await apiService.put<MenuItem>(
        `${config.restaurantApiUrl}/api/restaurants/${restaurantId}/menu/${itemId}/availability`,
        { isAvailable }
      );
      logger.info("Menu item availability toggled", {
        menuItemId: itemId,
        isAvailable,
      });
      return response.data;
    } catch (error: any) {
      logger.error(
        "Failed to toggle menu item availability",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getRestaurantStatus(restaurantId: string): Promise<RestaurantStatus> {
    try {
      const response = await apiService.get<RestaurantStatus>(
        `${config.restaurantApiUrl}/api/restaurants/${restaurantId}/status`
      );
      return response.data;
    } catch (error: any) {
      logger.error(
        "Failed to fetch restaurant status",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async updateRestaurantStatus(
    restaurantId: string,
    isOpen: boolean
  ): Promise<RestaurantStatus> {
    try {
      const response = await apiService.put<RestaurantStatus>(
        `${config.restaurantApiUrl}/api/restaurants/${restaurantId}/status`,
        { isOpen }
      );
      logger.info("Restaurant status updated", { restaurantId, isOpen });
      return response.data;
    } catch (error: any) {
      logger.error(
        "Failed to update restaurant status",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

export const restaurantApi = new RestaurantApi();
