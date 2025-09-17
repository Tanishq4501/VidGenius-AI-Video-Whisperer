import React from 'react'

const Cta = () => {
    return (
        <section id="cta" className="py-20 bg-gradient-to-r from-indigo-500 to-violet-500">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold text-white mb-6">Ready to Understand Everything?</h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Join thousands of users who never watch
                    confused anymore</p>
                <button
                    className="bg-white text-indigo-500 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors">
                    Start Free Today
                </button>
            </div>
        </section>
    )
}
export default Cta
