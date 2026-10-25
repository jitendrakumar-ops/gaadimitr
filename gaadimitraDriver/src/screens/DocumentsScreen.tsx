import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Modal,

  RefreshControl,

} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import {
  BackArrowIcon,
  LicenseDocIcon,
  RcDocIcon,
  InsuranceDocIcon,
  PermitDocIcon,
  IdCardIcon,
} from '../assets/icons/DriverIcons';
import { useTheme } from '../theme';
import Svg, { Path } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMyDocuments } from '../store/slices/documentSlice';
import { DriverDocumentsData } from '../types/document';

export interface DocumentDetail {
  id: 'dl' | 'rc' | 'insurance' | 'permit' | 'id_proof';
  category: 'driver' | 'vehicle';
  title: string;
  docNumber: string;
  docTypeLabel?: string;
  status: 'verified' | 'expiring' | 'pending';
  statusText: string;
  validity: string;
  expiryDateFormatted?: string;
  issuedDate?: string;
  frontImageUri?: string | null;
  backImageUri?: string | null;
  accentColor: string;
  extraDetails?: { label: string; value: string }[];
  uploadScreenName: keyof RootStackParamList;
}

export const DocumentsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { documents, isLoading } = useAppSelector((state) => state.document);

  const [activeTab, setActiveTab] = useState<'all' | 'driver' | 'vehicle'>('all');
  const [selectedDoc, setSelectedDoc] = useState<DocumentDetail | null>(null);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMyDocuments());
    }, [dispatch])
  );

  const docData: DriverDocumentsData | null =
    (documents as any)?.data || documents || null;

  const isValidImageUri = (uri?: string | null): uri is string => {
    if (!uri || typeof uri !== 'string') return false;
    const trimmed = uri.trim();
    return (
      trimmed.length > 0 &&
      trimmed !== 'null' &&
      trimmed !== 'undefined' &&
      (trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('file://') ||
        trimmed.startsWith('data:image') ||
        trimmed.startsWith('content://'))
    );
  };

  const dlDoc = docData?.drivingLicense || (docData as any)?.drivingLicence || (docData as any)?.dl;
  const rcDoc = docData?.rc;
  const insDoc = docData?.insurance;
  const permitDoc = docData?.permit;
  const aadharDoc = docData?.aadharCard || (docData as any)?.aadhar;

  const getDocStatus = (isVerified?: boolean, hasContent?: boolean) => {
    if (isVerified) {
      return { status: 'verified' as const, statusText: 'Verified & Active' };
    }
    if (hasContent) {
      return { status: 'pending' as const, statusText: 'Under Review' };
    }
    return { status: 'pending' as const, statusText: 'Action Required' };
  };

  const hasDl = Boolean(dlDoc?.dlNo || dlDoc?.frontPhoto || dlDoc?.backPhoto);
  const hasRc = Boolean(rcDoc?.rcNo || rcDoc?.frontPhoto || rcDoc?.backPhoto);
  const hasIns = Boolean(insDoc?.insuranceNo || insDoc?.photo || (insDoc as any)?.frontPhoto);
  const hasPermit = Boolean(permitDoc?.permitNo || permitDoc?.photo || (permitDoc as any)?.frontPhoto);
  const hasAadhar = Boolean(aadharDoc?.cardNo || aadharDoc?.frontPhoto || aadharDoc?.backPhoto);

  const dlStatus = getDocStatus(dlDoc?.isVerified, hasDl);
  const rcStatus = getDocStatus(rcDoc?.isVerified, hasRc);
  const insStatus = getDocStatus(insDoc?.isVerified, hasIns);
  const permitStatus = getDocStatus(permitDoc?.isVerified, hasPermit);
  const aadharStatus = getDocStatus(aadharDoc?.isVerified, hasAadhar);

  const dlNumber = dlDoc?.dlNo || (dlDoc as any)?.docNumber || '-';
  const dlType = dlDoc?.dlType || (dlDoc as any)?.type || '-';
  const dlFront = isValidImageUri(dlDoc?.frontPhoto) ? dlDoc!.frontPhoto : (isValidImageUri((dlDoc as any)?.photo) ? (dlDoc as any).photo : null);
  const dlBack = isValidImageUri(dlDoc?.backPhoto) ? dlDoc!.backPhoto : null;

  const rcNumber = rcDoc?.rcNo || (rcDoc as any)?.docNumber || 'Not uploaded';
  const rcFront = isValidImageUri(rcDoc?.frontPhoto) ? rcDoc!.frontPhoto : (isValidImageUri((rcDoc as any)?.photo) ? (rcDoc as any).photo : null);
  const rcBack = isValidImageUri(rcDoc?.backPhoto) ? rcDoc!.backPhoto : null;

  const insNumber = insDoc?.insuranceNo || (insDoc as any)?.policyNumber || (insDoc as any)?.docNumber || 'Not uploaded';
  const insPhoto = isValidImageUri(insDoc?.photo) ? insDoc!.photo : (isValidImageUri((insDoc as any)?.frontPhoto) ? (insDoc as any).frontPhoto : null);

  const permitNumber = permitDoc?.permitNo || (permitDoc as any)?.permitNumber || (permitDoc as any)?.docNumber || 'Not uploaded';
  const permitType = permitDoc?.type || (permitDoc as any)?.permitType || '-';
  const permitPhoto = isValidImageUri(permitDoc?.photo) ? permitDoc!.photo : (isValidImageUri((permitDoc as any)?.frontPhoto) ? (permitDoc as any).frontPhoto : null);

  const aadharNumber = aadharDoc?.cardNo || (aadharDoc as any)?.aadharNo || (aadharDoc as any)?.cardNumber || (aadharDoc as any)?.docNumber || 'Not uploaded';
  const aadharFront = isValidImageUri(aadharDoc?.frontPhoto) ? aadharDoc!.frontPhoto : (isValidImageUri((aadharDoc as any)?.photo) ? (aadharDoc as any).photo : null);
  const aadharBack = isValidImageUri(aadharDoc?.backPhoto) ? aadharDoc!.backPhoto : null;

  const documentsList: DocumentDetail[] = [
    {
      id: 'dl',
      category: 'driver',
      title: 'Driving Licence (DL)',
      docNumber: dlNumber,
      docTypeLabel: dlType,
      status: dlStatus.status,
      statusText: dlStatus.statusText,
      validity: dlDoc?.isVerified ? 'Government Verified' : (hasDl ? 'Under Verification' : 'Pending upload'),
      frontImageUri: dlFront,
      backImageUri: dlBack,
      accentColor: '#1350F2',
      extraDetails: [
        { label: 'Document Type', value: dlType },
        { label: 'Verification Status', value: dlDoc?.isVerified ? 'Verified' : (hasDl ? 'Under Review' : 'Pending') },
      ],
      uploadScreenName: 'UploadDrivingLicence',
    },
    {
      id: 'rc',
      category: 'vehicle',
      title: 'Registration Certificate (RC)',
      docNumber: rcNumber,
      docTypeLabel: 'Registration Certificate',
      status: rcStatus.status,
      statusText: rcStatus.statusText,
      validity: rcDoc?.isVerified ? 'Government Verified' : (hasRc ? 'Under Verification' : 'Pending upload'),
      frontImageUri: rcFront,
      backImageUri: rcBack,
      accentColor: '#0284C7',
      extraDetails: [
        { label: 'Vehicle RC No.', value: rcNumber },
        { label: 'Verification Status', value: rcDoc?.isVerified ? 'Verified' : (hasRc ? 'Under Review' : 'Pending') },
      ],
      uploadScreenName: 'UploadRc',
    },
    {
      id: 'insurance',
      category: 'vehicle',
      title: 'Commercial Vehicle Insurance',
      docNumber: insNumber,
      docTypeLabel: 'Commercial Vehicle Cover',
      status: insStatus.status,
      statusText: insStatus.statusText,
      validity: insDoc?.isVerified ? 'Active & Verified' : (hasIns ? 'Under Verification' : 'Pending upload'),
      frontImageUri: insPhoto,
      accentColor: '#059669',
      extraDetails: [
        { label: 'Policy / Cover No.', value: insNumber },
        { label: 'Verification Status', value: insDoc?.isVerified ? 'Verified' : (hasIns ? 'Under Review' : 'Pending') },
      ],
      uploadScreenName: 'UploadInsurance',
    },
    {
      id: 'permit',
      category: 'vehicle',
      title: 'Commercial Transport Permit',
      docNumber: permitNumber,
      docTypeLabel: permitType,
      status: permitStatus.status,
      statusText: permitStatus.statusText,
      validity: permitDoc?.isVerified ? 'Active & Verified' : (hasPermit ? 'Under Verification' : 'Pending upload'),
      frontImageUri: permitPhoto,
      accentColor: '#D97706',
      extraDetails: [
        { label: 'Permit Type', value: permitType },
        { label: 'Verification Status', value: permitDoc?.isVerified ? 'Verified' : (hasPermit ? 'Under Review' : 'Pending') },
      ],
      uploadScreenName: 'UploadPermit',
    },
    {
      id: 'id_proof',
      category: 'driver',
      title: 'Identity Proof (Aadhaar Card)',
      docNumber: aadharNumber,
      docTypeLabel: 'UIDAI Government Verified',
      status: aadharStatus.status,
      statusText: aadharStatus.statusText,
      validity: aadharDoc?.isVerified ? 'e-KYC Verified' : (hasAadhar ? 'Under Verification' : 'Pending upload'),
      frontImageUri: aadharFront,
      backImageUri: aadharBack,
      accentColor: '#4F46E5',
      extraDetails: [
        { label: 'ID Type', value: 'Aadhaar Card (UIDAI)' },
        { label: 'Verification Status', value: aadharDoc?.isVerified ? 'Verified' : (hasAadhar ? 'Under Review' : 'Pending') },
      ],
      uploadScreenName: 'UploadIdProof',
    },
  ];

  const navigateToUpload = (doc: DocumentDetail) => {
    if (doc.id === 'dl') {
      navigation.navigate('UploadDrivingLicence', {
        initialData: {
          docNumber: doc.docNumber !== 'Not uploaded' ? doc.docNumber : '',
          dlType: doc.docTypeLabel,
          frontImageUri: doc.frontImageUri,
          backImageUri: doc.backImageUri,
        },
      });
    } else if (doc.id === 'rc') {
      navigation.navigate('UploadRc', {
        initialData: {
          docNumber: doc.docNumber !== 'Not uploaded' ? doc.docNumber : '',
          frontImageUri: doc.frontImageUri,
          backImageUri: doc.backImageUri,
        },
      });
    } else if (doc.id === 'insurance') {
      navigation.navigate('UploadInsurance', {
        initialData: {
          policyNumber: doc.docNumber !== 'Not uploaded' ? doc.docNumber : '',
          documentImageUri: doc.frontImageUri,
        },
      });
    } else if (doc.id === 'permit') {
      navigation.navigate('UploadPermit', {
        initialData: {
          permitNumber: doc.docNumber !== 'Not uploaded' ? doc.docNumber : '',
          permitType: doc.docTypeLabel,
          documentImageUri: doc.frontImageUri,
        },
      });
    } else if (doc.id === 'id_proof') {
      navigation.navigate('UploadIdProof', {
        initialData: {
          cardNo: doc.docNumber !== 'Not uploaded' ? doc.docNumber : '',
          frontImageUri: doc.frontImageUri,
          backImageUri: doc.backImageUri,
        },
      });
    }
  };

  const filteredDocs = documentsList.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const verifiedCount = documentsList.filter((d) => d.status === 'verified').length;
  const totalCount = documentsList.length;
  const percentage = Math.round((verifiedCount / totalCount) * 100);

  const handleCopyDocNumber = (doc: DocumentDetail) => {
    if (doc.docNumber && doc.docNumber !== 'Not uploaded') {
      setCopiedDocId(doc.id);
      setTimeout(() => setCopiedDocId(null), 2000);
    }
  };

  const getDocIcon = (id: DocumentDetail['id']) => {
    switch (id) {
      case 'dl':
        return <LicenseDocIcon size={20} color="#1350F2" />;
      case 'rc':
        return <RcDocIcon size={20} color="#0284C7" />;
      case 'insurance':
        return <InsuranceDocIcon size={20} color="#059669" />;
      case 'permit':
        return <PermitDocIcon size={20} color="#D97706" />;
      case 'id_proof':
        return <IdCardIcon size={20} color="#4F46E5" />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* 1. App Bar Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderLight,
        }}
        className="px-4 py-3.5 border-b flex-row items-center shadow-sm"
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={22} color={colors.text} />
        </TouchableOpacity>

        <View className="items-center">
          <Text style={{ color: colors.text }} className="text-base font-black tracking-tight">
            Driver & Vehicle Documents
          </Text>
          <Text style={{ color: colors.textMuted }} className="text-[10px] font-semibold">
            Government e-KYC Compliant
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1 px-4 pt-3.5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => dispatch(fetchMyDocuments())}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Rejection Alert Banner (if status is rejected) */}
        {docData?.status === 'rejected' ? (
          <View className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 mb-4 flex-row items-start">
            <View className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 mr-2.5" />
            <View className="flex-1">
              <Text className="text-xs font-black text-rose-600">Documents Verification Rejected</Text>
              <Text className="text-[11px] text-rose-500 mt-0.5 leading-relaxed font-medium">
                {docData?.rejectionReason || 'One or more uploaded documents were rejected. Please update clear and valid photos.'}
              </Text>
            </View>
          </View>
        ) : null}

        {/* 2. Official Verification Status Trust Banner */}
        <View
          style={{ backgroundColor: colors.primary }}
          className="rounded-xl p-4 mb-4 shadow-sm overflow-hidden relative"
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 items-center justify-center mr-3">
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9 12L11 14L15 10M12 3L4 7V13C4 18 12 21 12 21C12 21 20 18 20 13V7L12 3Z"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View className="flex-1">
                <Text className="text-white font-black text-base">
                  {verifiedCount === totalCount ? '100% Verified Profile' : `${percentage}% Profile Verified`}
                </Text>
                <Text className="text-blue-100 text-[11px] font-medium mt-0.5">
                  {verifiedCount} of {totalCount} documents verified & compliant
                </Text>
              </View>
            </View>

            <View className="bg-white/20 border border-white/30 px-2.5 py-1 rounded-full flex-row items-center">
              <View className={`w-1.5 h-1.5 rounded-full ${verifiedCount === totalCount ? 'bg-white' : 'bg-amber-300'} mr-1.5`} />
              <Text className="text-[10px] font-black text-white uppercase tracking-wider">
                {verifiedCount === totalCount ? 'Active' : 'In Progress'}
              </Text>
            </View>
          </View>

          {/* Verification info row */}
          <View className="bg-white/15 rounded-xl p-3 flex-row items-center justify-between border border-white/20">
            <View className="flex-row items-center flex-1 mr-2">
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" className="mr-2">
                <Path
                  d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
              <Text className="text-white text-[11px] font-medium">
                Vahan & Sarathi Government Database Verified
              </Text>
            </View>
            <Text className="text-blue-100 text-[10px] font-bold">2025 Approved</Text>
          </View>
        </View>

        {/* 3. Segmented Filter Tabs */}
        <View
          style={{ backgroundColor: colors.surfaceSecondary }}
          className="flex-row p-1 rounded-xl mb-4"
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('all')}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: activeTab === 'all' ? colors.surface : 'transparent',
              shadowColor: activeTab === 'all' ? '#000' : 'transparent',
              shadowOpacity: activeTab === 'all' ? 0.08 : 0,
              shadowRadius: 3,
              elevation: activeTab === 'all' ? 2 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: activeTab === 'all' ? colors.text : colors.textSecondary,
              }}
            >
              All ({documentsList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('driver')}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: activeTab === 'driver' ? colors.surface : 'transparent',
              shadowColor: activeTab === 'driver' ? '#000' : 'transparent',
              shadowOpacity: activeTab === 'driver' ? 0.08 : 0,
              shadowRadius: 3,
              elevation: activeTab === 'driver' ? 2 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: activeTab === 'driver' ? colors.text : colors.textSecondary,
              }}
            >
              Driver ({documentsList.filter((d) => d.category === 'driver').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('vehicle')}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: activeTab === 'vehicle' ? colors.surface : 'transparent',
              shadowColor: activeTab === 'vehicle' ? '#000' : 'transparent',
              shadowOpacity: activeTab === 'vehicle' ? 0.08 : 0,
              shadowRadius: 3,
              elevation: activeTab === 'vehicle' ? 2 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: activeTab === 'vehicle' ? colors.text : colors.textSecondary,
              }}
            >
              Vehicle ({documentsList.filter((d) => d.category === 'vehicle').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Document List Cards */}
        <View className="space-y-3.5">
          {filteredDocs.map((doc) => (
            <View
              key={doc.id}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="border rounded-xl p-4 shadow-sm mb-3.5"
            >
              {/* Card Header */}
              <View
                style={{ borderBottomColor: colors.borderLight }}
                className="flex-row items-start justify-between pb-3 border-b"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View
                    style={{
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                    }}
                    className="w-10 h-10 rounded-xl border items-center justify-center mr-3"
                  >
                    {getDocIcon(doc.id)}
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-black">
                      {doc.title}
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-[11px] font-medium mt-0.5" numberOfLines={1}>
                      {doc.docTypeLabel}
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View
                  style={{
                    backgroundColor:
                      doc.status === 'verified'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(245, 158, 11, 0.1)',
                    borderColor:
                      doc.status === 'verified'
                        ? 'rgba(16, 185, 129, 0.25)'
                        : 'rgba(245, 158, 11, 0.25)',
                  }}
                  className="border px-2.5 py-1 rounded-full flex-row items-center"
                >
                  <View
                    className={`w-1.5 h-1.5 rounded-full ${doc.status === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'
                      } mr-1.5`}
                  />
                  <Text
                    style={{
                      color: doc.status === 'verified' ? '#059669' : '#D97706',
                    }}
                    className="text-[10px] font-extrabold"
                  >
                    {doc.statusText}
                  </Text>
                </View>
              </View>

              {/* Number and Validity Grid */}
              <View
                style={{ borderBottomColor: colors.borderLight }}
                className="py-3 flex-row justify-between items-center border-b"
              >
                <View className="flex-1 mr-2">
                  <Text style={{ color: colors.textMuted }} className="text-[10px] uppercase font-bold tracking-wider">
                    Document Number
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleCopyDocNumber(doc)}
                    className="flex-row items-center mt-1"
                  >
                    <Text style={{ color: colors.text }} className="text-xs font-black tracking-wide mr-1.5">
                      {doc.docNumber}
                    </Text>
                    <Text style={{ color: colors.primary }} className="text-[10px] font-bold">
                      {copiedDocId === doc.id ? '✓ Copied' : 'Copy'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="items-end">
                  <Text style={{ color: colors.textMuted }} className="text-[10px] uppercase font-bold tracking-wider">
                    Validity
                  </Text>
                  <Text
                    style={{
                      color: doc.status === 'verified' ? '#059669' : '#D97706',
                    }}
                    className="text-xs font-bold mt-1"
                  >
                    {doc.validity}
                  </Text>
                </View>
              </View>

              {/* Photo Thumbnails Preview & Actions */}
              <View className="pt-3">
                <Text style={{ color: colors.textMuted }} className="text-[10px] uppercase font-bold tracking-wider mb-2">
                  Document Preview (Tap photo to zoom)
                </Text>
                <View className="flex-row items-center">
                  {/* Front Photo */}
                  {isValidImageUri(doc.frontImageUri) ? (
                    <TouchableOpacity
                      key={`${doc.id}-front-photo`}
                      activeOpacity={0.8}
                      onPress={() => setPreviewImageUri(doc.frontImageUri || null)}
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceSecondary,
                        marginRight: 12,
                        borderRadius: 12,
                        overflow: 'hidden',
                        borderWidth: 1,
                      }}
                    >
                      <Image
                        source={{ uri: doc.frontImageUri }}
                        style={{ width: 80, height: 56 }}
                        resizeMode="cover"
                      />
                      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 2, alignItems: 'center' }}>
                        <Text style={{ fontSize: 8, fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 1 }}>Front</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      key={`${doc.id}-front-upload`}
                      activeOpacity={0.8}
                      onPress={() => navigateToUpload(doc)}
                      style={{
                        borderColor: colors.primary,
                        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                        marginRight: 12,
                        width: 80,
                        height: 56,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderStyle: 'dashed',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700', textAlign: 'center' }}>
                        + Upload
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Back Photo (if available) */}
                  {isValidImageUri(doc.backImageUri) ? (
                    <TouchableOpacity
                      key={`${doc.id}-back-photo`}
                      activeOpacity={0.8}
                      onPress={() => setPreviewImageUri(doc.backImageUri || null)}
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceSecondary,
                        marginRight: 12,
                        borderRadius: 12,
                        overflow: 'hidden',
                        borderWidth: 1,
                      }}
                    >
                      <Image
                        source={{ uri: doc.backImageUri }}
                        style={{ width: 80, height: 56 }}
                        resizeMode="cover"
                      />
                      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 2, alignItems: 'center' }}>
                        <Text style={{ fontSize: 8, fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 1 }}>Back</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    <TouchableOpacity
                      key={`${doc.id}-btn-details`}
                      activeOpacity={0.7}
                      onPress={() => setSelectedDoc(doc)}
                      style={{
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                        flex: 1,
                        borderWidth: 1,
                        borderRadius: 12,
                        height: 56,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 8,
                        marginRight: 8,
                      }}
                    >
                      <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
                        View Details 🔍
                      </Text>
                    </TouchableOpacity>


                  </View>
                </View>
              </View>

              {/* Card Footer */}
              <View
                style={{ borderTopColor: colors.borderLight }}
                className="flex-row items-center justify-between pt-3 mt-3 border-t"
              >
                <Text style={{ color: colors.textMuted }} className="text-xs font-medium">
                  {doc.extraDetails?.[0]?.value || 'Government Verified Document'}
                </Text>

                {doc.status === 'verified' ? (
                  <View className="flex-row items-center bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                    <Text className="text-[10px] font-bold text-emerald-600">
                      Verified
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
                    <Text className="text-[10px] font-bold text-amber-600">
                      {doc.statusText}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* 5. Security & Legal Footnote */}
        <View
          style={{
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border,
          }}
          className="mt-2 p-4 border rounded-xl flex-row items-center"
        >
          <View
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            }}
            className="w-9 h-9 rounded-full items-center justify-center mr-3"
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                stroke={colors.textMuted}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text }} className="text-xs font-bold">
              Bank-Grade 256-Bit Encrypted Storage
            </Text>
            <Text style={{ color: colors.textMuted }} className="text-[11px] mt-0.5 leading-relaxed font-medium">
              Your documents are safely stored in compliance with IT Act 2000 and MoRTH Digital Transport guidelines.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* MODAL 1: Full Document Detail Sheet */}
      <Modal
        visible={selectedDoc !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedDoc(null)}
      >
        <View style={{ backgroundColor: colors.modalBackdrop }} className="flex-1 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedDoc(null)}
            className="flex-1"
          />

          <View
            style={{
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            }}
            className="rounded-t-3xl max-h-[88%] p-5 pb-8 shadow-2xl border-t"
          >
            {selectedDoc && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View
                  style={{ borderBottomColor: colors.borderLight }}
                  className="flex-row items-center justify-between pb-3.5 border-b mb-4"
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <View
                      style={{
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                      }}
                      className="w-10 h-10 rounded-xl border items-center justify-center mr-3"
                    >
                      {getDocIcon(selectedDoc.id)}
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: colors.text }} className="text-base font-black">
                        {selectedDoc.title}
                      </Text>
                      <Text className="text-xs text-emerald-600 font-bold">
                        ● {selectedDoc.statusText}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedDoc(null)}
                    style={{ backgroundColor: colors.surfaceSecondary }}
                    className="w-8 h-8 rounded-full items-center justify-center"
                  >
                    <Text style={{ color: colors.text }} className="font-bold text-sm">✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Primary Key-Value Details */}
                <View
                  style={{
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                  }}
                  className="border rounded-xl p-4 mb-4"
                >
                  <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
                    <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Document Number</Text>
                    <Text style={{ color: colors.text }} className="text-xs font-black">
                      {selectedDoc.docNumber}
                    </Text>
                  </View>
                  <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
                    <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Validity / Expiry</Text>
                    <Text className="text-xs font-bold text-emerald-600">
                      {selectedDoc.validity}
                    </Text>
                  </View>
                  {selectedDoc.issuedDate && (
                    <View style={{ borderBottomColor: colors.borderLight }} className="flex-row justify-between py-2 border-b">
                      <Text style={{ color: colors.textMuted }} className="text-xs font-medium">Issue Date</Text>
                      <Text style={{ color: colors.text }} className="text-xs font-bold">
                        {selectedDoc.issuedDate}
                      </Text>
                    </View>
                  )}

                  {selectedDoc.extraDetails?.map((item, idx) => (
                    <View
                      key={idx}
                      style={{
                        borderBottomColor: idx === (selectedDoc.extraDetails?.length || 0) - 1 ? 'transparent' : colors.borderLight,
                        borderBottomWidth: idx === (selectedDoc.extraDetails?.length || 0) - 1 ? 0 : 1,
                      }}
                      className="flex-row justify-between py-2"
                    >
                      <Text style={{ color: colors.textMuted }} className="text-xs font-medium">{item.label}</Text>
                      <Text style={{ color: colors.text }} className="text-xs font-bold">{item.value}</Text>
                    </View>
                  ))}
                </View>

                {/* Document Photos Preview */}
                <Text style={{ color: colors.text }} className="text-xs font-black uppercase tracking-wider mb-2.5">
                  Uploaded High-Res Photos
                </Text>
                {isValidImageUri(selectedDoc.frontImageUri) ? (
                  <View className="flex-row space-x-3 mb-5">
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setPreviewImageUri(selectedDoc.frontImageUri || null)}
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceSecondary,
                      }}
                      className="flex-1 rounded-xl overflow-hidden border shadow-sm"
                    >
                      <Image
                        source={{ uri: selectedDoc.frontImageUri }}
                        className="w-full h-36"
                        resizeMode="cover"
                      />
                      <View className="bg-black/75 py-1.5 items-center">
                        <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
                          Front Photo (Tap to zoom)
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {isValidImageUri(selectedDoc.backImageUri) ? (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setPreviewImageUri(selectedDoc.backImageUri || null)}
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.surfaceSecondary,
                        }}
                        className="flex-1 rounded-xl overflow-hidden border ml-2.5 shadow-sm"
                      >
                        <Image
                          source={{ uri: selectedDoc.backImageUri }}
                          className="w-full h-36"
                          resizeMode="cover"
                        />
                        <View className="bg-black/75 py-1.5 items-center">
                          <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
                            Back Photo (Tap to zoom)
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : (
                  <View
                    style={{ backgroundColor: colors.surfaceSecondary, borderColor: colors.border }}
                    className="p-6 rounded-xl border border-dashed items-center justify-center mb-5"
                  >
                    <Text style={{ color: colors.textMuted }} className="text-xs font-semibold mb-2">
                      No document photos uploaded yet
                    </Text>
                  </View>
                )}

                {/* Modal Actions */}
                <View className="mt-2">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      const docToOpen = selectedDoc;
                      setSelectedDoc(null);
                      navigateToUpload(docToOpen);
                    }}
                    style={{ backgroundColor: colors.primary }}
                    className="w-full py-3.5 rounded-xl items-center justify-center shadow-md mb-2.5"
                  >
                    <Text className="text-sm font-bold text-white">
                      {isValidImageUri(selectedDoc.frontImageUri) ? 'Update / Re-upload Document ✏️' : 'Upload Document Now 📤'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setSelectedDoc(null)}
                    style={{ backgroundColor: colors.surfaceSecondary, borderColor: colors.border }}
                    className="w-full py-3 rounded-xl items-center justify-center border"
                  >
                    <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">Close</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Full Screen Zoom Preview */}
      <Modal
        visible={previewImageUri !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImageUri(null)}
      >
        <View className="flex-1 bg-black justify-center items-center p-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setPreviewImageUri(null)}
            className="absolute top-12 right-6 z-10 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Text className="text-white font-black text-base">✕</Text>
          </TouchableOpacity>

          {isValidImageUri(previewImageUri) ? (
            <Image
              source={{ uri: previewImageUri }}
              className="w-full h-[70%]"
              resizeMode="contain"
            />
          ) : null}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPreviewImageUri(null)}
            className="mt-6 bg-white/20 px-6 py-2.5 rounded-full border border-white/30"
          >
            <Text className="text-white font-bold text-xs">Tap to Dismiss</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export const DriverDocumentsScreen = DocumentsScreen;
export default DocumentsScreen;
