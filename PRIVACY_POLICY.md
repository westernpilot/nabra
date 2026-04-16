# Privacy Policy for Nabra

**Last updated: April 16, 2026**

Nabra ("we", "our", "the app") is an Arabic pronunciation learning application. This Privacy Policy explains what data we collect, why, and how we handle it.

## 1. Data We Collect

### Account Information
- **Google Sign-In**: If you sign in with Google, we receive your display name, email address, and profile photo URL from Google. This is used solely for account identification and syncing your progress across devices.
- **Guest Mode**: If you use the app as a guest, no personal information is collected. Your data is stored locally on your device only.

### Audio Recordings
- When you use the pronunciation practice features, the app records your voice through your device's microphone.
- Audio recordings are sent to **Microsoft Azure Speech Service** for real-time pronunciation assessment.
- **Audio is processed ephemerally** — it is analyzed and immediately discarded. We do not store, retain, or share your audio recordings.

### Learning Progress
- Pronunciation scores, session history, problem letter statistics, game level progress, and streak data are collected to track your learning journey.
- This data is stored locally on your device using AsyncStorage.
- If you are signed in with Google, progress data is synced to **Google Firebase Firestore** so it persists across devices.

### AI Coaching Data
- When you use the AI Coach feature, your aggregated pronunciation statistics (problem letters, scores, session counts) are sent to **OpenAI** to generate personalized coaching feedback.
- No raw audio or personally identifiable information is sent to OpenAI — only anonymized statistical summaries.

### Notification Preferences
- If you opt in to daily reminders, your preferred reminder time is stored locally. Notifications are scheduled locally on your device using the operating system's notification service.

## 2. How We Use Your Data

- **Pronunciation assessment**: Audio is processed in real-time to provide pronunciation scores and feedback.
- **Progress tracking**: Scores and statistics are stored to show your improvement over time.
- **Personalized coaching**: Aggregated stats are used to generate AI-powered advice tailored to your weak areas.
- **Account management**: Email and name are used to identify your account and sync progress.

## 3. Third-Party Services

We use the following third-party services that may process your data:

| Service | Data Shared | Purpose |
|---------|------------|---------|
| **Google Firebase** (Authentication & Firestore) | Email, display name, progress data | Account management, cloud sync |
| **Microsoft Azure Speech Service** | Audio recordings (ephemeral) | Pronunciation assessment |
| **OpenAI API** | Anonymized pronunciation statistics | AI coaching feedback |

Each service is governed by its own privacy policy:
- [Google Privacy Policy](https://policies.google.com/privacy)
- [Microsoft Privacy Statement](https://privacy.microsoft.com/privacystatement)
- [OpenAI Privacy Policy](https://openai.com/privacy/)

## 4. Data Storage and Security

- Local data is stored on your device using encrypted AsyncStorage.
- Cloud data (for signed-in users) is stored in Google Firebase Firestore, which provides encryption at rest and in transit.
- We do not sell, rent, or share your personal data with any third parties for advertising or marketing purposes.

## 5. Data Retention

- **Audio recordings**: Not retained. Processed in real-time and discarded immediately.
- **Progress data**: Retained as long as your account exists. You can clear your local history at any time from the Progress tab.
- **Account data**: Retained until you delete your account or sign out.

## 6. Your Rights

You can:
- **Access** your data through the Progress and Profile tabs in the app.
- **Delete** your local progress data using the "Clear History" option in the Progress tab.
- **Sign out** at any time from the Profile tab, which stops cloud syncing.
- **Use Guest Mode** to avoid sharing any personal information entirely.

## 7. Children's Privacy

Nabra is designed for users aged 13 and older. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal information, please contact us so we can delete it.

## 8. Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be reflected by the "Last updated" date at the top of this page. Continued use of the app after changes constitutes acceptance of the updated policy.

## 9. Contact Us

If you have questions about this Privacy Policy or your data, contact us at:

**Email**: sifobrahimi1999@gmail.com

---

*This privacy policy is hosted at [https://github.com/westernpilot/nabra/blob/master/PRIVACY_POLICY.md](https://github.com/westernpilot/nabra/blob/master/PRIVACY_POLICY.md)*
