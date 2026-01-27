# Lamma+ (Gather in Faith) 🌳

Lamma+ is a mobile-first content creator discovery platform designed for the faith community. It connects users with scholars, educators, and content creators in a warm, welcoming environment.

## 📱 Features

- **Onboarding Flow**:
  - Personalized region and interest selection (2-step filter)
  - Beautiful splash and welcome screens with gold/teal branding
  - Suggested creators based on choices
- **Main Application**:
  - **Home**: Featured content and vertical browsing
  - **Search**: Discovery with tags and region filters
  - **Profile**: Detailed creator profiles with content tabs (Videos, Audio, Books)
  - **Following**: Manage connections (limited in free tier)
  - **Premium**: Upgrade flow for unlimited access

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4 (Mobile-first design)
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)

## 🎨 Brand Identity

- **Primary Colors**: Teal (`#0D7377`) & Gold (`#F5B820`)
- **Typography**: Clean, accessible Sans Serif (Inter)
- **Aesthetic**: Warm, premium, and welcoming

## 🚀 Getting Started

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Run Development Server**:

   ```bash
   npm run dev
   ```

3. **Open Application**:
   Visit [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

- `app/`: Next.js App Router pages and layouts
- `components/onboarding/`: Screens for the entry flow
- `components/main/`: Core application screens (Home, Profile, Search)
- `components/ui/`: Reusable primitives (Buttons, Cards, Nav)
- `lib/data/`: Static data (Regions, Countries)

## ✅ Verification

The application has been fully verified with automated browser testing:

- Full navigation flow is functional.
- UI styling matches strict brand guidelines.
- Mobile responsiveness (375px width) confirmed.
