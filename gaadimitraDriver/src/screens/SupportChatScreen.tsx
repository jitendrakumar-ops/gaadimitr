import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { BackArrowIcon } from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import Svg, { Path } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchSupportTickets,
  fetchSupportTicketById,
  createSupportTicket,
  sendSupportMessage,
  appendOptimisticMessage,
} from '../store/slices/supportSlice';
import { SupportMessage } from '../types/support';

export const SupportChatScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const scrollViewRef = useRef<ScrollView>(null);

  const authUser = useAppSelector((state) => state.auth.user);
  const { driverProfile } = useAppSelector((state) => state.driver);
  const { activeTicket, isLoading, isSending } = useAppSelector((state) => state.support);

  const driverName = driverProfile?.name || authUser?.name || 'Driver';

  const [inputMessage, setInputMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const quickTopics = [
    '💰 Payment / Fare Settlement',
    '🪪 Document Re-verification',
    '🚗 Driver Subscription Renewal',
    '🚨 Emergency Ride Help',
  ];

  const scrollToBottom = (animated: boolean = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 100);
  };

  // 1. Track keyboard height to push footer above keyboard on Android (matching user reference)
  useEffect(() => {
    if (Platform.OS === 'ios') return;

    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 2. Fetch Support Tickets via Redux Thunk on Mount
  useEffect(() => {
    dispatch(fetchSupportTickets());
  }, [dispatch]);

  // 3. Poll for ticket updates / admin replies via Redux every 10s if activeTicket exists
  useEffect(() => {
    if (!activeTicket?.id) return;

    const timer = setInterval(() => {
      dispatch(fetchSupportTicketById(activeTicket.id));
    }, 10000);

    return () => clearInterval(timer);
  }, [activeTicket?.id, dispatch]);

  // 4. Scroll to bottom when messages count changes
  const messagesCount = activeTicket?.messages?.length || 0;
  useEffect(() => {
    if (messagesCount > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [messagesCount]);

  // 5. Send message or create ticket via Redux Thunk
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isSending) return;

    setInputMessage('');

    if (activeTicket?.id) {
      // Optimistically append message to Redux store
      dispatch(
        appendOptimisticMessage({
          content: textToSend,
          senderRole: 'driver',
        })
      );
      scrollToBottom(true);

      // Dispatch send message thunk
      dispatch(
        sendSupportMessage({
          ticketId: activeTicket.id,
          message: textToSend,
        })
      );
    } else {
      // No active ticket: dispatch create ticket thunk
      const subject = textToSend.length > 50 ? `${textToSend.slice(0, 47)}...` : textToSend;
      dispatch(
        createSupportTicket({
          subject,
          message: textToSend,
          category: 'driver',
          priority: 'medium',
        })
      );
    }
    scrollToBottom(true);
  };

  const renderMessageList = () => {
    const ticketMessages = activeTicket?.messages || [];

    if (ticketMessages.length === 0) {
      // Default Welcome Message
      return (
        <View className="mb-3 flex-row justify-start">
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            className="max-w-[85%] rounded-xl px-4 py-3 shadow-xs rounded-bl-none"
          >
            <Text
              style={{ color: colors.text }}
              className="text-xs leading-relaxed font-medium"
            >
              Namaste {driverName}! 🙏 Welcome to GaadiMitra 24x7 Partner Support. How can we help you today?
            </Text>
            <Text
              style={{ color: colors.textMuted }}
              className="text-[9px] mt-1 text-right"
            >
              Just now
            </Text>
          </View>
        </View>
      );
    }

    return ticketMessages.map((msg: SupportMessage, idx: number) => {
      const isDriver = msg.senderRole === 'driver' || msg.senderRole === 'user';
      const formattedTime = msg.createdAt
        ? new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Now';

      return (
        <View
          key={msg._id || msg.id || String(idx)}
          className={`mb-3 flex-row ${isDriver ? 'justify-end' : 'justify-start'}`}
        >
          <View
            style={{
              backgroundColor: isDriver ? colors.primary : colors.surface,
              borderColor: isDriver ? 'transparent' : colors.border,
              borderWidth: isDriver ? 0 : 1,
            }}
            className={`max-w-[82%] rounded-xl px-4 py-3 shadow-xs ${
              isDriver ? 'rounded-br-none' : 'rounded-bl-none'
            }`}
          >
            <Text
              style={{ color: isDriver ? '#FFFFFF' : colors.text }}
              className="text-xs leading-relaxed font-medium"
            >
              {msg.content}
            </Text>
            <Text
              style={{ color: isDriver ? 'rgba(255,255,255,0.7)' : colors.textMuted }}
              className="text-[9px] mt-1 text-right"
            >
              {formattedTime} {isDriver && '✓✓'}
            </Text>
          </View>
        </View>
      );
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingBottom: Platform.OS === 'android' ? keyboardHeight : 0,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        enabled={Platform.OS === 'ios'}
        behavior="padding"
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderLight,
          }}
          className="px-4 py-3 border-b flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              className="w-10 h-10 items-center justify-center -ml-2 rounded-full mr-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BackArrowIcon size={22} color={colors.text} />
            </TouchableOpacity>

            <View className="relative mr-2.5">
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
                }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <Text style={{ color: colors.primary }} className="text-sm font-black">GM</Text>
              </View>
              <View
                style={{ borderColor: colors.surface }}
                className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2"
              />
            </View>

            <View>
              <Text style={{ color: colors.text }} className="text-sm font-black">
                GaadiMitra Support
              </Text>
              <Text className="text-[10px] font-semibold text-emerald-600">
                {activeTicket?.id
                  ? `Ticket #${activeTicket.id.slice(-6).toUpperCase()} • Active`
                  : '● Online • Agent Rohit'}
              </Text>
            </View>
          </View>

          {/* Call Helpline Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Linking.openURL('tel:18001234567').catch(() => {
                Alert.alert('Helpline', 'Call 1800-123-4567');
              })
            }
            className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center justify-center"
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                stroke="#10B981"
                strokeWidth="2"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ color: colors.textMuted }} className="text-xs font-medium mt-2">
              Loading support chat...
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollToBottom(true)}
            onLayout={() => scrollToBottom(false)}
          >
            {/* Support Info Badge */}
            <View className="items-center my-2">
              <View
                style={{ backgroundColor: colors.surfaceSecondary }}
                className="px-3 py-1 rounded-full"
              >
                <Text style={{ color: colors.textMuted }} className="text-[10px] font-bold">
                  End-to-End Encrypted Support Chat
                </Text>
              </View>
            </View>

            {/* Render Redux Ticket Messages */}
            {renderMessageList()}
          </ScrollView>
        )}

        {/* Quick Topic Chips */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopColor: colors.borderLight,
          }}
          className="border-t py-2 px-3"
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickTopics.map((topic, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => handleSendMessage(topic)}
                disabled={isSending}
                style={{
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                }}
                className="border px-3 py-1.5 rounded-full mr-2"
              >
                <Text style={{ color: colors.textSecondary }} className="text-[11px] font-bold">
                  {topic}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          }}
          className="px-4 py-3 border-t flex-row items-center"
        >
          <TextInput
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type your message here..."
            placeholderTextColor={colors.textMuted}
            editable={!isSending}
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text,
            }}
            className="flex-1 border rounded-full px-4 py-2.5 text-xs mr-2"
            onSubmitEditing={() => handleSendMessage()}
            onFocus={() => scrollToBottom(true)}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isSending}
            style={{
              backgroundColor: inputMessage.trim() && !isSending ? colors.primary : colors.border,
            }}
            className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export const DriverSupportChatScreen = SupportChatScreen;
export default SupportChatScreen;
