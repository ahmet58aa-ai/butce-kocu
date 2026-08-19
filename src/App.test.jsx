import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('BütçeKoçu', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the dashboard and primary transaction actions', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'BütçeKoçu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Gelir Ekle' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '− Harcama Ekle' })).toBeInTheDocument()
    expect(screen.getByText('Tasarruf hedefleri')).toBeInTheDocument()
  })
})
