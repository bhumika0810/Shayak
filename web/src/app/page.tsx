import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Wifi, Globe, Zap, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white pb-16 pt-20 md:pb-32 md:pt-32">
          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
                v1.0 Now Available
              </div>

              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
                AI-Powered Learning <br />
                <span className="text-indigo-600">Without Limits</span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg text-slate-600 md:text-xl">
                Sahayak bridges the digital divide with Edge AI technology.
                Experience seamless offline learning, multilingual support, and smart sync capabilities.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
                <Link href="/login">
                  <Button size="lg" className="h-14 min-w-[180px] text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="h-14 min-w-[180px] text-lg border-indigo-200 hover:bg-indigo-50 text-indigo-700">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {}
          <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] bg-indigo-100/50 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 -z-10 h-[600px] w-[600px] bg-blue-100/50 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />
        </section>

        {}
        <section className="container mx-auto px-4 py-24">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-none shadow-xl bg-gradient-to-br from-white to-slate-50">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Wifi className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Offline First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  No internet? No problem. Our Edge AI processes voice, text, and video locally on your device, ensuring zero downtime.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-gradient-to-br from-white to-slate-50">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Globe className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Language Bridge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Break language barriers with real-time translation and multilingual voice support. Learn in your native tongue.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-gradient-to-br from-white to-slate-50">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Smart Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Work offline and let Sahayak automatically sync your progress, analytics, and assignments when connection returns.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {}
        <section className="bg-slate-50 py-24">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Why Choose Sahayak?</h2>
              <p className="mt-4 text-lg text-slate-600">Built for the realities of modern education.</p>
            </div>

            <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
              <div className="grid grid-cols-2 border-b border-slate-100 p-6 text-center font-semibold text-slate-900">
                <div>Standard LMS</div>
                <div className="text-indigo-600">Sahayak Platform</div>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-2 p-6">
                  <div className="text-center text-slate-500">Requires Constant Internet</div>
                  <div className="flex items-center justify-center font-medium text-slate-900">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> Fully Offline Capable
                  </div>
                </div>
                <div className="grid grid-cols-2 p-6">
                  <div className="text-center text-slate-500">Cloud-only AI</div>
                  <div className="flex items-center justify-center font-medium text-slate-900">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> Local Edge AI
                  </div>
                </div>
                <div className="grid grid-cols-2 p-6">
                  <div className="text-center text-slate-500">Limited Language Support</div>
                  <div className="flex items-center justify-center font-medium text-slate-900">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> Multi-lingual Native
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 border-t text-center text-slate-500">
        <div className="container mx-auto px-4">
          <p>&copy; 2024 Sahayak Platform. Empowering Education Everywhere.</p>
        </div>
      </footer>
    </div>
  );
}