import React from 'react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

const Test = () => {
  const onDrop = useCallback((acceptedFiles) => {
    // Handle file upload here
  }, [])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  return (
    <div>Test   </div>
  )
}

export default Test