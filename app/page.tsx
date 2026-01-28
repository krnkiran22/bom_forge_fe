import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-orange-500 rounded-lg" />
            <span className="text-2xl font-bold text-slate-800">BOMForge AI</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-slate-600 hover:text-slate-900">Home</Link>
            <Link href="/upload" className="text-slate-600 hover:text-slate-900">Convert</Link>
            <Link href="/history" className="text-slate-600 hover:text-slate-900">History</Link>
          </nav>
          <Link href="/upload">
            <Button className="bg-teal-600 hover:bg-teal-700">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Transform eBOM to mBOM in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-orange-500">
              3 Seconds
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Intelligent Bill of Materials converter powered by AI. Automate your manufacturing BOM creation with 95%+ accuracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-6">
                Start Converting Now →
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">93% Time Savings</h3>
            <p className="text-slate-600">16 hours → 45 minutes. Let AI handle the tedious conversion work.</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">95%+ Accuracy</h3>
            <p className="text-slate-600">AI-powered analysis ensures manufacturing-ready BOMs with high precision.</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Explainable AI</h3>
            <p className="text-slate-600">See exactly why each decision was made. Full transparency and reasoning.</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Continuous Learning</h3>
            <p className="text-slate-600">System improves from your corrections, getting smarter with every BOM.</p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900">How It Works</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-teal-600">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Upload eBOM</h3>
            <p className="text-slate-600">Drag and drop your Excel, CSV, or XML file. Supports various formats.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-600">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">AI Conversion</h3>
            <p className="text-slate-600">AI analyzes parts, adds tooling, assigns work centers, and optimizes.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-teal-600">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Review & Export</h3>
            <p className="text-slate-600">Review changes, make edits, and export manufacturing-ready mBOM.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-teal-600 to-orange-500 text-white p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your BOM Process?</h2>
          <p className="text-xl mb-8 opacity-90">Join manufacturing companies automating their workflows.</p>
          <Link href="/upload">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Free Conversion →
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-slate-600">
          <p>© 2026 BOMForge AI. Intelligent Manufacturing BOM Conversion.</p>
        </div>
      </footer>
    </div>
  );
}
