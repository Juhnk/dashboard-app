'use client'

import React from 'react'
import { SystemHealthDashboard } from '@/components/monitoring/system-health-dashboard'
import { GoogleSheetsConnector } from '@/components/data-sources/google-sheets-connector'

/**
 * Monitoring Page - Elite system monitoring interface
 * 
 * This page demonstrates our production-grade monitoring capabilities:
 * 
 * 1. Real-time system health monitoring
 * 2. Data pipeline status tracking
 * 3. Performance metrics visualization
 * 4. Interactive data source testing
 * 5. Complete operational visibility
 * 
 * This is the kind of monitoring interface that separates elite systems
 * from standard applications - providing operators with complete
 * visibility into system health and performance.
 */

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of our anti-fragile data infrastructure
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-transparent text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm border-blue-500">
                System Health
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Data Sources
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Performance
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Logs
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* System Health Dashboard */}
          <section>
            <SystemHealthDashboard />
          </section>

          {/* Data Source Testing */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Data Source Testing</h2>
              <p className="text-gray-600">
                Test data connectors with real-time monitoring and circuit breaker protection
              </p>
            </div>
            <GoogleSheetsConnector />
          </section>

          {/* Architecture Overview */}
          <section className="bg-white border rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Anti-Fragile Architecture</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Circuit Breakers</h3>
                <p className="text-gray-600 text-sm">
                  Automatic failure detection and recovery prevents cascade failures across services
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Intelligent Retries</h3>
                <p className="text-gray-600 text-sm">
                  Exponential backoff and smart retry logic handle transient failures gracefully
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Glass Box Monitoring</h3>
                <p className="text-gray-600 text-sm">
                  Complete request traceability and structured logging provide deep system visibility
                </p>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-3">Key Architecture Principles</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Assume Failure:</strong> Every external service will fail - our system thrives despite this</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Graceful Degradation:</strong> Core functionality remains available even when components fail</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Observable by Design:</strong> Every operation is traced, logged, and monitored</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Self-Healing:</strong> Automatic recovery mechanisms restore service without human intervention</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}