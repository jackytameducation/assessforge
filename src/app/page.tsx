import Link from 'next/link';
import Footer from '@/components/Footer';
import { 
  Upload, 
  FileText, 
  Download, 
  ArrowRight,
  Zap
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-8 py-8 sm:py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AssessForge</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Forge your assessments into QTI 2.1 format for seamless Inspera integration
            </p>
            <Link 
              href="/upload"
              className="group inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 text-lg rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Start Forging
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Interactive Process Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Upload, title: 'Upload', desc: 'Drop your .docx or .txt files', color: 'from-green-500 to-emerald-500', step: 1, href: '/upload' },
              { icon: FileText, title: 'Preview', desc: 'Review parsed questions', color: 'from-blue-500 to-indigo-500', step: 2, href: '/preview' },
              { icon: Zap, title: 'Convert', desc: 'Generate QTI 2.1 format', color: 'from-purple-500 to-violet-500', step: 3, href: '/convert' },
              { icon: Download, title: 'Download', desc: 'Get your QTI package', color: 'from-orange-500 to-amber-500', step: 4, href: '/download' }
            ].map((item, index) => (
              <Link key={item.step} href={item.href} className="group relative bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer block">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground">STEP {item.step}</span>
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>

                  {/* Supported Question Types */}
          <div className="bg-card rounded-2xl p-8 text-center border border-border shadow-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">
              Supported Question Types
            </h2>
            <p className="text-muted-foreground mb-8">
              Transform your assessments with comprehensive question type support
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { type: 'MCQ', name: 'Multiple Choice Questions', icon: '✓', color: 'from-blue-500 to-blue-600' },
                { type: 'EMQ', name: 'Extended Matching Questions', icon: '≡', color: 'from-purple-500 to-purple-600' },
                { type: 'SAQ', name: 'Short Answer Questions', icon: '✎', color: 'from-green-500 to-green-600' }
              ].map((item) => (
                <div key={item.type} className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border border-border">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 mx-auto`}>
                    <span className="text-white text-xl font-bold">{item.icon}</span>
                  </div>
                  <h3 className="font-bold text-card-foreground text-lg mb-2">{item.type}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
