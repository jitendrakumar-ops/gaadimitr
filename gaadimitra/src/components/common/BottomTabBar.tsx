import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import {
  RideTabIcon,
  MyRidesTabIcon,
  ContactedTabIcon,
  ProfileTabIcon,
} from '../../assets/icons/Icons';

export type TabType = 'ride' | 'myRides' | 'contacted' | 'profile';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange?: (tab: TabType) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleTabPress = (tabKey: TabType) => {
    if (onTabChange) {
      onTabChange(tabKey);
      return;
    }

    // Default global navigation
    if (tabKey === activeTab) return;

    switch (tabKey) {
      case 'ride':
        navigation.navigate('HomeDashboard', {});
        break;
      case 'myRides':
        navigation.navigate('MyRides', {});
        break;
      case 'contacted':
        navigation.navigate('ContactedDrivers');
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
    }
  };

  const tabs: { key: TabType; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    {
      key: 'ride',
      label: 'Ride',
      icon: (active: boolean) => (
        <RideTabIcon size={22} color={active ? '#2563EB' : '#94A3B8'} />
      ),
    },
    {
      key: 'myRides',
      label: 'My Rides',
      icon: (active: boolean) => (
        <MyRidesTabIcon size={22} color={active ? '#2563EB' : '#94A3B8'} />
      ),
    },
    {
      key: 'contacted',
      label: 'Contacted',
      icon: (active: boolean) => (
        <ContactedTabIcon size={22} color={active ? '#2563EB' : '#94A3B8'} />
      ),
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: (active: boolean) => (
        <ProfileTabIcon size={22} color={active ? '#2563EB' : '#94A3B8'} />
      ),
    },
  ];

  return (
    <View className="flex-row items-center justify-around bg-white border-t border-slate-200 py-2 px-3">
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => handleTabPress(tab.key)}
            android_ripple={{ color: 'transparent', foreground: false }}
            className="items-center justify-center flex-1 py-1"
          >
            {tab.icon(isActive)}
            <Text
              className={`text-[11px] mt-1 font-semibold ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
