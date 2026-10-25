import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { EarningsScreen } from '../screens/EarningsScreen';
import { RidesScreen } from '../screens/RidesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useTheme } from '../theme';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export type MainTabParamList = {
  Home: undefined;
  Earnings: undefined;
  Rides: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom Tab Bar for crisp layout and active states with dark/light theme support
const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.tabBar,
        borderTopWidth: 1,
        borderTopColor: colors.tabBarBorder,
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'ios' ? 24 : 10,
        elevation: 8,
        shadowColor: isDark ? '#000' : '#64748B',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: isDark ? 0.3 : 0.06,
        shadowRadius: 6,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const handleTabPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        const activeColor = colors.primary;
        const inactiveColor = colors.tabInactive;
        const activeBg = isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF';

        let label = 'Home';
        let renderIcon = (active: boolean) => (
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 9.5L12 2.5L21 9.5V20.5C21 21.05 20.55 21.5 20 21.5H4C3.45 21.5 3 21.05 3 20.5V9.5Z"
              stroke={active ? activeColor : inactiveColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={active ? activeBg : 'none'}
            />
            <Path
              d="M9 21.5V12.5H15V21.5"
              stroke={active ? activeColor : inactiveColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );

        if (route.name === 'Earnings') {
          label = 'Earnings';
          renderIcon = (active: boolean) => (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Rect
                x="2"
                y="5"
                width="20"
                height="14"
                rx="2.5"
                stroke={active ? activeColor : inactiveColor}
                strokeWidth="2"
                fill={active ? activeBg : 'none'}
              />
              <Path
                d="M16 12H19"
                stroke={active ? activeColor : inactiveColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <Circle
                cx="8"
                cy="12"
                r="1.8"
                stroke={active ? activeColor : inactiveColor}
                strokeWidth="1.8"
              />
            </Svg>
          );
        } else if (route.name === 'Rides') {
          label = 'Rides';
          renderIcon = (active: boolean) => (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 17H19M5 17C3.5 17 2 15.5 2 14V11L4 6C4.5 4.5 6 4 7 4H17C18 4 19.5 4.5 20 6L22 11V14C22 15.5 20.5 17 19 17M5 17C5 18.5 6 20 7.5 20C9 20 10 18.5 10 17M19 17C19 18.5 18 20 16.5 20C15 20 14 18.5 14 17"
                stroke={active ? activeColor : inactiveColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </Svg>
          );
        } else if (route.name === 'Profile') {
          label = 'Profile';
          renderIcon = (active: boolean) => (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Circle
                cx="12"
                cy="7"
                r="4"
                stroke={active ? activeColor : inactiveColor}
                strokeWidth="2"
              />
              <Path
                d="M4 21C4 17.5 7.5 15.5 12 15.5C16.5 15.5 20 17.5 20 21"
                stroke={active ? activeColor : inactiveColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </Svg>
          );
        }

        return (
          <TouchableOpacity
            key={route.name}
            onPress={handleTabPress}
            activeOpacity={0.7}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 2,
            }}
          >
            {renderIcon(isFocused)}
            <Text
              style={{
                fontSize: 11,
                fontWeight: isFocused ? '700' : '500',
                color: isFocused ? activeColor : inactiveColor,
                marginTop: 3,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Rides" component={RidesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
