import React from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { MyRidesView } from '../../components/rides/MyRidesView';
import { useTheme } from '../../theme';

export const MyRidesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: colors.background }}
      className="flex-1"
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Header */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        }}
        className="px-5 py-3.5 flex-row items-center justify-between border-b"
      >
        <View>
          <Text
            style={{ color: colors.text }}
            className="text-xl font-black tracking-tight"
          >
            My Rides
          </Text>
          <Text
            style={{ color: colors.textSecondary }}
            className="text-xs font-semibold mt-0.5"
          >
            Active, Upcoming & Past Trips
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <MyRidesView
          onBookRidePress={() => navigation.navigate('HomeDashboard', {})}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
