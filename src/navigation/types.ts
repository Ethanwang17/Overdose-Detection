import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  App: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  History: undefined;
  Settings: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;
export type HomeScreenProps = BottomTabScreenProps<AppTabParamList, 'Home'>;
export type HistoryScreenProps = BottomTabScreenProps<AppTabParamList, 'History'>;
export type SettingsScreenProps = BottomTabScreenProps<AppTabParamList, 'Settings'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
