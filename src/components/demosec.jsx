import React from 'react'

const Demosec = () => {
    return (
        <section id="demo-section" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">See It In Action</h2>
                    <p className="text-xl text-gray-600">Try our demo with popular movie scenes</p>
                </div>
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gray-900 rounded-xl p-6">
                        <div className="aspect-video bg-gray-800 rounded-lg mb-6 flex items-center justify-center">
                            <img className="w-full h-full object-cover rounded-lg"
                                 src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d1e1cf36cc-62c7d6d6951ff317b552.png"
                                 alt="movie scene analysis interface with video player and explanation panels"/>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 text-white">
                            <div id="analysis-basic" className="bg-gray-800 rounded-lg p-4">
                                <h4 className="font-semibold mb-2 text-green-400">Basic Plot</h4>
                                <p className="text-sm text-gray-300">Character discovers hidden truth about their
                                    past...</p>
                            </div>
                            <div id="analysis-symbolism" className="bg-gray-800 rounded-lg p-4">
                                <h4 className="font-semibold mb-2 text-purple-400">Symbolism</h4>
                                <p className="text-sm text-gray-300">The mirror represents self-reflection and
                                    duality...</p>
                            </div>
                            <div id="analysis-theories" className="bg-gray-800 rounded-lg p-4">
                                <h4 className="font-semibold mb-2 text-orange-400">Fan Theory</h4>
                                <p className="text-sm text-gray-300">Reddit theory: This scene hints at the
                                    sequel...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
export default Demosec
