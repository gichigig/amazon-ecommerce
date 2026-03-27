package com.ecommerce.service;

import com.ecommerce.dto.AnalyticsResponse;
import com.ecommerce.dto.MonthlyMetricDTO;
import com.ecommerce.dto.OrderStatusMetricDTO;
import com.ecommerce.dto.TopProductDTO;
import com.ecommerce.model.Order;
import com.ecommerce.model.OrderItem;
import com.ecommerce.model.OrderStatus;
import com.ecommerce.model.User;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final int DEFAULT_MONTHS = 12;
    private static final int MAX_MONTHS = 24;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(int requestedMonths) {
        int months = requestedMonths > 0 ? Math.min(requestedMonths, MAX_MONTHS) : DEFAULT_MONTHS;
        YearMonth currentMonth = YearMonth.now();
        YearMonth startMonth = currentMonth.minusMonths(months - 1L);

        List<Order> orders = orderRepository.findAll();
        List<User> users = userRepository.findAll();

        long totalOrders = orders.size();
        long totalProducts = productRepository.count();
        long totalUsers = users.size();

        Map<OrderStatus, Long> statusCounts = orders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, () -> new EnumMap<>(OrderStatus.class), Collectors.counting()));

        Map<YearMonth, BigDecimal> revenueByMonth = new HashMap<>();
        Map<YearMonth, Long> ordersByMonth = new HashMap<>();
        Map<YearMonth, Long> newUsersByMonth = new HashMap<>();
        Map<UUID, ProductStats> productStats = new HashMap<>();

        BigDecimal totalRevenueAmount = BigDecimal.ZERO;

        for (Order order : orders) {
            LocalDateTime createdAt = order.getCreatedAt();
            if (createdAt != null) {
                YearMonth orderMonth = YearMonth.from(createdAt);
                if (!orderMonth.isBefore(startMonth)) {
                    ordersByMonth.merge(orderMonth, 1L, Long::sum);
                }

                if (order.getStatus() == OrderStatus.PAID) {
                    BigDecimal orderTotal = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
                    if (!orderMonth.isBefore(startMonth)) {
                        revenueByMonth.merge(orderMonth, orderTotal, BigDecimal::add);
                    }
                    totalRevenueAmount = totalRevenueAmount.add(orderTotal);
                }
            }

            if (order.getStatus() == OrderStatus.PAID) {
                for (OrderItem item : order.getOrderItems()) {
                    if (item == null || item.getProduct() == null) {
                        continue;
                    }
                    UUID productId = item.getProduct().getId();
                    ProductStats stats = productStats.computeIfAbsent(productId, id -> new ProductStats(
                            item.getProduct().getName(),
                            item.getProduct().getImageUrl(),
                            0L,
                            BigDecimal.ZERO
                    ));
                    int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                    BigDecimal lineRevenue = item.getPrice() != null
                            ? item.getPrice().multiply(BigDecimal.valueOf(quantity))
                            : BigDecimal.ZERO;
                    stats.unitsSold += quantity;
                    stats.revenue = stats.revenue.add(lineRevenue);
                }
            }
        }

        for (User user : users) {
            LocalDateTime createdAt = user.getCreatedAt();
            if (createdAt == null) {
                continue;
            }
            YearMonth userMonth = YearMonth.from(createdAt);
            if (!userMonth.isBefore(startMonth)) {
                newUsersByMonth.merge(userMonth, 1L, Long::sum);
            }
        }

        double totalRevenue = totalRevenueAmount.setScale(2, RoundingMode.HALF_UP).doubleValue();
        long paidOrdersCount = statusCounts.getOrDefault(OrderStatus.PAID, 0L);
        double averageOrderValue = paidOrdersCount > 0
                ? totalRevenueAmount.divide(BigDecimal.valueOf(paidOrdersCount), 2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        List<OrderStatusMetricDTO> statusBreakdown = buildStatusBreakdown(statusCounts);
        List<MonthlyMetricDTO> monthlyRevenue = buildMonthlyMetrics(revenueByMonth, startMonth, months);
        List<MonthlyMetricDTO> monthlyOrders = buildMonthlyCountMetrics(ordersByMonth, startMonth, months);
        List<MonthlyMetricDTO> monthlyNewUsers = buildMonthlyCountMetrics(newUsersByMonth, startMonth, months);
        List<TopProductDTO> topProducts = buildTopProducts(productStats);

        return AnalyticsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalUsers(totalUsers)
                .averageOrderValue(averageOrderValue)
                .orderStatusBreakdown(statusBreakdown)
                .monthlyRevenue(monthlyRevenue)
                .monthlyOrders(monthlyOrders)
                .monthlyNewUsers(monthlyNewUsers)
                .topProducts(topProducts)
                .build();
    }

    private List<OrderStatusMetricDTO> buildStatusBreakdown(Map<OrderStatus, Long> statusCounts) {
        List<OrderStatusMetricDTO> breakdown = new ArrayList<>();
        for (OrderStatus status : OrderStatus.values()) {
            breakdown.add(OrderStatusMetricDTO.builder()
                    .status(status.name())
                    .count(statusCounts.getOrDefault(status, 0L))
                    .build());
        }
        return breakdown;
    }

    private List<MonthlyMetricDTO> buildMonthlyMetrics(Map<YearMonth, BigDecimal> data, YearMonth startMonth, int months) {
        List<MonthlyMetricDTO> metrics = new ArrayList<>();
        for (int i = 0; i < months; i++) {
            YearMonth month = startMonth.plusMonths(i);
            BigDecimal value = data.getOrDefault(month, BigDecimal.ZERO);
            metrics.add(MonthlyMetricDTO.builder()
                    .label(formatMonth(month))
                    .value(value.setScale(2, RoundingMode.HALF_UP).doubleValue())
                    .build());
        }
        return metrics;
    }

    private List<MonthlyMetricDTO> buildMonthlyCountMetrics(Map<YearMonth, Long> data, YearMonth startMonth, int months) {
        List<MonthlyMetricDTO> metrics = new ArrayList<>();
        for (int i = 0; i < months; i++) {
            YearMonth month = startMonth.plusMonths(i);
            long value = data.getOrDefault(month, 0L);
            metrics.add(MonthlyMetricDTO.builder()
                    .label(formatMonth(month))
                    .value((double) value)
                    .build());
        }
        return metrics;
    }

    private List<TopProductDTO> buildTopProducts(Map<UUID, ProductStats> productStats) {
        return productStats.entrySet().stream()
                .filter(entry -> entry.getValue().unitsSold > 0)
                .sorted((a, b) -> b.getValue().revenue.compareTo(a.getValue().revenue))
                .limit(5)
                .map(entry -> TopProductDTO.builder()
                        .productId(entry.getKey())
                        .productName(entry.getValue().name)
                        .imageUrl(entry.getValue().imageUrl)
                        .unitsSold(entry.getValue().unitsSold)
                        .revenue(entry.getValue().revenue.setScale(2, RoundingMode.HALF_UP).doubleValue())
                        .build())
                .collect(Collectors.toList());
    }

    private String formatMonth(YearMonth month) {
        return month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + month.getYear();
    }

    private static class ProductStats {
        private final String name;
        private final String imageUrl;
        private long unitsSold;
        private BigDecimal revenue;

        private ProductStats(String name, String imageUrl, long unitsSold, BigDecimal revenue) {
            this.name = name;
            this.imageUrl = imageUrl;
            this.unitsSold = unitsSold;
            this.revenue = revenue;
        }
    }
}
