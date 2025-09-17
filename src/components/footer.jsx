import React from 'react'

const Footer = () => {
    return (
        <footer id="footer" className="bg-gray-900 text-white py-12 ">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div
                                className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-4.5 h-4.5 svg-inline--fa fa-brain" aria-hidden="true" focusable="false"
                                         data-prefix="fas" data-icon="brain" role="img"
                                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
                                        <path fill="currentColor"
                                              d="M184 0c30.9 0 56 25.1 56 56V456c0 30.9-25.1 56-56 56c-28.9 0-52.7-21.9-55.7-50.1c-5.2 1.4-10.7 2.1-16.3 2.1c-35.3 0-64-28.7-64-64c0-7.4 1.3-14.6 3.6-21.2C21.4 367.4 0 338.2 0 304c0-31.9 18.7-59.5 45.8-72.3C37.1 220.8 32 207 32 192c0-30.7 21.6-56.3 50.4-62.6C80.8 123.9 80 118 80 112c0-29.9 20.6-55.1 48.3-62.1C131.3 21.9 155.1 0 184 0zM328 0c28.9 0 52.6 21.9 55.7 49.9c27.8 7 48.3 32.1 48.3 62.1c0 6-.8 11.9-2.4 17.4c28.8 6.2 50.4 31.9 50.4 62.6c0 15-5.1 28.8-13.8 39.7C493.3 244.5 512 272.1 512 304c0 34.2-21.4 63.4-51.6 74.8c2.3 6.6 3.6 13.8 3.6 21.2c0 35.3-28.7 64-64 64c-5.6 0-11.1-.7-16.3-2.1c-3 28.2-26.8 50.1-55.7 50.1c-30.9 0-56-25.1-56-56V56c0-30.9 25.1-56 56-56z"></path>
                                    </svg>
                            </div>
                            <span className="text-lg font-bold">ClipExplain</span>
                        </div>
                        <p className="text-gray-400">AI-powered video explanations for the curious mind.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><span className="hover:text-white transition-colors cursor-pointer">Features</span></li>
                            <li><span className="hover:text-white transition-colors cursor-pointer">Pricing</span></li>
                            <li><span className="hover:text-white transition-colors cursor-pointer">API</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><span className="hover:text-white transition-colors cursor-pointer">Help Center</span>
                            </li>
                            <li><span className="hover:text-white transition-colors cursor-pointer">Contact</span></li>
                            <li><span className="hover:text-white transition-colors cursor-pointer">Status</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Connect</h4>
                        <div className="flex space-x-4">
                            <span className="text-gray-400 hover:text-white transition-colors cursor-pointer" aria-label="Twitter">
                                <svg className="w-5 h-5" fill="currentColor" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="twitter" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor"
                                                                             d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path></svg>
                            </span>
                            <span className="text-gray-400 hover:text-white transition-colors cursor-pointer" aria-label="LinkedIn">
                                <svg className="w-5 h-5" fill="currentColor" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="linkedin"
                                                      role="img" xmlns="http://www.w3.org/2000/svg"
                                                      viewBox="0 0 448 512" data-fa-i2svg=""><path fill="currentColor"
                                                                                                   d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path></svg>
                            </span>
                            <span className="text-gray-400 hover:text-white transition-colors cursor-pointer" aria-label="YouTube">
                                <svg className="w-5 h-5" fill="currentColor" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="youtube" role="img"
                                                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"
                                                      data-fa-i2svg=""><path fill="currentColor"
                                                                             d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path></svg>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>© 2024 ClipExplain. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
export default Footer
