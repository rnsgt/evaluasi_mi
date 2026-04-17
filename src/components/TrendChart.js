import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import statsService from '../services/statsService';

const TrendChart = ({ colors, spacing, typography, borderRadius }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [selectedDays, setSelectedDays] = useState(7);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadChartData();
  }, [selectedDays]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const data = await statsService.getDailyTrend(selectedDays);
      setChartData(data);
    } catch (error) {
      console.error('Load chart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const DayButton = ({ days, label }) => (
    <TouchableOpacity
      style={[
        styles.dayButton,
        {
          backgroundColor: selectedDays === days ? colors.primary : colors.surface,
          borderColor: colors.border,
        }
      ]}
      onPress={() => setSelectedDays(days)}
    >
      <Text style={[
        styles.dayButtonText,
        { color: selectedDays === days ? 'white' : colors.textPrimary }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading || !chartData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Memuat grafik tren...
        </Text>
      </View>
    );
  }

  const hasData = chartData.labels && chartData.labels.length > 0;

  if (!hasData) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons
          name="chart-timeline-variant"
          size={48}
          color={colors.textSecondary}
        />
        <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
          Belum ada data evaluasi
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
          Data akan muncul setelah ada evaluasi yang disubmit
        </Text>
      </View>
    );
  }

  // Prepare chart data - ambil setiap N data point untuk menghindari crowding
  const pointsToShow = 7;
  const step = Math.ceil(chartData.labels.length / pointsToShow);
  const filteredLabels = chartData.labels.filter((_, i) => i % step === 0);
  const filteredDatasets = chartData.datasets.map(dataset => ({
    ...dataset,
    data: dataset.data.filter((_, i) => i % step === 0),
  }));

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <DayButton days={7} label="7 Hari" />
        <DayButton days={14} label="14 Hari" />
        <DayButton days={30} label="30 Hari" />
        <DayButton days={90} label="90 Hari" />
      </View>

      {/* Chart */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chartScroll}
      >
        <View style={styles.chartWrapper}>
          <LineChart
            data={{
              labels: filteredLabels,
              datasets: filteredDatasets,
            }}
            width={Math.max(screenWidth - 40, chartData.labels.length * 60)}
            height={300}
            yAxisLabel=""
            yAxisSuffix=" "
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.3})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.7})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: colors.primary,
              },
              propsForLabels: {
                fontSize: 11,
              },
              propsForBackgroundLines: {
                strokeDasharray: '0',
              },
            }}
            bezier
            style={{
              marginVertical: spacing.base,
              borderRadius: borderRadius.md,
            }}
          />
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
          <Text style={[styles.legendText, { color: colors.textPrimary }]}>
            Total
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#228BE6' }]} />
          <Text style={[styles.legendText, { color: colors.textPrimary }]}>
            Dosen
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#16A34A' }]} />
          <Text style={[styles.legendText, { color: colors.textPrimary }]}>
            Fasilitas
          </Text>
        </View>
      </View>

      {/* Summary Statistics */}
      {chartData.rawData && chartData.rawData.length > 0 && (
        <View style={[styles.summaryContainer, { backgroundColor: colors.surface }]}>
          <SummaryCard
            icon="calendar-today"
            label="Hari Ini"
            value={chartData.rawData[chartData.rawData.length - 1].totalEvaluasi}
            color={colors.primary}
          />
          <SummaryCard
            icon="chart-line"
            label="Total"
            value={chartData.rawData.reduce((sum, d) => sum + d.totalEvaluasi, 0)}
            color="#228BE6"
          />
          <SummaryCard
            icon="trending-up"
            label="Rata-rata/Hari"
            value={Math.round(
              chartData.rawData.reduce((sum, d) => sum + d.totalEvaluasi, 0) /
              chartData.rawData.length
            )}
            color="#16A34A"
          />
        </View>
      )}
    </View>
  );
};

const SummaryCard = ({ icon, label, value, color }) => (
  <View style={styles.summaryCard}>
    <MaterialCommunityIcons name={icon} size={24} color={color} />
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={[styles.summaryValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartScroll: {
    marginVertical: 8,
  },
  chartWrapper: {
    paddingHorizontal: 12,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 12,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 13,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 12,
  },
  summaryCard: {
    alignItems: 'center',
    gap: 6,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TrendChart;
