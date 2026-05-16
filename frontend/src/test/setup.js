import '@testing-library/jest-dom'
import * as React from 'react'

// Komponen legacy tanpa import React (Vitest/esbuild classic JSX)
globalThis.React = React
