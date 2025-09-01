import React from 'react'

function CourseListing() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Course Listing</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Course cards will be rendered here */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Sample Course</h3>
          <p className="text-gray-600">Course description goes here...</p>
        </div>
      </div>
    </div>
  )
}

export default CourseListing
