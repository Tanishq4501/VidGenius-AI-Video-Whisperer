import React from 'react'

const Targetusr = () => {
    return (
        <section id="target-users" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Perfect For</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div id="user-movie-buffs" className="bg-white rounded-xl p-8 text-center shadow-lg">
                        <div
                            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 svg-inline--fa fa-film" aria-hidden="true" focusable="false"
                                     data-prefix="fas" data-icon="film" role="img" xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 512 512" data-fa-i2svg="">
                                    <path fill="red"
                                          d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM48 368v32c0 8.8 7.2 16 16 16H96c8.8 0 16-7.2 16-16V368c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16zm368-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V368c0-8.8-7.2-16-16-16H416zM48 240v32c0 8.8 7.2 16 16 16H96c8.8 0 16-7.2 16-16V240c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16zm368-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V240c0-8.8-7.2-16-16-16H416zM48 112v32c0 8.8 7.2 16 16 16H96c8.8 0 16-7.2 16-16V112c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16zM416 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V112c0-8.8-7.2-16-16-16H416zM160 128v64c0 17.7 14.3 32 32 32H320c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H192c-17.7 0-32 14.3-32 32zm32 160c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32H320c17.7 0 32-14.3 32-32V320c0-17.7-14.3-32-32-32H192z"></path>
                                </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Movie Buffs</h3>
                        <p className="text-gray-600">Discover hidden meanings and Easter eggs in your favorite films and
                            shows.</p>
                    </div>
                    <div id="user-students" className="bg-white rounded-xl p-8 text-center shadow-lg">
                        <div
                            className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-9 h-9 svg-inline--fa fa-graduation-cap" aria-hidden="true" focusable="false"
                                     data-prefix="fas" data-icon="graduation-cap" role="img"
                                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" data-fa-i2svg="">
                                    <path fill="blue"
                                          d="M320 32c-8.1 0-16.1 1.4-23.7 4.1L15.8 137.4C6.3 140.9 0 149.9 0 160s6.3 19.1 15.8 22.6l57.9 20.9C57.3 229.3 48 259.8 48 291.9v28.1c0 28.4-10.8 57.7-22.3 80.8c-6.5 13-13.9 25.8-22.5 37.6C0 442.7-.9 448.3 .9 453.4s6 8.9 11.2 10.2l64 16c4.2 1.1 8.7 .3 12.4-2s6.3-6.1 7.1-10.4c8.6-42.8 4.3-81.2-2.1-108.7C90.3 344.3 86 329.8 80 316.5V291.9c0-30.2 10.2-58.7 27.9-81.5c12.9-15.5 29.6-28 49.2-35.7l157-61.7c8.2-3.2 17.5 .8 20.7 9s-.8 17.5-9 20.7l-157 61.7c-12.4 4.9-23.3 12.4-32.2 21.6l159.6 57.6c7.6 2.7 15.6 4.1 23.7 4.1s16.1-1.4 23.7-4.1L624.2 182.6c9.5-3.4 15.8-12.5 15.8-22.6s-6.3-19.1-15.8-22.6L343.7 36.1C336.1 33.4 328.1 32 320 32zM128 408c0 35.3 86 72 192 72s192-36.7 192-72L496.7 262.6 354.5 314c-11.1 4-22.8 6-34.5 6s-23.5-2-34.5-6L143.3 262.6 128 408z"></path>
                                </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Students</h3>
                        <p className="text-gray-600">Analyze films for essays, understand complex narratives and
                            themes.</p>
                    </div>
                    <div id="user-creators" className="bg-white rounded-xl p-8 text-center shadow-lg">
                        <div
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 svg-inline--fa fa-video" aria-hidden="true" focusable="false"
                                     data-prefix="fas" data-icon="video" role="img" xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 576 512" data-fa-i2svg="">
                                    <path fill="green"
                                          d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2V384c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1V320 192 174.9l14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z"></path>
                                </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Content Creators</h3>
                        <p className="text-gray-600">Create reaction videos, reviews, and analysis content with AI
                            insights.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
export default Targetusr
