package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private double totalRevenue;
    private long totalOrders;
    private long totalProducts;
    private long totalUsers;
    private double averageOrderValue;
    private List<OrderStatusMetricDTO> orderStatusBreakdown;
    private List<MonthlyMetricDTO> monthlyRevenue;
    private List<MonthlyMetricDTO> monthlyOrders;
    private List<MonthlyMetricDTO> monthlyNewUsers;
    private List<TopProductDTO> topProducts;
}
