import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubmitWholesaleApplication } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { BackToTopButton } from '@/components/BackToTopButton';

type FormState = {
  businessName: string;
  businessType: string;
  license: string;
  contactName: string;
  email: string;
  phone: string;
  location: string;
  interest: string;
  volume: string;
};

const INITIAL_FORM: FormState = {
  businessName: '',
  businessType: 'Licensed dispensary',
  license: '',
  contactName: '',
  email: '',
  phone: '',
  location: '',
  interest: 'Wholesale buyer',
  volume: '',
};

const BUSINESS_TYPES = ['Licensed dispensary', 'Local retail shop', 'Affiliate partner'];
const INTERESTS = ['Wholesale buyer', 'Affiliate partner', 'Both'];

export default function WholesaleScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const applicationMutation = useSubmitWholesaleApplication();

  const requiredFields = useMemo(
    () => [form.businessName, form.license, form.contactName, form.email, form.phone, form.location, form.volume],
    [form],
  );
  const isValid =
    requiredFields.every((value) => value.trim().length > 0) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setServerError(null);
  };

  const submit = () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    setServerError(null);
    applicationMutation.mutate(
      {
        data: {
          businessName: form.businessName.trim(),
          businessType: form.businessType.trim(),
          license: form.license.trim(),
          contactName: form.contactName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          location: form.location.trim(),
          interest: form.interest.trim(),
          volume: form.volume.trim(),
        },
      },
      {
        onSuccess: () => setSubmitted(true),
        onError: () => setServerError('We could not save your application. Please check your connection and try again.'),
      },
    );
  };

  return (
    <LinearGradient colors={[colors.background, colors.pageGradientEnd]} end={{ x: 0, y: 1 }} start={{ x: 0, y: 0 }} style={styles.screen}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110, paddingTop: 16 }]}
        keyboardShouldPersistTaps="handled"
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.primary }]}>WHOLESALE AFFILIATE</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Lets work and grow better together.</Text>
        <Text style={[styles.intro, { color: colors.description }]}>
          We partner with licensed local shops and dispensaries that care about storage, education, and a thoughtful farm-to-table experience.
        </Text>

        {submitted ? (
          <View style={[styles.confirmation, { backgroundColor: colors.wholesaleSurface, borderColor: colors.descriptionBorder, shadowColor: colors.orangeDark, boxShadow: `0 0 0 1px ${colors.textBoxDarkMagenta}, 0 2px 8px ${colors.textBoxMagentaGlow}` }]}>
            <Feather color={colors.primary} name="check-circle" size={29} />
            <Text style={[styles.confirmationTitle, { color: colors.primary }]}>Application Received</Text>
            <Text style={[styles.confirmationCopy, { color: colors.description }]}>
              Thank you for your interest in The Source. Our team will review your details and reach out within 2–3 business days.
            </Text>
            <Pressable onPress={() => router.push('/drops')} style={[styles.actionButton, { backgroundColor: colors.primary, borderColor: colors.descriptionBorder }]}>
              <Text style={[styles.actionText, { color: colors.primaryForeground }]}>Browse the garden</Text>
              <Feather color={colors.primaryForeground} name="arrow-up-right" size={16} />
            </Pressable>
          </View>
        ) : (
          <View style={[styles.formCard, { backgroundColor: colors.wholesaleSurface, borderColor: colors.wholesaleBorder, shadowColor: colors.wholesaleGlow, shadowOpacity: 0.46, shadowRadius: 6, boxShadow: `0 0 0 2px ${colors.background}, 0 0 0 5px ${colors.wholesaleBorder}, 0 0 11px ${colors.wholesaleGlow}, 0 0 20px ${colors.wholesaleOuterGlow}` }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Business Information</Text>
            <Field label="Business name" value={form.businessName} onChangeText={(value) => updateField('businessName', value)} colors={colors} />
            <Field label="License number" value={form.license} onChangeText={(value) => updateField('license', value)} colors={colors} />
            <Field label="City / state or region" value={form.location} onChangeText={(value) => updateField('location', value)} colors={colors} />
            <Text style={[styles.label, { color: colors.descriptionPurple }]}>Business type</Text>
            <ChoiceRow choices={BUSINESS_TYPES} selected={form.businessType} onSelect={(value) => updateField('businessType', value)} colors={colors} />

            <Text style={[styles.sectionTitle, styles.sectionSpacing, { color: colors.primary }]}>Contact Details</Text>
            <Field label="Contact name" value={form.contactName} onChangeText={(value) => updateField('contactName', value)} colors={colors} />
            <Field label="Email address" keyboardType="email-address" value={form.email} onChangeText={(value) => updateField('email', value)} colors={colors} />
            <Field label="Phone number" keyboardType="phone-pad" value={form.phone} onChangeText={(value) => updateField('phone', value)} colors={colors} />

            <Text style={[styles.sectionTitle, styles.sectionSpacing, { color: colors.primary }]}>Partnership Details</Text>
            <Text style={[styles.label, { color: colors.descriptionPurple }]}>I’m interested in</Text>
            <ChoiceRow choices={INTERESTS} selected={form.interest} onSelect={(value) => updateField('interest', value)} colors={colors} />
            <Field label="Estimated monthly order volume" value={form.volume} onChangeText={(value) => updateField('volume', value)} colors={colors} />
            {showErrors && !isValid ? <Text style={[styles.error, { color: colors.destructive }]}>Please complete the required fields with a valid email address.</Text> : null}
            {serverError ? <Text style={[styles.error, { color: colors.destructive }]}>{serverError}</Text> : null}
            <Pressable
              accessibilityRole="button"
              disabled={applicationMutation.isPending}
              onPress={submit}
              style={({ pressed }) => [
                styles.submit,
                {
                   backgroundColor: pressed ? colors.orangeDark : colors.primary,
                   borderColor: pressed ? colors.orangeDark : colors.descriptionBorder,
                   boxShadow: `0 1px 5px ${colors.textBoxMagentaGlow}`,
                  opacity: applicationMutation.isPending ? 0.68 : 1,
                  transform: [{ translateY: pressed ? 2 : 0 }],
                },
              ]}
            >
              <Text style={[styles.submitText, { color: colors.primaryForeground }]}>{applicationMutation.isPending ? 'Submitting…' : 'Submit Application'}</Text>
              <Feather color={colors.primaryForeground} name="arrow-up-right" size={17} />
            </Pressable>
          </View>
        )}
        <BackToTopButton onPress={() => scrollRef.current?.scrollTo({ animated: true, y: 0 })} />
      </ScrollView>
    </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function Field({
  label,
  value,
  onChangeText,
  colors,
  multiline = false,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  colors: ReturnType<typeof import('@/hooks/useColors').useColors>;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.descriptionPurple }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={colors.mutedForeground}
         style={[styles.input, multiline ? styles.multiline : null, { backgroundColor: colors.background, borderColor: colors.descriptionBorder, color: colors.foreground, shadowColor: colors.orangeDark, shadowOpacity: 0.28, shadowRadius: 3, boxShadow: `0 0 0 1px ${colors.textBoxDarkMagenta}, 0 1px 5px ${colors.textBoxMagentaGlow}` } as any]}
        value={value}
      />
    </View>
  );
}

function ChoiceRow({
  choices,
  selected,
  onSelect,
  colors,
}: {
  choices: string[];
  selected: string;
  onSelect: (value: string) => void;
  colors: ReturnType<typeof import('@/hooks/useColors').useColors>;
}) {
  return (
    <View style={styles.choiceRow}>
      {choices.map((choice) => {
        const active = choice === selected;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            key={choice}
            onPress={() => onSelect(choice)}
            style={[styles.choice, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.darkMagenta : colors.orangeLight }]}
          >
            <Text style={[styles.choiceText, { color: active ? colors.primaryForeground : colors.foreground }]}>{choice}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: 10, padding: 18 },
  eyebrow: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '800', letterSpacing: 1.8, marginTop: 4 },
  title: { fontFamily: 'Georgia', fontSize: 32, fontWeight: '900', lineHeight: 37, marginTop: 2 },
  intro: { fontFamily: 'Georgia', fontSize: 14, lineHeight: 21, marginBottom: 10 },
  formCard: { borderRadius: 12, borderWidth: 4, elevation: 4, gap: 10, marginTop: 8, overflow: 'hidden', padding: 16 },
  confirmation: { alignItems: 'center', borderRadius: 12, borderWidth: 1, gap: 12, marginTop: 8, overflow: 'hidden', padding: 25, textAlign: 'center' },
  confirmationTitle: { fontFamily: 'Georgia', fontSize: 25, fontWeight: '900', textAlign: 'center' },
  confirmationCopy: { fontFamily: 'Georgia', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 20, fontWeight: '900', marginBottom: 3 },
  sectionSpacing: { marginTop: 12 },
  field: { gap: 5 },
  label: { fontFamily: 'Georgia', fontSize: 10, fontWeight: '900', letterSpacing: 0.9, textTransform: 'uppercase' },
  input: { borderRadius: 8, borderWidth: 1, fontFamily: 'Georgia', fontSize: 14, minHeight: 44, paddingHorizontal: 11, paddingVertical: 10 },
  multiline: { minHeight: 92, textAlignVertical: 'top' },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  choice: { borderRadius: 999, borderWidth: 1, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 8 },
  choiceText: { fontFamily: 'Georgia', fontSize: 11, fontWeight: '800' },
  error: { fontFamily: 'Georgia', fontSize: 12, fontWeight: '700', lineHeight: 18 },
  submit: { alignItems: 'center', borderRadius: 999, borderWidth: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', marginTop: 7, overflow: 'hidden', paddingHorizontal: 18, paddingVertical: 13 },
  submitText: { fontFamily: 'Georgia', fontSize: 14, fontWeight: '900' },
  actionButton: { alignItems: 'center', borderRadius: 999, borderWidth: 1, flexDirection: 'row', gap: 7, marginTop: 6, overflow: 'hidden', paddingHorizontal: 17, paddingVertical: 12 },
  actionText: { fontFamily: 'Georgia', fontSize: 13, fontWeight: '900' },
});