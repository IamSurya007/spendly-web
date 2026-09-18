'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Wallet,
  Receipt,
  PiggyBank,
  Landmark,
  TrendingUp,
  LayoutDashboard,
  FileSpreadsheet,
  Download,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  X,
  Menu,
  Shield,
  AlertCircle,
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const DEFAULT_FALLBACK_URL = 'https://github.com/IamSurya007/spendly/releases/latest';
  const [apkDownloadUrl, setApkDownloadUrl] = useState(DEFAULT_FALLBACK_URL);

  // Fetch dynamic APK download URL from GitHub latest release API
  useEffect(() => {
    fetch('https://api.github.com/repos/IamSurya007/spendly/releases/latest')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.assets)) {
          const apkAsset = data.assets.find((asset: { name: string; browser_download_url: string }) =>
            asset.name.endsWith('.apk')
          );
          if (apkAsset?.browser_download_url) {
            setApkDownloadUrl(apkAsset.browser_download_url);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch latest release from GitHub API:', err);
      });
  }, []);

  // Handle header background on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Receipt,
      iconColor: 'text-blue-600 bg-blue-50',
      title: 'Expense Tracking',
      desc: 'Automatic SMS parsing, quick manual entry, receipt OCR scanning, and powerful search/filter filters to organize expenses.',
    },
    {
      icon: PiggyBank,
      iconColor: 'text-emerald-600 bg-emerald-50',
      title: 'Smart Budgets',
      desc: 'Set category-wise budget limits, view real-time progression cards, and receive alerts at 80% and 100% usage.',
    },
    {
      icon: Landmark,
      iconColor: 'text-indigo-600 bg-indigo-50',
      title: 'Loan Manager',
      desc: 'Track money lent and borrowed with custom statuses, due dates, repayment records, and automated reminders.',
    },
    {
      icon: TrendingUp,
      iconColor: 'text-violet-600 bg-violet-50',
      title: 'Investment Portfolio',
      desc: 'Monitor recurring deposits (RD) and other investments, calculate maturity dates and interest returns, and track multi-RD progress.',
    },
    {
      icon: LayoutDashboard,
      iconColor: 'text-amber-600 bg-amber-50',
      title: 'Web Dashboard',
      desc: 'Access a real-time synchronized view of your finances on the web, complete with summary charts and obligation timelines.',
    },
    {
      icon: FileSpreadsheet,
      iconColor: 'text-green-600 bg-green-50',
      title: 'Google Sheets Export',
      desc: 'Maintain complete data ownership. Export all transactions, budgets, and investments to your personal Google Spreadsheet in one click.',
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-slate-50 text-[#0D1B3E] font-sans selection:bg-[#3D7FE8]/20">
      
      {/* Background ambient glows contained to prevent horizontal scroll and preserve sticky header */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-3xl translate-x-1/3" />
      </div>
      
      {/* Glassmorphic Sticky Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9.5 h-9.5 bg-[#3D7FE8] rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform duration-200">
                <Wallet size={18} className="text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#0D1B3E] to-blue-900 bg-clip-text text-transparent">
                Fiscora
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <a href="#features" className="hover:text-[#3D7FE8] transition-colors duration-200">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-[#3D7FE8] transition-colors duration-200">
                How It Works
              </a>
              <a href="#download" className="hover:text-[#3D7FE8] transition-colors duration-200">
                Download
              </a>
            </nav>

            {/* CTA Button Actions */}
            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                <div className="w-24 h-9 bg-slate-200 rounded-xl animate-pulse" />
              ) : user ? (
                <Link href="/dashboard">
                  <Button variant="primary" size="sm" className="shadow-md shadow-blue-500/15">
                    Open Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login?mode=signup">
                    <Button variant="primary" size="sm" className="shadow-md shadow-blue-500/15">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu navigation drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-lg px-4 py-6 flex flex-col gap-4 animate-scale-in">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              How It Works
            </a>
            <a
              href="#download"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Download APK
            </a>
            <hr className="border-slate-100" />
            <div className="flex flex-col gap-3 px-3">
              {loading ? (
                <div className="w-full h-10 bg-slate-200 rounded-xl animate-pulse" />
              ) : user ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button variant="primary" fullWidth>
                    Open Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="secondary" fullWidth>
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login?mode=signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="primary" fullWidth>
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6 animate-fade-in">
              <Badge variant="paid" dot>Active</Badge>
              <span className="text-xs font-semibold text-blue-700">SMS auto-capture features live in App v1.0</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6">
              Your entire financial life,{' '}
              <span className="bg-gradient-to-r from-[#3D7FE8] to-indigo-600 bg-clip-text text-transparent">
                automatically tracked
              </span>
            </h1>

            {/* Paragraph */}
            <p className="text-lg text-slate-500 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              Consolidate your expenses, budgets, loans, and investments in one place. Captures SMS notifications instantly on Android and syncs in real-time with your Web Dashboard.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <a href={apkDownloadUrl} className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-blue-500/25 gap-2 font-semibold">
                  <Download size={18} />
                  Download APK
                </Button>
              </a>
              {loading ? (
                <div className="w-48 h-12 bg-slate-200 rounded-xl animate-pulse" />
              ) : user ? (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto border border-slate-200 font-semibold">
                    Open Web Dashboard
                    <ArrowRight size={18} className="ml-1" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto border border-slate-200 font-semibold">
                    Try Web Demo
                    <ArrowRight size={18} className="ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#3D7FE8] mb-3">The Problem</h2>
            <p className="text-3xl font-extrabold tracking-tight text-[#0D1B3E]">
              Why managing money feels like a second job
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* The Old Way */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 relative">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                <X size={24} className="stroke-[3px]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">The Manual Old Way</h3>
              <ul className="space-y-3.5 text-sm text-slate-500">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                  <span>Manual spreadsheet tracking is tedious, leading to skipped entries.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                  <span>Existing apps don&apos;t support peer-to-peer loans, making lending tracking disorganized.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                  <span>No structured way to log recurring deposits (RD) and calculate maturity yields.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                  <span>Your financial data is locked inside siloed apps with no quick way to back up.</span>
                </li>
              </ul>
            </div>

            {/* The Fiscora Way */}
            <div className="p-8 rounded-2xl bg-[#0D1B3E] text-white border border-[#0D1B3E] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3D7FE8]/10 rounded-full translate-y-[-20%] translate-x-[20%] pointer-events-none" />
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <CheckCircle2 size={24} className="stroke-[3px]" />
              </div>
              <h3 className="text-lg font-bold mb-4 text-white">The Fiscora Way</h3>
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span>Android SMS auto-parsing records transactions automatically as they occur.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span>Dedicated loans module with status updates and due reminders.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span>Intuitive investment portal mapping RDs and projecting maturity metrics.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span>1-click sync to export all data to your personal Google Sheets anytime.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#3D7FE8] mb-3">Feature Highlights</h2>
            <p className="text-3xl font-extrabold tracking-tight text-[#0D1B3E] sm:text-4xl">
              Equipped with everything you need
            </p>
            <p className="text-base text-slate-500 font-medium mt-4 max-w-xl mx-auto">
              Every tool and widget in Fiscora is tailored for ease-of-use and high efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const IconComp = feature.icon;
              return (
                <div
                  key={i}
                  className="card p-6.5 bg-white border border-slate-100 flex flex-col items-start hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`p-3 rounded-xl mb-5 ${feature.iconColor}`}>
                    <IconComp size={20} className="stroke-[2.5px]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* "Two Ways to Use It" Section */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#3D7FE8] mb-3">Flexible Ecosystem</h2>
            <p className="text-3xl font-extrabold tracking-tight text-[#0D1B3E] sm:text-4xl">
              Two platforms, unified sync
            </p>
            <p className="text-base text-slate-500 font-medium mt-4">
              Your financial data updates seamlessly between mobile and web dashboard in under 2 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mobile Card */}
            <div className="card p-8 bg-slate-50 border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-6">
                  <Smartphone size={14} />
                  Android Application
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Flutter Mobile Client</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Perfect for on-the-go tracking. Our Flutter app features zero-friction background SMS capturing for transaction tracking, receipt scanner OCR, offline data support, and instant cloud integration.
                </p>
                <div className="space-y-2.5 mb-8">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-500 stroke-[2.5px]" />
                    <span>Real-time background SMS scraping</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-500 stroke-[2.5px]" />
                    <span>Optical Character Recognition (OCR) for receipt photos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-500 stroke-[2.5px]" />
                    <span>Supports direct offline logging</span>
                  </div>
                </div>
              </div>
              <a href={apkDownloadUrl}>
                <Button variant="primary" fullWidth className="gap-2 shadow-md shadow-blue-500/10">
                  <Download size={16} />
                  Download Android APK
                </Button>
              </a>
            </div>

            {/* Web Card */}
            <div className="card p-8 !bg-[#0D1B3E] text-white border border-[#0D1B3E] flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3D7FE8]/10 rounded-full translate-y-[-20%] translate-x-[20%] pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3D7FE8]/20 text-blue-300 text-xs font-bold mb-6">
                  <LayoutDashboard size={14} />
                  Next.js Web Portal
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Next.js Web Dashboard</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Your command center. View granular breakdowns, modify complex budget guidelines, monitor loans with calendar overviews, oversee multiple recurring deposits, and trigger automatic spreadsheets backups.
                </p>
                <div className="space-y-2.5 mb-8">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <CheckCircle2 size={16} className="text-emerald-400 stroke-[2.5px]" />
                    <span>Interactive charts and metrics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <CheckCircle2 size={16} className="text-emerald-400 stroke-[2.5px]" />
                    <span>Advanced configurations & backup settings</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <CheckCircle2 size={16} className="text-emerald-400 stroke-[2.5px]" />
                    <span>Secure cloud-synced portal</span>
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="w-full h-10 bg-slate-800 rounded-xl animate-pulse" />
              ) : user ? (
                <Link href="/dashboard" className="w-full">
                  <Button variant="secondary" fullWidth className="bg-white text-[#0D1B3E] hover:bg-slate-100">
                    Open Web Dashboard
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login" className="w-full">
                  <Button variant="secondary" fullWidth className="bg-white text-[#0D1B3E] hover:bg-slate-100">
                    Access Dashboard Demo
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* "How It Works" Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#3D7FE8] mb-3">Seamless Sync</h2>
            <p className="text-3xl font-extrabold tracking-tight text-[#0D1B3E] sm:text-4xl">
              Three steps to complete insight
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-[#3D7FE8] rounded-xl flex items-center justify-center font-bold text-lg mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Log Transactions</h3>
              <p className="text-sm text-slate-500">
                Fiscora auto-parses banking SMS warnings instantly. You can also log manually or take receipt photos to extract data.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-[#3D7FE8] rounded-xl flex items-center justify-center font-bold text-lg mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Cloud Sync</h3>
              <p className="text-sm text-slate-500">
                All records sync to our secure backend database instantly (~2 seconds) over SSL encryption.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-[#3D7FE8] rounded-xl flex items-center justify-center font-bold text-lg mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">View & Export</h3>
              <p className="text-sm text-slate-500">
                Access your logs anywhere on Web and Mobile, view monthly obligation graphs, or export directly to Google Sheets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#0D1B3E] to-slate-950 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden border border-[#0D1B3E]">
            {/* Background blobs */}
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#3D7FE8]/10 rounded-full translate-y-[30%] translate-x-[30%] pointer-events-none" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-y-[-40%] translate-x-[-40%] pointer-events-none" />

            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-blue-300 text-xs font-semibold mb-6">
                  <Shield size={12} />
                  Verified secure download
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-white">
                  Get the Android App
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Currently available via direct APK distribution. The Google Play Store release is in progress. Install directly on any Android device.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <a href={apkDownloadUrl} className="w-full sm:w-auto">
                    <Button variant="primary" className="w-full sm:w-auto gap-2 py-3 bg-[#3D7FE8] hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/25">
                      <Download size={18} />
                      Download APK File
                    </Button>
                  </a>
                  <span className="text-xs text-slate-400 text-center sm:text-left">
                    Android 8.0+ supported
                  </span>
                </div>
              </div>

              {/* Safe source installer notice */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex gap-3 mb-4">
                  <AlertCircle className="text-amber-400 shrink-0" size={20} />
                  <h3 className="text-sm font-bold text-white">How to Install from Unknown Sources</h3>
                </div>
                <ol className="space-y-3 text-xs text-slate-300 list-decimal pl-4">
                  <li>Download the Fiscora APK using the download button.</li>
                  <li>Click open on the downloaded file.</li>
                  <li>If prompted, enable &quot;Allow from this source&quot; in your browser settings.</li>
                  <li>Tap Install to complete setup. Real-time SMS parsing will ask for permission on first start.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8 mb-8">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#3D7FE8] rounded-xl flex items-center justify-center">
                <Wallet size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Fiscora</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#download" className="hover:text-white transition-colors">Download</a>
              <Link href="/login" className="hover:text-white transition-colors">Demo</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} Fiscora Finance. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>Solo Portfolio Project</span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-300 transition-colors"
              >
                GitHub
              </a>
              <a href="mailto:contact@example.com" className="hover:text-slate-300 transition-colors">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
