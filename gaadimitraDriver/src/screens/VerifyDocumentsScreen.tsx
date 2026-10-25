import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  DriverVerifyDocumentsScreenNavigationProp,
  DriverVerifyDocumentsScreenRouteProp,
} from '../types/navigation';
import {
  BackArrowIcon,
  ArrowRightIcon,
  LicenseDocIcon,
  RcDocIcon,
  InsuranceDocIcon,
  PermitDocIcon,
  IdCardIcon,
} from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMyDocuments } from '../store/slices/documentSlice';
import Svg, { Circle, Path } from 'react-native-svg';

interface DocItem {
  id: 'dl' | 'rc' | 'insurance' | 'permit' | 'id_proof';
  title: string;
  subtitle: string;
  defaultSubtitle: string;
  isRequired: boolean;
  icon: (color: string) => React.ReactNode;
  imageUri: string | null;
  docNumber?: string;
  extraInfo?: string;
  isVerified?: boolean;
}

export const VerifyDocumentsScreen: React.FC = () => {
  const navigation = useNavigation<DriverVerifyDocumentsScreenNavigationProp>();
  const route = useRoute<DriverVerifyDocumentsScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const { driverData, selectedService, selectedVehicle, vehicleDetails, updatedDoc } = route.params || {};

  const dispatch = useAppDispatch();
  const { documents, isLoading: isFetchingDocs } = useAppSelector((state) => state.document);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [docs, setDocs] = useState<DocItem[]>([
    {
      id: 'dl',
      title: 'Driving Licence',
      subtitle: 'Front and back photo of valid DL',
      defaultSubtitle: 'Front and back photo of valid DL',
      isRequired: true,
      icon: (color) => <LicenseDocIcon size={20} color={color} />,
      imageUri: null,
      docNumber: '',
    },
    {
      id: 'rc',
      title: 'Registration Certificate (RC)',
      subtitle: 'Vehicle registration certificate',
      defaultSubtitle: 'Vehicle registration certificate',
      isRequired: true,
      icon: (color) => <RcDocIcon size={20} color={color} />,
      imageUri: null,
      docNumber: '',
    },
    {
      id: 'insurance',
      title: 'Vehicle Insurance',
      subtitle: 'Current active insurance certificate',
      defaultSubtitle: 'Current active insurance certificate',
      isRequired: true,
      icon: (color) => <InsuranceDocIcon size={20} color={color} />,
      imageUri: null,
      docNumber: '',
    },
    {
      id: 'permit',
      title: 'Commercial Permit / Fitness',
      subtitle: 'State permit or vehicle fitness document',
      defaultSubtitle: 'State permit or vehicle fitness document',
      isRequired: false,
      icon: (color) => <PermitDocIcon size={20} color={color} />,
      imageUri: null,
      docNumber: '',
    },
    {
      id: 'id_proof',
      title: 'Aadhaar Card',
      subtitle: 'Front and back photo of Aadhaar Card',
      defaultSubtitle: 'Front and back photo of Aadhaar Card',
      isRequired: true,
      icon: (color) => <IdCardIcon size={20} color={color} />,
      imageUri: null,
      docNumber: '',
    },
  ]);

  const loadDocs = async () => {
    await dispatch(fetchMyDocuments());
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchMyDocuments());
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadDocs();
  }, [dispatch]);

  // Sync docs with backend documents state
  useEffect(() => {
    if (documents) {
      setDocs((prev) =>
        prev.map((d) => {
          if (d.id === 'dl' && documents.drivingLicense) {
            const dl = documents.drivingLicense;
            const hasData = dl.dlNo || dl.frontPhoto || dl.backPhoto;
            return {
              ...d,
              docNumber: dl.dlNo || d.docNumber,
              imageUri: dl.frontPhoto || dl.backPhoto || d.imageUri,
              extraInfo: dl.dlType || d.extraInfo,
              isVerified: dl.isVerified,
              subtitle: dl.dlNo ? `${dl.dlNo}${dl.dlType ? ` • ${dl.dlType}` : ''}` : d.defaultSubtitle,
            };
          }
          if (d.id === 'rc' && documents.rc) {
            const rc = documents.rc;
            return {
              ...d,
              docNumber: rc.rcNo || d.docNumber,
              imageUri: rc.frontPhoto || rc.backPhoto || d.imageUri,
              isVerified: rc.isVerified,
              subtitle: rc.rcNo ? `RC: ${rc.rcNo}` : d.defaultSubtitle,
            };
          }
          if (d.id === 'insurance' && documents.insurance) {
            const ins = documents.insurance;
            return {
              ...d,
              docNumber: ins.insuranceNo || d.docNumber,
              imageUri: ins.photo || d.imageUri,
              isVerified: ins.isVerified,
              subtitle: ins.insuranceNo ? `Policy: ${ins.insuranceNo}` : d.defaultSubtitle,
            };
          }
          if (d.id === 'permit' && documents.permit) {
            const p = documents.permit;
            return {
              ...d,
              docNumber: p.permitNo || d.docNumber,
              extraInfo: p.type || d.extraInfo,
              imageUri: p.photo || d.imageUri,
              isVerified: p.isVerified,
              subtitle: p.permitNo ? `${p.permitNo}${p.type ? ` • ${p.type}` : ''}` : d.defaultSubtitle,
            };
          }
          if (d.id === 'id_proof' && documents.aadharCard) {
            const aadhar = documents.aadharCard;
            return {
              ...d,
              docNumber: aadhar.cardNo || d.docNumber,
              imageUri: aadhar.frontPhoto || aadhar.backPhoto || d.imageUri,
              isVerified: aadhar.isVerified,
              subtitle: aadhar.cardNo ? `Aadhaar: ${aadhar.cardNo}` : d.defaultSubtitle,
            };
          }
          return d;
        })
      );
    }
  }, [documents]);

  useEffect(() => {
    if (updatedDoc) {
      const { id, docNumber, extraInfo, frontImageUri, documentImageUri } = updatedDoc;
      setDocs((prev) =>
        prev.map((d) => {
          if (d.id === id) {
            const photo = frontImageUri || documentImageUri || d.imageUri;
            let displaySub = d.defaultSubtitle;
            if (docNumber) {
              displaySub = `${docNumber}${extraInfo ? ` • ${extraInfo}` : ''}`;
            }
            return {
              ...d,
              docNumber: docNumber || d.docNumber,
              extraInfo: extraInfo || d.extraInfo,
              imageUri: photo,
              subtitle: displaySub,
            };
          }
          return d;
        })
      );
    }
  }, [updatedDoc]);

  const uploadedCount = docs.filter((d) => d.imageUri !== null || !!d.docNumber).length;
  const totalCount = docs.length;

  const handleDocPress = (doc: DocItem) => {
    switch (doc.id) {
      case 'dl':
        navigation.navigate('UploadDrivingLicence', {
          initialData: {
            docNumber: doc.docNumber,
            dlType: doc.extraInfo,
            frontImageUri: doc.imageUri,
          },
        });
        break;
      case 'rc':
        navigation.navigate('UploadRc', {
          initialData: {
            docNumber: doc.docNumber,
            frontImageUri: doc.imageUri,
          },
        });
        break;
      case 'insurance':
        navigation.navigate('UploadInsurance', {
          initialData: {
            policyNumber: doc.docNumber,
            documentImageUri: doc.imageUri,
          },
        });
        break;
      case 'permit':
        navigation.navigate('UploadPermit', {
          initialData: {
            permitNumber: doc.docNumber,
            permitType: doc.extraInfo,
            documentImageUri: doc.imageUri,
          },
        });
        break;
      case 'id_proof':
        navigation.navigate('UploadIdProof', {
          initialData: {
            cardNo: doc.docNumber,
            frontImageUri: doc.imageUri,
          },
        });
        break;
    }
  };

  const handleSubmit = () => {
    navigation.navigate('DriverSubscription', {
      driverData,
      selectedService,
      selectedVehicle,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Clean Top Navigation Bar */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderLight,
        }}
        className="flex-row items-center justify-between px-4 py-3 border-b"
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-base font-bold">
          Verify Documents
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View className="px-5 pt-4 pb-6 flex-1 justify-between">
          <View>
            {/* Header Description */}
            <View className="mb-5">
              <Text style={{ color: colors.textMuted }} className="text-xs leading-relaxed font-normal">
                Tap each document to enter details and upload photos for account verification.
              </Text>
              <View className="flex-row items-center mt-1">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold">
                  {uploadedCount} of {totalCount} documents completed
                </Text>
                {isFetchingDocs && !isRefreshing && (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
                )}
              </View>
            </View>

            {/* Document List */}
            <View className="space-y-3">
              {docs.map((doc) => {
                const isCompleted = !!doc.docNumber || !!doc.imageUri;

                return (
                  <TouchableOpacity
                    key={doc.id}
                    activeOpacity={0.7}
                    onPress={() => handleDocPress(doc)}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                    className="border rounded-xl p-4 flex-row items-center justify-between mb-3 shadow-xs"
                  >
                    <View className="flex-row items-center flex-1 mr-3">
                      {/* Document Icon Box */}
                      <View
                        style={{
                          backgroundColor: colors.surfaceSecondary,
                          borderColor: colors.border,
                        }}
                        className="w-10 h-10 rounded-lg items-center justify-center mr-4 border"
                      >
                        {doc.icon(colors.text)}
                      </View>

                      {/* Details */}
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text style={{ color: colors.text }} className="text-sm font-semibold">
                            {doc.title}
                          </Text>
                          {!doc.isRequired && (
                            <Text style={{ color: colors.textMuted }} className="text-[11px] font-medium ml-2">
                              (Optional)
                            </Text>
                          )}
                        </View>
                        <Text style={{ color: colors.textMuted }} className="text-xs mt-1" numberOfLines={1}>
                          {doc.subtitle}
                        </Text>
                      </View>
                    </View>

                    {/* Status / Action Indicator */}
                    {isCompleted ? (
                      <View className="flex-row items-center bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md">
                        <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" className="mr-1">
                          <Circle cx="12" cy="12" r="10" fill="#10B981" />
                          <Path d="M8 12L11 15L16 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                        </Svg>
                        <Text className="text-xs font-semibold text-emerald-600">
                          Completed
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={{
                          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                          borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE',
                        }}
                        className="flex-row items-center border px-3 py-1 rounded-md"
                      >
                        <Text style={{ color: colors.primary }} className="text-xs font-semibold">
                          Fill Details
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Clean Info Note */}
            <View
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              }}
              className="mt-3 p-4 border rounded-xl flex-row items-start"
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" className="mr-3 mt-1">
                <Circle cx="12" cy="12" r="10" stroke={colors.textMuted} strokeWidth="1.8" />
                <Path d="M12 8V12M12 16H12.01" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" />
              </Svg>
              <Text style={{ color: colors.textSecondary }} className="text-xs flex-1 leading-relaxed">
                Ensure document number and details match exactly with your original government documents.
              </Text>
            </View>
          </View>

          {/* Submit Action Button */}
          <View className="mt-8">
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSubmit}
              style={{ backgroundColor: colors.primary }}
              className="w-full py-4 px-6 rounded-xl flex-row items-center justify-center shadow-md"
            >
              <Text className="text-white font-bold text-base mr-2">
                Submit for Verification
              </Text>
              <ArrowRightIcon size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View className="flex-row items-center justify-center mt-3">
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" className="mr-2">
                <Path
                  d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                  stroke={colors.textMuted}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={{ color: colors.textMuted }} className="text-[11px] font-normal">
                Your data is encrypted and securely stored
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const DriverVerifyDocumentsScreen = VerifyDocumentsScreen;
export default VerifyDocumentsScreen;
