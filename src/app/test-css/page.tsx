export default function TestCSS() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100 p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">CSS Test Page</h1>
      
      <div className="space-y-4">
        {/* Test gradient backgrounds */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-2">Gradient Background Test</h2>
          <p>This should have a blue to cyan gradient background</p>
        </div>

        {/* Test glass effect */}
        <div className="glass p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-2">Glass Effect Test</h2>
          <p>This should have a glassmorphism effect with blur</p>
        </div>

        {/* Test animations */}
        <div className="bg-white p-6 rounded-lg shadow-xl animate-fade-in">
          <h2 className="text-2xl font-semibold mb-2">Fade In Animation Test</h2>
          <p>This should fade in when the page loads</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-xl animate-slide-up">
          <h2 className="text-2xl font-semibold mb-2">Slide Up Animation Test</h2>
          <p>This should slide up when the page loads</p>
        </div>

        {/* Test custom colors */}
        <div className="bg-primary text-white p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-2">Custom Color Test</h2>
          <p>This should use the custom primary color (#28C6B1)</p>
        </div>

        {/* Test backdrop blur */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
          <div className="relative backdrop-blur-md bg-white/30 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold mb-2 text-white">Backdrop Blur Test</h2>
            <p className="text-white">This should have a blurred background</p>
          </div>
        </div>
      </div>
    </div>
  );
}