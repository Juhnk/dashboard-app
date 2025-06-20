"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { dataSourceApi } from '@/lib/api-client'
import { useSession, signIn } from 'next-auth/react'

interface AddDataSourceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const DATA_SOURCE_TYPES = [
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    icon: '📊',
    description: 'Connect spreadsheets from Google Drive',
    available: true
  },
  {
    id: 'csv_upload',
    name: 'CSV Upload',
    icon: '📄',
    description: 'Upload CSV files directly',
    available: false
  },
  {
    id: 'google_ads',
    name: 'Google Ads',
    icon: '🎯',
    description: 'Connect Google Ads campaigns',
    available: false
  },
  {
    id: 'facebook_ads',
    name: 'Facebook Ads',
    icon: '📘',
    description: 'Connect Facebook & Instagram campaigns',
    available: false
  }
]

export function AddDataSourceModal({ isOpen, onClose, onSuccess }: AddDataSourceModalProps) {
  const { data: session, status } = useSession()
  const [step, setStep] = useState<'select' | 'configure' | 'auth'>('select')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requiresAuth, setRequiresAuth] = useState(false)
  
  // Google Sheets specific state
  const [name, setName] = useState('')
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('')
  const [sheetName, setSheetName] = useState('Sheet1')
  const [metadata, setMetadata] = useState<any>(null)

  const handleReset = () => {
    setStep('select')
    setSelectedType(null)
    setName('')
    setSpreadsheetUrl('')
    setSheetName('Sheet1')
    setMetadata(null)
    setError(null)
    setIsLoading(false)
    setRequiresAuth(false)
  }

  const getErrorMessage = (error: string) => {
    if (error.includes('access token') || error.includes('No Google access token')) {
      return {
        title: '🔐 Google Sign-in Required',
        message: 'To access your Google Sheets, please sign in with your Google account first.',
        action: 'Sign in with Google',
        type: 'auth'
      }
    }
    if (error.includes('permission') || error.includes('403')) {
      return {
        title: '🔒 Permission Denied',
        message: 'Make sure your Google Sheet is publicly accessible or shared with your Google account.',
        action: 'Check Permissions',
        type: 'permission'
      }
    }
    if (error.includes('not found') || error.includes('404')) {
      return {
        title: '📄 Sheet Not Found',
        message: 'Please check that your Google Sheets URL is correct and the sheet exists.',
        action: 'Verify URL',
        type: 'not_found'
      }
    }
    return {
      title: '❌ Connection Failed',
      message: error,
      action: 'Try Again',
      type: 'generic'
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', {
        callbackUrl: window.location.href,
        scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets.readonly'
      })
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.')
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleTypeSelect = (typeId: string) => {
    const type = DATA_SOURCE_TYPES.find(t => t.id === typeId)
    if (!type?.available) return
    
    setSelectedType(typeId)
    setStep('configure')
  }

  const handleTestConnection = async () => {
    if (!spreadsheetUrl.trim()) {
      setError('Please enter a Google Sheets URL')
      return
    }

    setIsLoading(true)
    setError(null)
    setRequiresAuth(false)

    try {
      const data = await dataSourceApi.testGoogleSheetsConnection(spreadsheetUrl.trim())
      
      setMetadata(data.metadata)
      if (!name.trim()) {
        setName(data.metadata.title || 'Untitled Spreadsheet')
      }
      
      // Show success message based on auth method
      if (data.authMethod === 'public') {
        console.log('Connected to public sheet successfully')
      } else {
        console.log('Connected with Google authentication')
      }
    } catch (err: any) {
      const errorInfo = getErrorMessage(err.message || 'Failed to connect to Google Sheets')
      setError(err.message || 'Failed to connect to Google Sheets')
      
      if (errorInfo.type === 'auth') {
        setRequiresAuth(true)
      }
      
      setMetadata(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDataSource = async () => {
    if (!name.trim() || !spreadsheetUrl.trim() || !metadata) {
      setError('Please complete all required fields')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await dataSourceApi.createDataSource({
        name: name.trim(),
        source_type: 'google_sheets',
        connection_config: {
          spreadsheetId: metadata.spreadsheetId,
          sheetName: sheetName || 'Sheet1',
          spreadsheetUrl: spreadsheetUrl.trim()
        }
      })

      onSuccess()
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create data source')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Add Data Source
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              {(() => {
                const errorInfo = getErrorMessage(error)
                return (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-red-800">{errorInfo.title}</h4>
                        <p className="text-sm text-red-600 mt-1">{errorInfo.message}</p>
                      </div>
                    </div>
                    
                    {errorInfo.type === 'auth' && (
                      <Button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        size="sm"
                        className="bg-white border border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                      </Button>
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {step === 'select' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Choose a data source type to connect:
              </p>
              
              {DATA_SOURCE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  disabled={!type.available}
                  className={`w-full p-4 text-left border rounded-lg transition-colors ${
                    type.available
                      ? 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${
                        type.available ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {type.name}
                        {!type.available && (
                          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            Coming Soon
                          </span>
                        )}
                      </h3>
                      <p className={`text-xs mt-1 ${
                        type.available ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'configure' && selectedType === 'google_sheets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">📊</span>
                  <h3 className="font-medium text-gray-900">Google Sheets Connection</h3>
                </div>
                
                {/* Authentication Status */}
                <div className="flex items-center space-x-2 text-xs">
                  {session?.accessToken ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Google Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Not connected</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Google Sign-in prompt for better UX */}
              {!session?.accessToken && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-medium">For private sheets, sign in with Google</p>
                      <p className="text-xs text-blue-600 mt-1">You can still test public sheets without signing in</p>
                      <Button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        size="sm"
                        variant="secondary"
                        className="mt-2 bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Source Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g., Q4 Marketing Data"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Sheets URL
                </label>
                <input
                  type="url"
                  value={spreadsheetUrl}
                  onChange={(e) => setSpreadsheetUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Make sure the spreadsheet is publicly accessible or shared with your Google account
                </p>
              </div>

              {metadata && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800 font-medium">✅ Connection successful!</p>
                  <p className="text-xs text-green-600 mt-1">
                    Found "{metadata.title}" with {metadata.sheets?.length || 0} sheet(s)
                  </p>
                  
                  {metadata.sheets && metadata.sheets.length > 1 && (
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-green-700 mb-1">
                        Select Sheet
                      </label>
                      <select
                        value={sheetName}
                        onChange={(e) => setSheetName(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        {metadata.sheets.map((sheet: any) => (
                          <option key={sheet.title} value={sheet.title}>
                            {sheet.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleTestConnection}
                  disabled={isLoading || !spreadsheetUrl.trim()}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  {isLoading ? 'Testing...' : 'Test Connection'}
                </Button>
                
                <Button
                  onClick={handleCreateDataSource}
                  disabled={isLoading || !metadata || !name.trim()}
                  size="sm"
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Add Data Source'}
                </Button>
              </div>

              <Button
                onClick={() => setStep('select')}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                ← Back to Source Types
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}